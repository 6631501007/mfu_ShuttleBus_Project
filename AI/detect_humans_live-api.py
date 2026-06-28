"""
APC-QA Project — Live Camera Human Detection Metadata Service
=============================================================
Uses YOLOv8 to detect people from a live camera feed and publishes detection
metadata for a Vue canvas overlay.

Recommended production architecture from doc.md:

    RTSP Camera
    ├──→ MediaMTX → WebRTC → Vue Admin Dashboard
    └──→ Python YOLOv8 → Socket.IO / HTTP fallback → Vue canvas overlay

The target production setup should serve video through MediaMTX/WebRTC. This
script also exposes a raw MJPEG preview at /stream because the current Vue page
and Express backend still expect http://localhost:8090/stream.

Requirements:
    cd ~/demo/AI
    python3 -m venv .venv
    source .venv/bin/activate
    pip install -U pip
    pip install opencv-python ultralytics requests fastapi uvicorn numpy
    pip install "python-socketio[client]"  # optional, for Socket.IO publishing

Usage:
    python detect_humans_live-api.py --source "rtsp://user:pass@camera-ip/path"

Example metadata message:
    {
      "cameraId": "cam01",
      "timestamp": 1710000000000,
      "frameWidth": 1280,
      "frameHeight": 720,
      "peopleCount": 2,
      "detections": [
        {
          "class": "person",
          "confidence": 0.91,
          "bbox": {"x": 100, "y": 80, "width": 220, "height": 400}
        }
      ]
    }
"""

import argparse
import sys
import os
import time
import cv2
import requests
import numpy as np
from ultralytics import YOLO
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from threading import Lock, Thread
from typing import Any

# ── Resolve script directory (works on Windows and Linux) ────────────────────
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

# ── YOLO COCO class index for "person" ───────────────────────────────────────
PERSON_CLASS_ID   = 0
DEFAULT_LIVEFEED_CONFIG = {
    "dwellSeconds": 30.0,
    "zones": [
        {
            "name": "Counting Zone",
            "x": 20.0,
            "y": 20.0,
            "width": 60.0,
            "height": 60.0,
            "color": "#16a34a",
            "enabled": True,
        }
    ],
}

# Shared raw camera frame for the current Vue MJPEG page compatibility path.
_stream_lock = Lock()
_last_stream_frame = None


# ─────────────────────────────────────────────────────────────────────────────
# Detection publishing
# ─────────────────────────────────────────────────────────────────────────────

class DetectionPublisher:
    """Publish detection metadata without blocking the live video path."""

    def __init__(
        self,
        socketio_url: str | None,
        socketio_event: str,
        api_url: str | None,
        api_interval: float,
        emit_interval: float,
        notify_stop: bool,
    ) -> None:
        self.socketio_url = socketio_url
        self.socketio_event = socketio_event
        self.api_url = api_url
        self.api_interval = max(api_interval, 0.1)
        self.emit_interval = max(emit_interval, 0.0)
        self.notify_stop = notify_stop
        self._last_api_send = 0.0
        self._last_emit = 0.0
        self._sio = None

    def connect(self) -> None:
        if not self.socketio_url:
            return

        try:
            import socketio  # type: ignore
        except ImportError:
            print("[SOCKET.IO] python-socketio is not installed; falling back to HTTP only.")
            print("[SOCKET.IO] Install with: pip install \"python-socketio[client]\"")
            return

        try:
            self._sio = socketio.Client(
                reconnection=True,
                reconnection_attempts=0,
                logger=False,
                engineio_logger=False,
            )
            self._sio.connect(self.socketio_url, transports=["websocket", "polling"])
            print(f"[SOCKET.IO] Connected to {self.socketio_url}")
        except Exception as e:
            self._sio = None
            print(f"[SOCKET.IO] Could not connect to {self.socketio_url}: {e}")
            print("[SOCKET.IO] Continuing with HTTP fallback if configured.")

    def publish(self, message: dict[str, Any], elapsed: float) -> None:
        now = time.time()

        if self._sio and (now - self._last_emit) >= self.emit_interval:
            try:
                self._sio.emit(self.socketio_event, message)
                self._last_emit = now
            except Exception as e:
                print(f"[SOCKET.IO] Emit failed: {e}")

        if self.api_url and (now - self._last_api_send) >= self.api_interval:
            self._post_http(message, elapsed)
            self._last_api_send = now

    def stop(self) -> None:
        if self.api_url and self.notify_stop:
            stop_url = self.api_url.rstrip('/').replace('/update', '/stop')
            try:
                requests.post(stop_url, json={'timestamp': int(time.time() * 1000)}, timeout=2)
                print(f"[API] Sent stop signal to {stop_url}")
            except Exception as e:
                print(f"[API] Stop signal failed: {e}")
        elif self.api_url:
            print("[API] Stop signal skipped because --no-stop-notify is enabled.")

        if self._sio:
            try:
                self._sio.disconnect()
            except Exception:
                pass

    def _post_http(self, message: dict[str, Any], elapsed: float) -> bool:
        try:
            payload = {
                **message,
                "count": message["peopleCount"],
                "elapsed": elapsed,
            }
            response = requests.post(self.api_url, json=payload, timeout=1.5)
            if 200 <= response.status_code < 300:
                print(f"[API] Sent peopleCount={message['peopleCount']} to {self.api_url}")
                return True

            print(f"[API] Server returned {response.status_code}")
            return False
        except requests.exceptions.ConnectionError:
            print(f"[API] Could not connect to {self.api_url} (is the server running?)")
            return False
        except requests.exceptions.Timeout:
            print("[API] Request timed out")
            return False
        except Exception as e:
            print(f"[API] Error: {e}")
            return False


class DwellCounter:
    """Small centroid tracker that counts a person after they dwell in an ROI."""

    def __init__(self, dwell_seconds: float, max_missing_seconds: float = 3.0) -> None:
        self.dwell_seconds = max(float(dwell_seconds), 0.1)
        self.max_missing_seconds = max_missing_seconds
        self.tracks: dict[int, dict[str, Any]] = {}
        self.next_track_id = 1
        self.counted_total = 0

    def update(self, detections: list[dict[str, Any]], now: float) -> tuple[list[dict[str, Any]], int, int]:
        active_ids = set()

        for detection in detections:
            bbox = detection["bbox"]
            centroid = (
                bbox["x"] + bbox["width"] / 2,
                bbox["y"] + bbox["height"] / 2,
            )
            zone_name = detection.get("zoneName")
            track_id = self._match_track(centroid, zone_name, now)

            if track_id is None:
                track_id = self.next_track_id
                self.next_track_id += 1
                self.tracks[track_id] = {
                    "centroid": centroid,
                    "zoneName": zone_name,
                    "enteredAt": now,
                    "lastSeenAt": now,
                    "counted": False,
                }
            else:
                track = self.tracks[track_id]
                if track.get("zoneName") != zone_name:
                    track["enteredAt"] = now
                    track["counted"] = False
                track["centroid"] = centroid
                track["zoneName"] = zone_name
                track["lastSeenAt"] = now

            track = self.tracks[track_id]
            dwell = now - track["enteredAt"]
            if not track["counted"] and dwell >= self.dwell_seconds:
                track["counted"] = True
                self.counted_total += 1

            detection["trackId"] = track_id
            detection["dwellSeconds"] = round(dwell, 2)
            detection["counted"] = bool(track["counted"])
            active_ids.add(track_id)

        self._expire_tracks(active_ids, now)
        active_counted = sum(1 for track_id in active_ids if self.tracks.get(track_id, {}).get("counted"))
        return detections, self.counted_total, active_counted

    def _match_track(self, centroid, zone_name: str | None, now: float) -> int | None:
        best_id = None
        best_distance = float("inf")
        for track_id, track in self.tracks.items():
            if now - track["lastSeenAt"] > self.max_missing_seconds:
                continue
            if track.get("zoneName") != zone_name:
                continue
            tx, ty = track["centroid"]
            distance = ((centroid[0] - tx) ** 2 + (centroid[1] - ty) ** 2) ** 0.5
            if distance < best_distance and distance <= 120:
                best_id = track_id
                best_distance = distance
        return best_id

    def _expire_tracks(self, active_ids: set[int], now: float) -> None:
        expired = [
            track_id
            for track_id, track in self.tracks.items()
            if track_id not in active_ids and now - track["lastSeenAt"] > self.max_missing_seconds
        ]
        for track_id in expired:
            del self.tracks[track_id]


def normalize_livefeed_config(config: dict[str, Any] | None) -> dict[str, Any]:
    config = config or DEFAULT_LIVEFEED_CONFIG
    dwell = config.get("dwellSeconds", DEFAULT_LIVEFEED_CONFIG["dwellSeconds"])
    try:
        dwell_seconds = max(float(dwell), 0.1)
    except (TypeError, ValueError):
        dwell_seconds = DEFAULT_LIVEFEED_CONFIG["dwellSeconds"]

    zones = config.get("zones") if isinstance(config.get("zones"), list) else DEFAULT_LIVEFEED_CONFIG["zones"]
    normalized_zones = []
    for index, zone in enumerate(zones):
        try:
            x = min(100.0, max(0.0, float(zone.get("x", 0))))
            y = min(100.0, max(0.0, float(zone.get("y", 0))))
            width = min(100.0 - x, max(1.0, float(zone.get("width", 100))))
            height = min(100.0 - y, max(1.0, float(zone.get("height", 100))))
        except (TypeError, ValueError):
            continue
        if zone.get("enabled", True) is False:
            continue
        normalized_zones.append({
            "name": zone.get("name") or f"Counting Zone {index + 1}",
            "x": x,
            "y": y,
            "width": width,
            "height": height,
            "color": zone.get("color") or "#16a34a",
            "enabled": True,
        })

    if not normalized_zones:
        normalized_zones = DEFAULT_LIVEFEED_CONFIG["zones"]

    return {"dwellSeconds": dwell_seconds, "zones": normalized_zones}


def fetch_livefeed_config(config_url: str | None, fallback: dict[str, Any]) -> dict[str, Any]:
    if not config_url:
        return fallback
    try:
        response = requests.get(config_url, timeout=1.5)
        if 200 <= response.status_code < 300:
            return normalize_livefeed_config(response.json())
        print(f"[CONFIG] Server returned {response.status_code}; using previous livefeed config.")
    except Exception as e:
        print(f"[CONFIG] Could not fetch {config_url}: {e}; using previous livefeed config.")
    return fallback


def zone_to_pixels(zone: dict[str, Any], frame_width: int, frame_height: int) -> tuple[int, int, int, int]:
    x1 = int(frame_width * zone["x"] / 100)
    y1 = int(frame_height * zone["y"] / 100)
    x2 = int(frame_width * (zone["x"] + zone["width"]) / 100)
    y2 = int(frame_height * (zone["y"] + zone["height"]) / 100)
    return (
        max(0, min(frame_width - 1, x1)),
        max(0, min(frame_height - 1, y1)),
        max(1, min(frame_width, x2)),
        max(1, min(frame_height, y2)),
    )


def detect_people_in_zones(
    frame,
    zones: list[dict[str, Any]],
    model: YOLO,
    conf_threshold: float,
    iou_threshold: float,
    imgsz: int,
    device: str,
) -> list[dict[str, Any]]:
    detections = []
    frame_height, frame_width = frame.shape[:2]

    for zone in zones:
        zx1, zy1, zx2, zy2 = zone_to_pixels(zone, frame_width, frame_height)
        crop = frame[zy1:zy2, zx1:zx2]
        if crop.size == 0:
            continue

        results = model.predict(
            crop,
            conf=conf_threshold,
            iou=iou_threshold,
            classes=[PERSON_CLASS_ID],
            imgsz=imgsz,
            device=device,
            verbose=False,
        )

        for result in results:
            if result.boxes is None:
                continue
            for box in result.boxes:
                conf = float(box.conf[0])
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                detections.append({
                    "class": "person",
                    "confidence": round(conf, 4),
                    "zoneName": zone["name"],
                    "bbox": {
                        "x": max(0, zx1 + x1),
                        "y": max(0, zy1 + y1),
                        "width": max(0, x2 - x1),
                        "height": max(0, y2 - y1),
                    },
                })

    return detections


# ─────────────────────────────────────────────────────────────────────────────
# Current dashboard compatibility MJPEG preview
# ─────────────────────────────────────────────────────────────────────────────

def prepare_stream_frame(frame, stream_width: int):
    """Return a resized raw frame for the current Vue MJPEG preview."""
    if stream_width <= 0 or frame.shape[1] <= stream_width:
        return frame.copy()

    scale = stream_width / frame.shape[1]
    stream_height = max(1, int(frame.shape[0] * scale))
    return cv2.resize(frame, (stream_width, stream_height), interpolation=cv2.INTER_AREA)


def start_mjpeg_preview_server(
    port: int,
    stream_fps: float,
    jpeg_quality: int,
) -> None:
    """
    Serve the latest raw camera frame for the existing Livefeed.vue <img>.

    This is a compatibility bridge for the current dashboard. In the target
    architecture, MediaMTX/WebRTC should replace this endpoint.
    """
    global _last_stream_frame

    app = FastAPI()
    frame_delay = 1.0 / max(stream_fps, 1.0)
    encode_params = [int(cv2.IMWRITE_JPEG_QUALITY), int(np.clip(jpeg_quality, 1, 100))]

    def mjpeg_generator():
        global _last_stream_frame
        while True:
            with _stream_lock:
                frame = _last_stream_frame

            if frame is None:
                frame = np.zeros((480, 640, 3), dtype=np.uint8)

            ok, jpeg = cv2.imencode(".jpg", frame, encode_params)
            if not ok:
                time.sleep(0.05)
                continue

            data = jpeg.tobytes()
            yield (
                b"--frame\r\n"
                b"Content-Type: image/jpeg\r\n"
                b"Content-Length: " + str(len(data)).encode() + b"\r\n\r\n" +
                data + b"\r\n"
            )
            time.sleep(frame_delay)

    @app.get("/stream")
    async def stream():
        return StreamingResponse(
            mjpeg_generator(),
            media_type="multipart/x-mixed-replace; boundary=frame",
        )

    def run_app():
        import uvicorn
        uvicorn.run(app, host="0.0.0.0", port=port, log_level="error")

    with _stream_lock:
        _last_stream_frame = np.zeros((480, 640, 3), dtype=np.uint8)

    Thread(target=run_app, daemon=True).start()
    print(f"[INFO] MJPEG preview      : http://localhost:{port}/stream")
    print(f"[INFO] MJPEG settings     : {stream_fps:.1f} FPS | JPEG quality {jpeg_quality}")


# ─────────────────────────────────────────────────────────────────────────────
# Core live stream processing
# ─────────────────────────────────────────────────────────────────────────────

def run_live(
    source,                 # int (webcam index) or str (RTSP URL)
    model: YOLO,
    camera_id: str,
    conf_threshold: float,
    iou_threshold: float,
    skip_frames: int,
    drop_frames: int,
    imgsz: int,
    device: str,
    publisher: DetectionPublisher,
    mjpeg_port: int,
    stream_fps: float,
    jpeg_quality: int,
    stream_width: int,
    api_url: str = None,
    api_interval: float = 5.0,
    config_url: str = None,
    config_refresh_interval: float = 10.0,
    reconnect_delay: float = 2.0,
    max_read_failures: int = 20,
    ffmpeg_capture_options: str | None = None,
) -> None:
    """
    Open a live camera source, run person-only YOLO detection, and publish
    detection metadata for a browser canvas overlay.

    The production livestream should be served separately by MediaMTX/WebRTC.
    This function keeps a raw MJPEG compatibility preview for the current page,
    but intentionally does not draw boxes into that video.
    """
    global _last_stream_frame

    # ── Open camera ───────────────────────────────────────────────────────────
    def open_camera(src):
        if isinstance(src, str) and src.lower().startswith("rtsp://"):
            capture_options = ffmpeg_capture_options or (
                "rtsp_transport;tcp|rtsp_flags;prefer_tcp|"
                "stimeout;5000000|fflags;+nobuffer+discardcorrupt|"
                "flags;low_delay|err_detect;ignore_err|"
                "max_delay;500000|reorder_queue_size;0|"
                "analyzeduration;1000000|probesize;32768"
            )
            os.environ["OPENCV_FFMPEG_CAPTURE_OPTIONS"] = capture_options
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
    if not np.isfinite(fps) or fps <= 0 or fps > 240:
        fps = 30.0   # webcams and RTSP streams often report unusable FPS values.

    print(f"[INFO] Camera source      : {source}")
    print(f"[INFO] Camera ID          : {camera_id}")
    print(f"[INFO] Resolution         : {width}x{height}  |  FPS: {fps:.1f}")
    print(f"[INFO] Mode               : Metadata-only YOLO person detection")
    print("[INFO] Browser stream     : Raw MJPEG compatibility preview")
    print("[INFO] Target stream path  : MediaMTX WebRTC should replace MJPEG in production")
    print(f"[INFO] Inference size     : {imgsz}")
    print(f"[INFO] Device             : {device}")
    print(f"[INFO] Drop frames/read   : {drop_frames}")
    print(f"[INFO] Read fail reconnect: {max_read_failures} failures | delay {reconnect_delay:.1f}s")
    if isinstance(source, str) and source.lower().startswith("rtsp://"):
        print(f"[INFO] FFmpeg RTSP options: {os.environ.get('OPENCV_FFMPEG_CAPTURE_OPTIONS', 'default')}")
    if api_url:
        print(f"[INFO] API endpoint       : {api_url} (every {api_interval}s)")
    if config_url:
        print(f"[INFO] Config endpoint    : {config_url} (every {config_refresh_interval}s)")
    print("[INFO] Press Ctrl+C in this terminal to stop.\n")

    # ── Timing ────────────────────────────────────────────────────────────────
    start_time    = time.time()
    frame_num     = 0
    read_failures = 0
    config = fetch_livefeed_config(config_url, normalize_livefeed_config(DEFAULT_LIVEFEED_CONFIG))
    last_config_fetch = time.time()
    dwell_counter = DwellCounter(config["dwellSeconds"])

    publisher.connect()
    start_mjpeg_preview_server(mjpeg_port, stream_fps, jpeg_quality)

    # ── Frame loop ────────────────────────────────────────────────────────────
    try:
        while True:
            # Keep latency down by discarding frames buffered by OpenCV/FFmpeg.
            for _ in range(max(drop_frames, 0)):
                cap.grab()

            ret, frame = cap.read()
            if not ret:
                read_failures += 1
                if read_failures < max_read_failures:
                    time.sleep(0.05)
                    continue

                print("[WARNING] Camera read failures reached threshold; reconnecting.")
                cap.release()
                time.sleep(max(reconnect_delay, 0.1))
                cap = open_camera(source)
                if cap is None or not cap.isOpened():
                    print("[WARNING] Reconnect failed; trying again shortly.")
                    time.sleep(max(reconnect_delay, 0.1))
                    continue
                read_failures = 0
                continue

            read_failures = 0

            with _stream_lock:
                _last_stream_frame = prepare_stream_frame(frame, stream_width)

            frame_num += 1
            elapsed = time.time() - start_time

            # ── Frame skipping ────────────────────────────────────────────────
            if skip_frames > 1 and frame_num % skip_frames != 0:
                continue

            if config_url and time.time() - last_config_fetch >= max(config_refresh_interval, 1.0):
                previous_dwell = config["dwellSeconds"]
                config = fetch_livefeed_config(config_url, config)
                if config["dwellSeconds"] != previous_dwell:
                    dwell_counter.dwell_seconds = config["dwellSeconds"]
                last_config_fetch = time.time()

            detections = detect_people_in_zones(
                frame=frame,
                zones=config["zones"],
                model=model,
                conf_threshold=conf_threshold,
                iou_threshold=iou_threshold,
                imgsz=imgsz,
                device=device,
            )
            detections, counted_total, active_counted = dwell_counter.update(detections, time.time())

            message = {
                "cameraId": camera_id,
                "timestamp": int(time.time() * 1000),
                "frameWidth": int(frame.shape[1]),
                "frameHeight": int(frame.shape[0]),
                "peopleCount": counted_total,
                "activeCount": active_counted,
                "detections": detections,
                "zones": config["zones"],
                "dwellSeconds": config["dwellSeconds"],
            }

            publisher.publish(message, elapsed)
            # print(
            #     f"[DETECTION] camera={camera_id} people={message['peopleCount']} "
            #     f"boxes={len(detections)} timestamp={message['timestamp']}"
            # )
    except KeyboardInterrupt:
        print("\n[INFO] Ctrl+C received — stopping detector.")

    # ── Cleanup ───────────────────────────────────────────────────────────────
    cap.release()
    publisher.stop()

    total_time = time.time() - start_time
    print(f"[INFO] Detector ended after {total_time:.1f}s")


# ─────────────────────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="APC-QA — YOLOv8 person detection metadata service for WebRTC overlays"
    )
    parser.add_argument(
        "--source",
        default="0",
        help="Camera source: webcam index (0, 1, 2…) or RTSP URL (default: 0)"
    )
    parser.add_argument(
        "--camera-id",
        default="cam01",
        help="Stable camera ID included in every detection message (default: cam01)"
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
        "--imgsz",
        type=int, default=640,
        help="YOLO inference image size. Lower values reduce latency (default: 640)"
    )
    parser.add_argument(
        "--device",
        default="cpu",
        help="Inference device: cpu, cuda, cuda:0, mps, etc. (default: cpu)"
    )
    parser.add_argument(
        "--skip-frames",
        type=int, default=1,
        help="Process every Nth frame (default: 1 = every frame)"
    )
    parser.add_argument(
        "--drop-frames",
        type=int, default=2,
        help="Discard this many buffered frames before each read to reduce RTSP delay (default: 2)"
    )
    parser.add_argument(
        "--socketio-url",
        default="http://localhost:3000",
        help="Socket.IO server URL for detection metadata. Empty string disables it (default: http://localhost:3000)"
    )
    parser.add_argument(
        "--socketio-event",
        default="detection:update",
        help="Socket.IO event name for detection metadata (default: detection:update)"
    )
    parser.add_argument(
        "--emit-interval",
        type=float, default=0.0,
        help="Minimum seconds between Socket.IO emits. 0 emits every processed frame (default: 0)"
    )
    parser.add_argument(
        "--mjpeg-port",
        type=int, default=8090,
        help="Compatibility MJPEG preview port for the current Livefeed page (default: 8090)"
    )
    parser.add_argument(
        "--stream-fps",
        type=float, default=12.0,
        help="Maximum FPS for the compatibility MJPEG preview (default: 12)"
    )
    parser.add_argument(
        "--jpeg-quality",
        type=int, default=75,
        help="JPEG quality for the compatibility MJPEG preview, 1-100 (default: 75)"
    )
    parser.add_argument(
        "--stream-width",
        type=int, default=960,
        help="Resize compatibility MJPEG preview frames to this width; 0 disables resize (default: 960)"
    )
    parser.add_argument(
        "--api-url",
        default="http://localhost:3000/api/livefeed/update",
        help="HTTP fallback URL for count/metadata updates. Empty string disables it."
    )
    parser.add_argument(
        "--api-interval",
        type=float, default=0.25,
        help="Send HTTP fallback update every N seconds (default: 0.25)"
    )
    parser.add_argument(
        "--config-url",
        default="http://localhost:3000/api/livefeed/config",
        help="URL for admin-edited livefeed zones/dwell settings. Empty string uses defaults."
    )
    parser.add_argument(
        "--config-refresh-interval",
        type=float, default=10.0,
        help="Reload livefeed zone config every N seconds (default: 10)"
    )
    parser.add_argument(
        "--reconnect-delay",
        type=float, default=2.0,
        help="Seconds to wait before reopening a failed camera stream (default: 2)"
    )
    parser.add_argument(
        "--max-read-failures",
        type=int, default=20,
        help="Reconnect after this many consecutive failed frame reads (default: 20)"
    )
    parser.add_argument(
        "--ffmpeg-capture-options",
        default="",
        help=(
            "Override OpenCV FFmpeg capture options for RTSP. "
            "Use OpenCV's key;value|key;value format. Empty string uses the safer default."
        )
    )
    parser.add_argument(
        "--no-stop-notify",
        action="store_true",
        help="Do not POST /api/livefeed/stop when the AI process exits"
    )

    args = parser.parse_args()

    # ── Resolve source type ───────────────────────────────────────────────────
    source = int(args.source) if args.source.isdigit() else args.source

    # ── Startup info ──────────────────────────────────────────────────────────
    print(f"[INFO] Script location : {SCRIPT_DIR}")
    print(f"[INFO] Camera source   : {source}")
    print(f"[INFO] Camera ID       : {args.camera_id}")
    print(f"[INFO] Model           : {args.model}")
    print(f"[INFO] Confidence      : {args.conf}")
    print(f"[INFO] IOU threshold   : {args.iou}")
    print(f"[INFO] Image size      : {args.imgsz}")
    print(f"[INFO] Device          : {args.device}")
    print(f"[INFO] Skip frames     : {args.skip_frames}")
    print(f"[INFO] Drop frames     : {args.drop_frames}")
    print(f"[INFO] MJPEG port      : {args.mjpeg_port}")
    print(f"[INFO] Stream FPS      : {args.stream_fps}")
    print(f"[INFO] JPEG quality    : {args.jpeg_quality}")
    print(f"[INFO] Stream width    : {args.stream_width}")
    if args.socketio_url:
        print(f"[INFO] Socket.IO URL   : {args.socketio_url}")
        print(f"[INFO] Socket.IO event : {args.socketio_event}")
    if args.api_url:
        print(f"[INFO] API URL          : {args.api_url}")
        print(f"[INFO] API Interval     : {args.api_interval}s\n")
    else:
        print()
    if args.config_url:
        print(f"[INFO] Config URL       : {args.config_url}")
        print(f"[INFO] Config Interval  : {args.config_refresh_interval}s")

    # ── Load model ────────────────────────────────────────────────────────────
    print(f"[INFO] Loading YOLO model : {args.model}.pt")
    model = YOLO(f"{args.model}.pt")
    model.to(args.device)

    publisher = DetectionPublisher(
        socketio_url=args.socketio_url or None,
        socketio_event=args.socketio_event,
        api_url=args.api_url or None,
        api_interval=args.api_interval,
        emit_interval=args.emit_interval,
        notify_stop=not args.no_stop_notify,
    )

    # ── Start live stream ─────────────────────────────────────────────────────
    run_live(
        source         = source,
        model          = model,
        camera_id      = args.camera_id,
        conf_threshold = args.conf,
        iou_threshold  = args.iou,
        skip_frames    = args.skip_frames,
        drop_frames    = args.drop_frames,
        imgsz          = args.imgsz,
        device         = args.device,
        publisher      = publisher,
        mjpeg_port     = args.mjpeg_port,
        stream_fps     = args.stream_fps,
        jpeg_quality   = args.jpeg_quality,
        stream_width   = args.stream_width,
        api_url        = args.api_url,
        api_interval   = args.api_interval,
        config_url     = args.config_url or None,
        config_refresh_interval = args.config_refresh_interval,
        reconnect_delay = args.reconnect_delay,
        max_read_failures = args.max_read_failures,
        ffmpeg_capture_options = args.ffmpeg_capture_options or None,
    )


if __name__ == "__main__":
    main()
