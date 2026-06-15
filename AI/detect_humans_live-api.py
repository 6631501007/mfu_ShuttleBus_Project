"""
APC-QA Project — Phase 3: Live Camera Human Detection & Tracking
=================================================================
Uses YOLOv8 + ByteTrack to detect and track humans from a live camera feed.

Features:
    - Web MJPEG stream with bounding boxes and tracking IDs
    - Elapsed time shown on HUD
    - Sends current_count to a localhost website every 5 seconds

Requirements:
    cd ~/demo
    python3 -m venv .venv
    source .venv/bin/activate
    pip install -U pip
    pip install opencv-python ultralytics requests fastapi uvicorn

Usage:
    python detect_humans_live.py
    
    Optional flags:
        --source      webcam index or RTSP URL           (default: 0)
        --conf        confidence threshold 0.0–1.0       (default: 0.25)
        --iou         IOU threshold for NMS              (default: 0.45)
        --model       yolov8 variant                     (default: yolov8x)
        --skip-frames process every Nth frame            (default: 1)
        --api-url     URL to send count data to          (default: http://localhost:3000/api/livefeed/update)
        --api-interval send data every N seconds         (default: 5)
        --mjpeg-port  port for the browser stream         (default: 8090)
        --stream-fps  browser MJPEG max FPS              (default: 12)
        --jpeg-quality browser MJPEG JPEG quality 1-100   (default: 75)
        --stream-width browser MJPEG output width         (default: 960)
"""

import argparse
import sys
import os
import time
import cv2
import requests
from ultralytics import YOLO
import numpy as np

# Optional MJPEG streamer
from threading import Thread, Lock
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
import uvicorn

# Shared MJPEG frame + lock
_stream_lock = Lock()
_last_frame = None

# ── Resolve script directory (works on Windows and Linux) ────────────────────
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

# ── YOLO COCO class index for "person" ───────────────────────────────────────
PERSON_CLASS_ID   = 0

# ── Colours (BGR) ────────────────────────────────────────────────────────────
BOX_COLOR    = (0, 200, 0)      # green  — active person box
TEXT_COLOR   = (255, 255, 255)  # white  — label text
BANNER_COLOR = (0, 0, 0)        # black  — HUD background

# ── Presence confirmation settings ───────────────────────────────────────────
# A person is confirmed PRESENT  after being detected for this many consecutive frames.
# A person is confirmed ABSENT   after being missing  for this many consecutive frames.
# This prevents flickering caused by brief detection gaps (e.g. motion blur, occlusion).
FRAMES_TO_CONFIRM_ENTER = 3   # frames detected  → count goes up
FRAMES_TO_CONFIRM_EXIT  = 10  # frames undetected → count goes down



# ─────────────────────────────────────────────────────────────────────────────
# API Communication
# ─────────────────────────────────────────────────────────────────────────────

def send_count_to_api(api_url: str, current_count: int, elapsed: float) -> bool:
    """
    Send the current human count to the web server via HTTP POST.
    
    Returns True if successful, False otherwise.
    Errors are logged but don't interrupt the detection stream.
    """
    try:
        payload = {
            'count': current_count,
            'timestamp': time.time(),
            'elapsed': elapsed,
        }
        response = requests.post(
            api_url,
            json=payload,
            timeout=2  # 2-second timeout to avoid blocking detection
        )
        if response.status_code == 200:
            print(f"[API] ✓ Sent count={current_count} to {api_url}")
            return True
        else:
            print(f"[API] ⚠ Server returned {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print(f"[API] ⚠ Could not connect to {api_url} (is the server running?)")
        return False
    except requests.exceptions.Timeout:
        print(f"[API] ⚠ Request timed out")
        return False
    except Exception as e:
        print(f"[API] ⚠ Error: {e}")
        return False


def send_stop_to_api(api_url: str) -> None:
    """
    Notify the web server that the detection stream stopped.
    Best-effort only so cleanup never hangs the camera release path.
    """
    if not api_url:
        return

    stop_url = api_url.rstrip('/').replace('/update', '/stop')
    try:
        requests.post(stop_url, json={'timestamp': time.time()}, timeout=2)
        print(f"[API] ✓ Sent stop signal to {stop_url}")
    except Exception as e:
        print(f"[API] ⚠ Stop signal failed: {e}")


def start_mjpeg_server(
    port: int = 8090,
    stream_fps: float = 12.0,
    jpeg_quality: int = 75,
):
    """
    Start a simple FastAPI MJPEG server in a background thread that serves
    the last annotated frame at /stream as multipart/x-mixed-replace.
    """
    global _last_frame

    app = FastAPI()

    frame_delay = 1.0 / max(stream_fps, 1.0)
    encode_params = [int(cv2.IMWRITE_JPEG_QUALITY), int(np.clip(jpeg_quality, 1, 100))]

    def mjpeg_generator():
        global _last_frame
        while True:
            with _stream_lock:
                frame = _last_frame
            if frame is None:
                frame = np.zeros((480, 640, 3), dtype=np.uint8)
            ret, jpeg = cv2.imencode('.jpg', frame, encode_params)
            if not ret:
                time.sleep(0.05)
                continue
            data = jpeg.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n'
                   b'Content-Length: ' + str(len(data)).encode() + b'\r\n\r\n' + data + b'\r\n')
            time.sleep(frame_delay)

    @app.get('/stream')
    async def stream():
        return StreamingResponse(mjpeg_generator(), media_type='multipart/x-mixed-replace; boundary=frame')

    def run_app():
        # Run Uvicorn server with reduced logging
        uvicorn.run(app, host='0.0.0.0', port=port, log_level='error')

    t = Thread(target=run_app, daemon=True)
    t.start()
    # Provide an initial blank frame so clients can connect immediately
    try:
        with _stream_lock:
            _last_frame = np.zeros((480, 640, 3), dtype=np.uint8)
    except Exception:
        pass

    print(f"[INFO] MJPEG stream available at http://localhost:{port}/stream")
    print(f"[INFO] MJPEG settings       : {stream_fps:.1f} FPS | JPEG quality {jpeg_quality}")


# ─────────────────────────────────────────────────────────────────────────────
# HUD drawing
# ─────────────────────────────────────────────────────────────────────────────

def format_elapsed(seconds: float) -> str:
    """Convert elapsed seconds to a HH:MM:SS string."""
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = int(seconds % 60)
    return f"{h:02d}:{m:02d}:{s:02d}"


def draw_hud(
    frame,
    current_count: int,
    elapsed: float,
) -> None:
    """
    Draw the heads-up display (HUD) overlay onto the frame in-place.

    Displays two metrics in the top-left corner:
        - Time     : elapsed recording time
        - Current  : how many people are visible right now
    """
    lines = [
        f"Time     : {format_elapsed(elapsed)}",
        f"Current  : {current_count}",
    ]

    padding = 8
    line_h  = 28
    box_w   = 230
    box_h   = padding * 2 + line_h * len(lines)

    cv2.rectangle(frame, (10, 10), (10 + box_w, 10 + box_h), BANNER_COLOR, cv2.FILLED)

    for i, line in enumerate(lines):
        y = 10 + padding + line_h * i + 18
        cv2.putText(frame, line, (18, y),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.65, (0, 255, 80), 2, cv2.LINE_AA)


def draw_person_box(
    frame,
    x1: int, y1: int, x2: int, y2: int,
    track_id: int,
    conf: float,
) -> None:
    """
    Draw a single person bounding box with its tracking ID and confidence label.
    Identical to Phase 2 so the visual output looks the same.
    """
    cv2.rectangle(frame, (x1, y1), (x2, y2), BOX_COLOR, 2)

    label = f"ID {track_id}  {conf:.0%}"
    label_size, baseline = cv2.getTextSize(
        label, cv2.FONT_HERSHEY_SIMPLEX, 0.55, 1
    )
    label_y = max(y1 - 6, label_size[1] + baseline)

    cv2.rectangle(
        frame,
        (x1, label_y - label_size[1] - baseline),
        (x1 + label_size[0], label_y + baseline),
        BOX_COLOR, cv2.FILLED,
    )
    cv2.putText(frame, label, (x1, label_y),
                cv2.FONT_HERSHEY_SIMPLEX, 0.55, TEXT_COLOR, 1, cv2.LINE_AA)


def prepare_stream_frame(frame, stream_width: int):
    """Return a resized copy for browser streaming without changing detection input."""
    if stream_width <= 0 or frame.shape[1] <= stream_width:
        return frame.copy()

    scale = stream_width / frame.shape[1]
    stream_height = max(1, int(frame.shape[0] * scale))
    return cv2.resize(frame, (stream_width, stream_height), interpolation=cv2.INTER_AREA)


# ─────────────────────────────────────────────────────────────────────────────
# Core live stream processing
# ─────────────────────────────────────────────────────────────────────────────

def run_live(
    source,                 # int (webcam index) or str (RTSP URL)
    model: YOLO,
    conf_threshold: float,
    iou_threshold: float,
    skip_frames: int,
    api_url: str = None,
    api_interval: float = 5.0,
    mjpeg_port: int = 8090,
    stream_fps: float = 12.0,
    jpeg_quality: int = 75,
    stream_width: int = 960,
) -> None:
    """
    Open a live camera source, run detection/tracking on each frame,
    and publish the annotated feed through the browser MJPEG endpoint.

    Presence logic (per track ID):
        - A person is counted as PRESENT  only after being detected for
          FRAMES_TO_CONFIRM_ENTER consecutive frames  → avoids false positives.
        - A person is counted as ABSENT   only after being missing  for
          FRAMES_TO_CONFIRM_EXIT  consecutive frames  → avoids flickering when
          ByteTrack briefly loses a track (motion blur, partial occlusion, etc.)

    current_count therefore reflects the number of people *stably* visible,
    not the raw frame-by-frame detection count.
    """
    global _last_frame

    # ── Open camera ───────────────────────────────────────────────────────────
    def open_camera(src):
        # RTSP sources usually behave best through FFmpeg; webcams usually
        # prefer V4L2 on Linux.
        is_rtsp = isinstance(src, str) and src.lower().startswith("rtsp://")
        backends = [cv2.CAP_FFMPEG, cv2.CAP_ANY] if is_rtsp else [cv2.CAP_V4L2, cv2.CAP_ANY]
        for backend in backends:
            try:
                cap = cv2.VideoCapture(src, backend)
            except Exception:
                cap = cv2.VideoCapture(src)
            if cap.isOpened():
                cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
                print(f"[INFO] Opened camera source: {src} with backend {backend}")
                return cap
            cap.release()
        return None

    cap = open_camera(source)
    if cap is None or not cap.isOpened():
        print(f"[ERROR] Could not open camera source: {source}")
        print("[HINT] Try running with a different source, e.g. --source /dev/video0 or --source 1")
        print("[HINT] Make sure no other process is using the camera and that your user has permission to access /dev/video*")
        sys.exit(1)

    # ── Camera properties ─────────────────────────────────────────────────────
    width  = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps    = cap.get(cv2.CAP_PROP_FPS)
    if fps <= 0:
        fps = 30.0   # webcams often report 0 — safe fallback

    print(f"[INFO] Camera source      : {source}")
    print(f"[INFO] Resolution         : {width}x{height}  |  FPS: {fps:.1f}")
    print(f"[INFO] Mode               : Standard YOLO + ByteTrack")
    print(f"[INFO] Browser stream     : http://localhost:{mjpeg_port}/stream")
    print(f"[INFO] Browser stream FPS : {stream_fps:.1f}")
    print(f"[INFO] Browser JPEG quality: {jpeg_quality}")
    print(f"[INFO] Browser stream width: {stream_width}px")
    if api_url:
        print(f"[INFO] API endpoint       : {api_url} (every {api_interval}s)")
    print(f"[INFO] Confirm enter after : {FRAMES_TO_CONFIRM_ENTER} frames")
    print(f"[INFO] Confirm exit  after : {FRAMES_TO_CONFIRM_EXIT}  frames")
    print("[INFO] Press Ctrl+C in this terminal to stop.\n")

    # ── Presence tracking state ───────────────────────────────────────────────
    #
    #   seen_frames[tid]   – how many consecutive frames this ID has been detected.
    #                        Counts up while visible; resets to 0 when first lost.
    #   absent_frames[tid] – how many consecutive frames this ID has been MISSING.
    #                        Counts up while absent; resets to 0 when re-detected.
    #   confirmed_ids      – set of IDs that have passed FRAMES_TO_CONFIRM_ENTER
    #                        and have NOT yet passed FRAMES_TO_CONFIRM_EXIT.
    #                        len(confirmed_ids) == current_count shown on HUD.
    #
    seen_frames   : dict[int, int] = {}   # tid → consecutive frames seen
    absent_frames : dict[int, int] = {}   # tid → consecutive frames absent
    confirmed_ids : set[int]       = set()

    # ── Timing ────────────────────────────────────────────────────────────────
    start_time    = time.time()
    frame_num     = 0
    last_api_send = 0

    start_mjpeg_server(mjpeg_port, stream_fps=stream_fps, jpeg_quality=jpeg_quality)

    # ── Frame loop ────────────────────────────────────────────────────────────
    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                print("[WARNING] Camera feed lost or stream ended.")
                break

            frame_num += 1
            elapsed = time.time() - start_time

            # ── Frame skipping ────────────────────────────────────────────────
            if skip_frames > 1 and frame_num % skip_frames != 0:
                current_count = len(confirmed_ids)
                draw_hud(frame, current_count, elapsed)
                with _stream_lock:
                    _last_frame = prepare_stream_frame(frame, stream_width)
                continue

            # ── Standard YOLO + ByteTrack detection ───────────────────────────
            results = model.track(
                frame,
                conf=conf_threshold,
                iou=iou_threshold,
                classes=[PERSON_CLASS_ID],
                tracker="bytetrack.yaml",
                persist=True,
                verbose=False,
            )

            # ── Collect IDs detected in this frame ────────────────────────────
            detected_ids : set[int] = set()

            for result in results:
                if result.boxes.id is None:
                    continue
                for box, track_id in zip(result.boxes, result.boxes.id):
                    tid  = int(track_id)
                    conf = float(box.conf[0])
                    x1, y1, x2, y2 = map(int, box.xyxy[0])

                    detected_ids.add(tid)
                    draw_person_box(frame, x1, y1, x2, y2, tid, conf)

            # ── Update presence counters ──────────────────────────────────────
            all_known_ids = set(seen_frames) | set(absent_frames) | detected_ids

            for tid in all_known_ids:

                if tid in detected_ids:
                    # ── Person IS visible this frame ──────────────────────────
                    seen_frames[tid]   = seen_frames.get(tid, 0) + 1
                    absent_frames[tid] = 0   # reset absence streak

                    # Promote to confirmed once seen long enough
                    if seen_frames[tid] >= FRAMES_TO_CONFIRM_ENTER:
                        if tid not in confirmed_ids:
                            confirmed_ids.add(tid)
                            print(f"[PRESENCE] ✓ ID {tid} ENTERED  — confirmed after "
                                  f"{seen_frames[tid]} frames  |  count={len(confirmed_ids)}")

                else:
                    # ── Person is NOT visible this frame ──────────────────────
                    absent_frames[tid] = absent_frames.get(tid, 0) + 1
                    seen_frames[tid]   = 0   # reset seen streak

                    # Remove from confirmed once absent long enough
                    if absent_frames[tid] >= FRAMES_TO_CONFIRM_EXIT:
                        if tid in confirmed_ids:
                            confirmed_ids.discard(tid)
                            print(f"[PRESENCE] ✗ ID {tid} LEFT     — absent for "
                                  f"{absent_frames[tid]} frames  |  count={len(confirmed_ids)}")
                        # Clean up stale entries to prevent unbounded growth
                        seen_frames.pop(tid, None)
                        absent_frames.pop(tid, None)

            # ── Stable current count ──────────────────────────────────────────
            current_count = len(confirmed_ids)

            draw_hud(frame, current_count, elapsed)

            # ── Send API update if interval has elapsed ───────────────────────
            if api_url and (time.time() - last_api_send) >= api_interval:
                send_count_to_api(api_url, current_count, elapsed)
                last_api_send = time.time()

            # ── Publish latest annotated frame to the web stream ───────────────
            with _stream_lock:
                _last_frame = prepare_stream_frame(frame, stream_width)
    except KeyboardInterrupt:
        print("\n[INFO] Ctrl+C received — stopping stream.")

    # ── Cleanup ───────────────────────────────────────────────────────────────
    cap.release()
    send_stop_to_api(api_url)

    total_time = time.time() - start_time
    print(f"[INFO] Stream ended after {format_elapsed(total_time)}")


# ─────────────────────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="APC-QA Phase 3 — Live human detection & tracking using YOLOv8"
    )
    parser.add_argument(
        "--source",
        default="0",
        help="Camera source: webcam index (0, 1, 2…) or RTSP URL (default: 0)"
    )
    parser.add_argument(
        "--conf",
        type=float, default=0.25,
        help="Confidence threshold (0.0 – 1.0)"
    )
    parser.add_argument(
        "--iou",
        type=float, default=0.45,
        help="IOU threshold for NMS (default: 0.45)"
    )
    parser.add_argument(
        "--model",
        default="yolov8n",
        help="YOLOv8 variant: yolov8n / yolov8s / yolov8m / yolov8l / yolov8x"
    )
    parser.add_argument(
        "--skip-frames",
        type=int, default=1,
        help="Process every Nth frame (default: 1 = every frame)"
    )
    parser.add_argument(
        "--api-url",
        default="http://localhost:3000/api/livefeed/update",
        help="URL to send count data to (default: http://localhost:3000/api/livefeed/update)"
    )
    parser.add_argument(
        "--api-interval",
        type=float, default=5.0,
        help="Send API update every N seconds (default: 5)"
    )

    parser.add_argument('--mjpeg-port', type=int, default=8090,
                        help='Start local MJPEG stream on this port (default: 8090)')
    parser.add_argument('--stream-fps', type=float, default=12.0,
                        help='Maximum FPS for the browser MJPEG stream (default: 12)')
    parser.add_argument('--jpeg-quality', type=int, default=75,
                        help='JPEG quality for browser stream frames, 1-100 (default: 75)')
    parser.add_argument('--stream-width', type=int, default=960,
                        help='Resize browser stream frames to this width; 0 disables resize (default: 960)')

    args = parser.parse_args()

    # ── Resolve source type ───────────────────────────────────────────────────
    source = int(args.source) if args.source.isdigit() else args.source

    # ── Startup info ──────────────────────────────────────────────────────────
    print(f"[INFO] Script location : {SCRIPT_DIR}")
    print(f"[INFO] Camera source   : {source}")
    print(f"[INFO] Model           : {args.model}")
    print(f"[INFO] Confidence      : {args.conf}")
    print(f"[INFO] IOU threshold   : {args.iou}")
    print(f"[INFO] Skip frames     : {args.skip_frames}")
    print(f"[INFO] MJPEG port      : {args.mjpeg_port}")
    print(f"[INFO] Stream FPS      : {args.stream_fps}")
    print(f"[INFO] JPEG quality    : {args.jpeg_quality}")
    print(f"[INFO] Stream width    : {args.stream_width}")
    if args.api_url:
        print(f"[INFO] API URL          : {args.api_url}")
        print(f"[INFO] API Interval     : {args.api_interval}s\n")
    else:
        print()

    # ── Load model ────────────────────────────────────────────────────────────
    print(f"[INFO] Loading YOLO model : {args.model}.pt")
    # Force CPU mode to avoid CUDA compatibility issues
    model = YOLO(f"{args.model}.pt")
    model.to('cpu')

    # ── Start live stream ─────────────────────────────────────────────────────
    run_live(
        source         = source,
        model          = model,
        conf_threshold = args.conf,
        iou_threshold  = args.iou,
        skip_frames    = args.skip_frames,
        api_url        = args.api_url,
        api_interval   = args.api_interval,
        mjpeg_port     = args.mjpeg_port,
        stream_fps     = args.stream_fps,
        jpeg_quality   = args.jpeg_quality,
        stream_width   = args.stream_width,
    )


if __name__ == "__main__":
    main()
