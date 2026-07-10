const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const { Readable } = require('stream');
const { Server } = require('socket.io');
require('dotenv').config();
const User = require('./models/user');
const Station = require('./models/station');
const Bus = require('./models/bus');
const Feedback = require('./models/feedback');
const Analytics = require('./models/analytics');
const HourlyAnalytics = require('./models/hourlyAnalytics');
const Setting = require('./models/setting');
const dns = require('dns');
const { calculateRoute } = require('./routing/routingEngine');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.JWT_SECRET;
const MONGO_URI = process.env.MONGO_URI;
const MONGO_DNS_SERVERS = (process.env.MONGO_DNS_SERVERS || '')
  .split(',')
  .map(server => server.trim())
  .filter(Boolean);

const requiredEnv = ['JWT_SECRET', 'MONGO_URI'];
const missingEnv = requiredEnv.filter(key => !process.env[key]);
const LIVEFEED_STALE_MS = 15000;
const LIVEFEED_SOURCE_STREAM_URL =
  process.env.LIVEFEED_SOURCE_STREAM_URL ||
  process.env.LIVEFEED_STREAM_URL ||
  'http://localhost:8090/stream';
const LIVEFEED_PUBLIC_STREAM_URL = process.env.LIVEFEED_PUBLIC_STREAM_URL || '/api/livefeed/stream';
const DETECTOR_SCRIPT_PATH = process.env.DETECTOR_SCRIPT_PATH
  ? path.resolve(__dirname, process.env.DETECTOR_SCRIPT_PATH)
  : path.join(__dirname, '..', 'AI', 'detect_humans_live-api.py');
const resolveDetectorPythonBin = () => {
  if (process.env.DETECTOR_PYTHON_BIN) {
    const configuredBin = process.env.DETECTOR_PYTHON_BIN;
    const looksLikePath =
      path.isAbsolute(configuredBin) ||
      configuredBin.startsWith(`.${path.sep}`) ||
      configuredBin.startsWith(`..${path.sep}`) ||
      configuredBin.includes(path.sep);
    return looksLikePath ? path.resolve(__dirname, configuredBin) : configuredBin;
  }

  const candidates = [
    path.join(__dirname, '..', 'AI', '.venv', 'bin', 'python'),
    path.join(__dirname, '..', '.venv', 'bin', 'python'),
  ];
  return candidates.find(candidate => fs.existsSync(candidate)) || 'python3';
};
const DETECTOR_PYTHON_BIN = resolveDetectorPythonBin();
const DETECTOR_BASE_PORT = Number(process.env.DETECTOR_BASE_PORT) || 8090;
const DETECTOR_MODEL = process.env.DETECTOR_MODEL || 'yolov8s';
const DETECTOR_IMGSZ = Number(process.env.DETECTOR_IMGSZ) || 640;
const DETECTOR_SKIP_FRAMES = Number(process.env.DETECTOR_SKIP_FRAMES) || 2;
const DETECTOR_STREAM_FPS = Number(process.env.DETECTOR_STREAM_FPS) || 6;
const DETECTOR_STREAM_WIDTH = Number(process.env.DETECTOR_STREAM_WIDTH) || 640;
const DETECTOR_JPEG_QUALITY = Number(process.env.DETECTOR_JPEG_QUALITY) || 65;
const DETECTOR_SOCKET_EMIT_INTERVAL = Number(process.env.DETECTOR_SOCKET_EMIT_INTERVAL) || 0.5;
const ANALYTICS_TIMEZONE = process.env.ANALYTICS_TIMEZONE || 'Asia/Bangkok';
const detectorProcesses = new Map();

const livefeedDetection = {
  count: 0,
  activeCount: 0,
  elapsed: 0,
  timestamp: null,
  updatedAt: null,
  cameraId: null,
  frameWidth: 0,
  frameHeight: 0,
  detections: [],
  zones: []
};
const cameraDetections = new Map();

const DEFAULT_LIVEFEED_CONFIG = {
  dwellSeconds: 30,
  referenceImage: '',
  zones: [
    {
      name: 'Counting Zone',
      x: 20,
      y: 20,
      width: 60,
      height: 60,
      color: '#16a34a',
      enabled: true
    }
  ]
};
const LIVEFEED_GRID_COLOR = '#16a34a';
const SETTINGS_LIGHT_PROJECTION = {
  'hardware.livefeed.referenceImage': 0,
  'livefeed.referenceImage': 0
};

if (missingEnv.length > 0) {
  console.error(`Missing required environment variables: ${missingEnv.join(', ')}`);
  process.exit(1);
}

if (MONGO_DNS_SERVERS.length > 0) {
  dns.setServers(MONGO_DNS_SERVERS);
}

mongoose.set('bufferCommands', false);

const isMongoConnected = () => mongoose.connection.readyState === 1;

const dbMiddleware = (req, res, next) => {
  if (!isMongoConnected()) {
    return res.status(503).json({
      message: 'Database unavailable',
      state: mongoose.STATES[mongoose.connection.readyState] || 'unknown'
    });
  }

  next();
};

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    if (!token) return res.status(401).json({ message: 'No Token' });
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid Token' });
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

const createDeviceId = (hardware = {}, index = 0) => {
  if (hardware.deviceId) return String(hardware.deviceId);
  const name = String(hardware.name || `camera-${index + 1}`)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${name || 'camera'}-${Date.now()}-${index}`;
};

const clampPercent = (value, fallback) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(100, Math.max(0, number));
};

const getDisplayName = (value, fallback = '') => {
  if (Array.isArray(value)) {
    return getDisplayName(value[0], fallback);
  }

  if (value && typeof value === 'object') {
    return getDisplayName(value.name, fallback);
  }

  const text = String(value || '').trim();
  if (!text) return fallback;

  if (text.startsWith('{') || text.startsWith('[')) {
    try {
      return getDisplayName(JSON.parse(text), fallback);
    } catch {
      return fallback || text;
    }
  }

  return text;
};

const normalizeLivefeedZone = (zone = {}, index = 0, zoneName = '') => {
  const x = clampPercent(zone.x, DEFAULT_LIVEFEED_CONFIG.zones[0].x);
  const y = clampPercent(zone.y, DEFAULT_LIVEFEED_CONFIG.zones[0].y);
  const maxWidth = Math.max(1, 100 - x);
  const maxHeight = Math.max(1, 100 - y);

  return {
    name: zoneName || zone.name || `Counting Zone ${index + 1}`,
    x,
    y,
    width: Math.min(maxWidth, Math.max(1, clampPercent(zone.width, DEFAULT_LIVEFEED_CONFIG.zones[0].width))),
    height: Math.min(maxHeight, Math.max(1, clampPercent(zone.height, DEFAULT_LIVEFEED_CONFIG.zones[0].height))),
    color: LIVEFEED_GRID_COLOR,
    enabled: zone.enabled !== false
  };
};

const normalizeLivefeedConfig = (livefeed = {}, zoneName = '', existingLivefeed = null, options = {}) => {
  const dwellSeconds = Number(livefeed.dwellSeconds);
  const zones = Array.isArray(livefeed.zones) && livefeed.zones.length
    ? livefeed.zones
    : DEFAULT_LIVEFEED_CONFIG.zones;
  const nextReferenceImage = typeof livefeed.referenceImage === 'string' ? livefeed.referenceImage : '';
  const existingReferenceImage = typeof existingLivefeed?.referenceImage === 'string'
    ? existingLivefeed.referenceImage
    : '';

  return {
    dwellSeconds: Number.isFinite(dwellSeconds) && dwellSeconds > 0 ? dwellSeconds : DEFAULT_LIVEFEED_CONFIG.dwellSeconds,
    referenceImage: options.preserveExistingReferenceImage &&
      livefeed.referenceImageAction !== 'clear' &&
      !nextReferenceImage &&
      existingReferenceImage
      ? existingReferenceImage
      : nextReferenceImage,
    zones: zones.slice(0, 1).map((zone, index) => normalizeLivefeedZone(zone, index, zoneName))
  };
};

const normalizeHardware = (hardware = {}, index = 0, existingHardware = null, options = {}) => {
  const type = ['sensor', 'camera', 'other'].includes(hardware.type) ? hardware.type : 'sensor';
  const status = hardware.status === 'online' ? 'online' : 'offline';
  const rtspUrl = String(hardware.rtspUrl || '').trim();
  const ip = String(hardware.ip || '').trim();
  const fw = String(hardware.fw || '').trim();
  const name = getDisplayName(hardware.name, `Hardware ${index + 1}`);

  const normalized = {
    deviceId: createDeviceId(hardware, index),
    name,
    type,
    ip,
    rtspUrl,
    fw,
    status,
    details: hardware.details || [
      fw ? `FW ${fw}` : '',
      ip,
      type === 'camera' && rtspUrl ? 'RTSP configured' : ''
    ].filter(Boolean).join(' • '),
    livefeed: normalizeLivefeedConfig(
      hardware.livefeed || DEFAULT_LIVEFEED_CONFIG,
      name,
      existingHardware?.livefeed,
      options
    )
  };

  if (hardware._id) normalized._id = hardware._id;
  return normalized;
};

const getExistingHardwareForPayload = (existingSettings, hardware = {}, index = 0) => {
  const existingHardware = Array.isArray(existingSettings?.hardware) ? existingSettings.hardware : [];
  const payloadId = normalizeHardwareIdentifier(hardware._id || hardware.deviceId);
  if (payloadId) {
    const matched = existingHardware.find(item => (
      normalizeHardwareIdentifier(item._id) === payloadId ||
      normalizeHardwareIdentifier(item.deviceId) === payloadId
    ));
    if (matched) return matched;
  }
  return existingHardware[index] || null;
};

const normalizeSettingsPayload = (payload = {}, existingSettings = null, options = {}) => ({
  ...payload,
  hardware: Array.isArray(payload.hardware)
    ? payload.hardware.map((hardware, index) => normalizeHardware(
      hardware,
      index,
      getExistingHardwareForPayload(existingSettings, hardware, index),
      options
    ))
    : Array.isArray(existingSettings?.hardware) ? existingSettings.hardware : [],
  livefeed: normalizeLivefeedConfig(
    payload.livefeed || DEFAULT_LIVEFEED_CONFIG,
    '',
    existingSettings?.livefeed,
    options
  )
});

const sanitizeSettingsForResponse = (settings) => {
  if (!settings) return settings;
  const source = settings.toObject ? settings.toObject() : settings;
  return {
    ...source,
    livefeed: source.livefeed
      ? { ...source.livefeed, referenceImage: '' }
      : source.livefeed,
    hardware: Array.isArray(source.hardware)
      ? source.hardware.map(item => ({
        ...item,
        livefeed: item.livefeed
          ? { ...item.livefeed, referenceImage: '' }
          : item.livefeed
      }))
      : source.hardware
  };
};

const getSettingsDocument = (includeReferenceImages = false) => (
  includeReferenceImages
    ? Setting.findOne().lean()
    : Setting.findOne({}, SETTINGS_LIGHT_PROJECTION).lean()
);

const normalizeSettingsForResponse = (settings) => {
  if (!settings) return settings;
  const source = settings.toObject ? settings.toObject() : settings;
  return {
    ...source,
    hardware: Array.isArray(source.hardware)
      ? source.hardware.map((item, index) => normalizeHardware(item, index))
      : []
  };
};

const stripReferenceImagesFromSettingsPayload = (payload = {}) => {
  const next = { ...payload };

  if (next.livefeed && typeof next.livefeed === 'object') {
    next.livefeed = { ...next.livefeed };
    delete next.livefeed.referenceImage;
    delete next.livefeed.referenceImageAction;
  }

  if (Array.isArray(next.hardware)) {
    next.hardware = next.hardware.map(item => {
      const hardware = { ...item };
      if (hardware.livefeed && typeof hardware.livefeed === 'object') {
        hardware.livefeed = { ...hardware.livefeed };
        delete hardware.livefeed.referenceImage;
        delete hardware.livefeed.referenceImageAction;
      }
      return hardware;
    });
  }

  return next;
};

const normalizeHardwareIdentifier = (hardwareId) => {
  if (!hardwareId) return '';
  if (typeof hardwareId === 'object') {
    return String(hardwareId.$oid || hardwareId._id || hardwareId.deviceId || '');
  }
  try {
    return decodeURIComponent(String(hardwareId));
  } catch {
    return String(hardwareId);
  }
};

const getHardwareIndex = (settings, hardwareId) => {
  if (!settings || !Array.isArray(settings.hardware)) return -1;
  const normalizedHardwareId = normalizeHardwareIdentifier(hardwareId);
  const index = settings.hardware.findIndex((item) => (
    normalizeHardwareIdentifier(item._id) === normalizedHardwareId ||
    normalizeHardwareIdentifier(item.deviceId) === normalizedHardwareId
  ));
  if (index !== -1) return index;

  if (!/^\d+$/.test(normalizedHardwareId)) return -1;
  const numericIndex = Number(normalizedHardwareId);
  return Number.isInteger(numericIndex) ? numericIndex : -1;
};

const getDetectorPort = (hardware, index = 0) => {
  const existing = detectorProcesses.get(hardware.deviceId);
  return existing?.port || DETECTOR_BASE_PORT + index + 1;
};

const getHourlyBucket = (value = new Date()) => {
  const sourceDate = value instanceof Date ? value : new Date(value);
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: ANALYTICS_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hour12: false
  });
  const parts = Object.fromEntries(
    formatter.formatToParts(sourceDate).map(part => [part.type, part.value])
  );
  const hour = Number(parts.hour === '24' ? 0 : parts.hour);
  const date = new Date(`${parts.year}-${parts.month}-${parts.day}T00:00:00.000Z`);
  const timestamp = new Date(`${parts.year}-${parts.month}-${parts.day}T${String(hour).padStart(2, '0')}:00:00.000Z`);

  return { date, hour, timestamp };
};

const getLocalTimeLabel = (value = new Date()) => (
  new Intl.DateTimeFormat('en-GB', {
    timeZone: ANALYTICS_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(value)
);

const getMedian = (values = []) => {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
};

const resolveStationIdForCamera = async (cameraId) => {
  const settings = await getSettingsDocument();
  const hardware = Array.isArray(settings?.hardware) ? settings.hardware : [];
  const camera = hardware.find(item => (
    normalizeHardwareIdentifier(item._id) === normalizeHardwareIdentifier(cameraId) ||
    normalizeHardwareIdentifier(item.deviceId) === normalizeHardwareIdentifier(cameraId)
  ));

  return String(
    camera?.stationId ||
    camera?.station_id ||
    camera?.station ||
    camera?.name ||
    cameraId ||
    'UNKNOWN_STATION'
  ).trim().replace(/\s+/g, '_').toUpperCase();
};

const updateHourlyAnalytics = async (payload = {}, detectionState = {}) => {
  const currentQueueCount = Number(detectionState.activeCount ?? payload.activeCount ?? payload.peopleCount ?? payload.count);
  if (!Number.isFinite(currentQueueCount) || currentQueueCount < 0) return;

  const cameraId = detectionState.cameraId || payload.cameraId || 'AI-001';
  const stationId = await resolveStationIdForCamera(cameraId);
  const now = new Date(Number(payload.timestamp) || Date.now());
  const bucket = getHourlyBucket(now);
  const dwellSamples = (detectionState.detections || [])
    .map(item => Number(item.dwellSeconds))
    .filter(value => Number.isFinite(value) && value >= 0);

  const existing = await HourlyAnalytics
    .findOne({ station_id: stationId, timestamp: bucket.timestamp })
    .select('+queue_time_samples_seconds +last_total_persons_seen');

  const queueTimeSamples = [
    ...(existing?.queue_time_samples_seconds || []),
    ...dwellSamples
  ].slice(-1000);
  const sampleCount = (existing?.sample_count || 0) + 1;
  const previousTotalSeen = existing?.last_total_persons_seen || 0;
  const totalSeen = Number(detectionState.count ?? payload.peopleCount ?? payload.count);
  const processedDelta = Number.isFinite(totalSeen)
    ? Math.max(0, Math.round(totalSeen) - previousTotalSeen)
    : 0;
  const peakQueueCount = Math.max(existing?.peak_queue_count || 0, Math.round(currentQueueCount));
  const shouldUpdatePeak = !existing || Math.round(currentQueueCount) >= (existing.peak_queue_count || 0);

  const previousAverage = existing?.avg_queue_time_seconds || 0;
  const currentAverage = dwellSamples.length
    ? dwellSamples.reduce((sum, value) => sum + value, 0) / dwellSamples.length
    : currentQueueCount > 0 ? previousAverage : 0;
  const nextAverage = sampleCount > 1
    ? (((previousAverage * (sampleCount - 1)) + currentAverage) / sampleCount)
    : currentAverage;

  const roundedQueueCount = Math.round(currentQueueCount);
  const analytics = existing || new HourlyAnalytics({
    station_id: stationId,
    timestamp: bucket.timestamp,
    min_queue_count: roundedQueueCount
  });

  analytics.station_id = stationId;
  analytics.camera_id = cameraId;
  analytics.date = bucket.date;
  analytics.hour = bucket.hour;
  analytics.timestamp = bucket.timestamp;
  analytics.timezone = ANALYTICS_TIMEZONE;
  analytics.current_queue_count = roundedQueueCount;
  analytics.max_queue_count = Math.max(existing?.max_queue_count || roundedQueueCount, roundedQueueCount);
  analytics.min_queue_count = existing && Number.isFinite(existing.min_queue_count)
    ? Math.min(existing.min_queue_count, roundedQueueCount)
    : roundedQueueCount;
  analytics.avg_queue_time_seconds = Number(nextAverage.toFixed(1));
  analytics.median_queue_time_seconds = Number(getMedian(queueTimeSamples).toFixed(1));
  analytics.peak_time = shouldUpdatePeak ? getLocalTimeLabel(now) : existing.peak_time;
  analytics.peak_queue_count = peakQueueCount;
  analytics.total_persons_processed = (existing?.total_persons_processed || 0) + processedDelta;
  analytics.sample_count = sampleCount;
  analytics.queue_time_samples_seconds = queueTimeSamples;
  analytics.last_total_persons_seen = Number.isFinite(totalSeen) ? Math.round(totalSeen) : previousTotalSeen;

  await analytics.save();
};

const stopDetector = (deviceId) => {
  const running = detectorProcesses.get(deviceId);
  if (!running) return;

  console.log(`[DETECTOR] Stopping ${deviceId}`);
  running.process.kill('SIGTERM');
  setTimeout(() => {
    if (!running.process.killed) running.process.kill('SIGKILL');
  }, 3000);
  detectorProcesses.delete(deviceId);
};

const startDetector = (hardware, index = 0) => {
  if (hardware.type !== 'camera' || hardware.status !== 'online' || !hardware.rtspUrl) return;

  const running = detectorProcesses.get(hardware.deviceId);
  if (running && running.rtspUrl === hardware.rtspUrl) return;
  if (running) stopDetector(hardware.deviceId);

  const port = getDetectorPort(hardware, index);
  const args = [
    DETECTOR_SCRIPT_PATH,
    '--source', hardware.rtspUrl,
    '--camera-id', hardware.deviceId,
    '--mjpeg-port', String(port),
    '--model', DETECTOR_MODEL,
    '--imgsz', String(DETECTOR_IMGSZ),
    '--skip-frames', String(DETECTOR_SKIP_FRAMES),
    '--stream-fps', String(DETECTOR_STREAM_FPS),
    '--stream-width', String(DETECTOR_STREAM_WIDTH),
    '--jpeg-quality', String(DETECTOR_JPEG_QUALITY),
    '--emit-interval', String(DETECTOR_SOCKET_EMIT_INTERVAL),
    '--api-url', '',
    '--socketio-url', `http://localhost:${PORT}`,
    '--config-url', `http://localhost:${PORT}/api/livefeed/config?cameraId=${encodeURIComponent(hardware.deviceId)}`,
    '--no-stop-notify',
  ];

  const child = spawn(DETECTOR_PYTHON_BIN, args, {
    cwd: path.dirname(DETECTOR_SCRIPT_PATH),
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env },
  });

  detectorProcesses.set(hardware.deviceId, {
    process: child,
    port,
    rtspUrl: hardware.rtspUrl,
    startedAt: Date.now(),
  });

  console.log(`[DETECTOR] Started ${hardware.deviceId} on MJPEG port ${port}`);

  child.stdout.on('data', data => writeDetectorOutput(hardware.deviceId, data, process.stdout));
  child.stderr.on('data', data => writeDetectorOutput(hardware.deviceId, data, process.stderr, true));
  child.on('error', error => {
    detectorProcesses.delete(hardware.deviceId);
    console.error(`[DETECTOR] Could not start ${hardware.deviceId}:`, error);
  });
  child.on('exit', (code, signal) => {
    const current = detectorProcesses.get(hardware.deviceId);
    if (current?.process === child) detectorProcesses.delete(hardware.deviceId);
    console.log(`[DETECTOR] ${hardware.deviceId} exited code=${code} signal=${signal}`);
  });
};

const isNoisyDecoderWarning = (line) => (
  /^\[hevc @ .*\] Could not find ref with POC \d+/.test(line) ||
  /^\[hevc @ .*\] Error constructing the frame RPS\./.test(line)
);

const writeDetectorOutput = (deviceId, data, stream, filterDecoderNoise = false) => {
  String(data)
    .split(/\r?\n/)
    .filter(line => line.trim())
    .filter(line => !filterDecoderNoise || !isNoisyDecoderWarning(line))
    .forEach(line => stream.write(`[DETECTOR:${deviceId}] ${line}\n`));
};

const syncHardwareDetectors = async (nextSettings) => {
  const hardware = Array.isArray(nextSettings?.hardware)
    ? nextSettings.hardware.map((item, index) => normalizeHardware(item, index))
    : [];
  const desiredIds = new Set();

  hardware.forEach((item, index) => {
    desiredIds.add(item.deviceId);
    if (item.type === 'camera' && item.status === 'online' && item.rtspUrl) {
      startDetector(item, index);
    } else {
      stopDetector(item.deviceId);
    }
  });

  for (const deviceId of detectorProcesses.keys()) {
    if (!desiredIds.has(deviceId)) stopDetector(deviceId);
  }
};

const stopAllDetectors = () => {
  for (const deviceId of [...detectorProcesses.keys()]) {
    stopDetector(deviceId);
  }
};

process.on('SIGINT', () => {
  stopAllDetectors();
  process.exit(0);
});

process.on('SIGTERM', () => {
  stopAllDetectors();
  process.exit(0);
});

mongoose.connection.on('connected', () => {
  console.log(`MongoDB Connected: ${mongoose.connection.name}`);
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB Disconnected');
});

mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err.message);
});

mongoose
  .connect(MONGO_URI, {
    serverSelectionTimeoutMS: Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS) || 5000,
    socketTimeoutMS: Number(process.env.MONGO_SOCKET_TIMEOUT_MS) || 45000,
  })
  .then(async () => {
    await syncHardwareDetectors(await getSettingsDocument());
  })
  .catch(err => console.error('MongoDB initial connection failed:', err.message));

const getLivefeedDetectionStatus = () => {
  const latest = [...cameraDetections.values()]
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))[0] || livefeedDetection;
  return formatDetectionStatus(latest, latest.streamUrl || LIVEFEED_PUBLIC_STREAM_URL);
};

const getLivefeedConfig = async (cameraId = '') => {
  const settings = await getSettingsDocument();
  const hardware = Array.isArray(settings?.hardware) ? settings.hardware : [];
  const camera = hardware.find(item => (
    normalizeHardwareIdentifier(item._id) === normalizeHardwareIdentifier(cameraId) ||
    normalizeHardwareIdentifier(item.deviceId) === normalizeHardwareIdentifier(cameraId)
  ));

  if (camera) {
    return normalizeLivefeedConfig(
      camera.livefeed || settings?.livefeed || DEFAULT_LIVEFEED_CONFIG,
      camera.name
    );
  }

  return normalizeLivefeedConfig(settings?.livefeed || DEFAULT_LIVEFEED_CONFIG);
};

const updateLivefeedDetection = (payload) => {
  const count = Number(payload?.peopleCount ?? payload?.count);
  const activeCount = Number(payload?.activeCount);
  const elapsed = Number(payload?.elapsed);
  const detections = Array.isArray(payload?.detections) ? payload.detections : [];
  const frameWidth = Number(payload?.frameWidth);
  const frameHeight = Number(payload?.frameHeight);

  if (!Number.isFinite(count) || count < 0) {
    return false;
  }

  const cameraId = payload?.cameraId || livefeedDetection.cameraId || 'AI-001';
  const previous = cameraDetections.get(cameraId) || {};
  const detectionState = {
    count: Math.round(count),
    activeCount: Number.isFinite(activeCount) && activeCount >= 0 ? Math.round(activeCount) : detections.length,
    elapsed: Number.isFinite(elapsed) && elapsed >= 0 ? elapsed : 0,
    timestamp: Number(payload?.timestamp) || Date.now(),
    updatedAt: Date.now(),
    cameraId,
    frameWidth: Number.isFinite(frameWidth) && frameWidth > 0 ? frameWidth : previous.frameWidth || livefeedDetection.frameWidth,
    frameHeight: Number.isFinite(frameHeight) && frameHeight > 0 ? frameHeight : previous.frameHeight || livefeedDetection.frameHeight,
    detections: detections
      .filter(item => item?.bbox)
      .map(item => ({
        class: item.class || 'person',
        confidence: Number(item.confidence) || 0,
        trackId: item.trackId || null,
        dwellSeconds: Number(item.dwellSeconds) || 0,
        counted: Boolean(item.counted),
        zoneName: item.zoneName || null,
        bbox: {
          x: Number(item.bbox.x) || 0,
          y: Number(item.bbox.y) || 0,
          width: Number(item.bbox.width) || 0,
          height: Number(item.bbox.height) || 0
        }
      })),
    zones: Array.isArray(payload?.zones)
      ? payload.zones.map(normalizeLivefeedZone)
      : previous.zones || livefeedDetection.zones,
  };

  Object.assign(livefeedDetection, detectionState);
  cameraDetections.set(cameraId, detectionState);

  return detectionState;
};

const formatDetectionStatus = (detectionState = {}, streamUrl = '') => {
  const lastSeenAt = detectionState.updatedAt;
  const isRunning = Boolean(lastSeenAt && Date.now() - lastSeenAt < LIVEFEED_STALE_MS);

  return {
    running: isRunning,
    count: isRunning ? detectionState.count || 0 : 0,
    activeCount: isRunning ? detectionState.activeCount || 0 : 0,
    elapsed: isRunning ? detectionState.elapsed || 0 : 0,
    timestamp: detectionState.timestamp || null,
    lastSeenAt,
    streamUrl,
    cameraId: detectionState.cameraId || null,
    frameWidth: detectionState.frameWidth || 0,
    frameHeight: detectionState.frameHeight || 0,
    detections: isRunning ? detectionState.detections || [] : [],
    zones: detectionState.zones || []
  };
};

/////////////////// Live Feed AI ingest ///////////////////
app.post('/api/livefeed/update', async (req, res) => {
  const count = Number(req.body?.peopleCount ?? req.body?.count);
  const elapsed = Number(req.body?.elapsed);
  const detections = Array.isArray(req.body?.detections) ? req.body.detections : [];
  const frameWidth = Number(req.body?.frameWidth);
  const frameHeight = Number(req.body?.frameHeight);

  if (!Number.isFinite(count) || count < 0) {
    return res.status(400).json({ message: 'count must be a non-negative number' });
  }

  const detectionState = updateLivefeedDetection(req.body);
  if (!detectionState) {
    return res.status(400).json({ message: 'count must be a non-negative number' });
  }

  try {
    if (isMongoConnected()) {
      await updateHourlyAnalytics(req.body, detectionState);
    }
  } catch (error) {
    console.error('[HOURLY_ANALYTICS] Could not update hourly analytics:', error);
  }

  res.json({ message: 'Live feed updated', detection: getLivefeedDetectionStatus() });
});

app.post('/api/livefeed/stop', (req, res) => {
  const cameraId = req.body?.cameraId;
  if (cameraId) {
    cameraDetections.delete(cameraId);
  } else {
    cameraDetections.clear();
  }
  livefeedDetection.count = 0;
  livefeedDetection.elapsed = 0;
  livefeedDetection.timestamp = Date.now() / 1000;
  livefeedDetection.updatedAt = null;
  livefeedDetection.detections = [];

  res.json({ message: 'Live feed stopped', detection: getLivefeedDetectionStatus() });
});

const proxyDetectorStream = async (req, res, streamUrl, unavailableMessage) => {
  const controller = new AbortController();
  req.once('close', () => {
    if (!controller.signal.aborted) controller.abort();
  });
  const isExpectedStreamClose = error => (
    error?.name === 'AbortError' ||
    error?.message === 'terminated' ||
    error?.cause?.code === 'UND_ERR_SOCKET' ||
    controller.signal.aborted ||
    res.destroyed
  );

  try {
    const detectorStream = await fetch(streamUrl, { signal: controller.signal });

    if (!detectorStream.ok || !detectorStream.body) {
      return res.status(502).send(unavailableMessage);
    }

    res.setHeader(
      'Content-Type',
      detectorStream.headers.get('content-type') || 'multipart/x-mixed-replace; boundary=frame'
    );
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Connection', 'close');

    const nodeStream = Readable.fromWeb(detectorStream.body);
    nodeStream.on('error', error => {
      if (isExpectedStreamClose(error)) return;
      console.error('[LIVEFEED] Stream proxy error:', error);
      if (!res.headersSent) {
        res.status(502).send(unavailableMessage);
      } else {
        res.destroy(error);
      }
    });
    nodeStream.pipe(res);
  } catch (error) {
    if (isExpectedStreamClose(error)) return;
    if (!res.headersSent) res.status(502).send(unavailableMessage);
  }
};

app.get('/api/livefeed/stream', async (req, res) => {
  proxyDetectorStream(req, res, LIVEFEED_SOURCE_STREAM_URL, 'Live feed stream is unavailable');
});

app.get('/api/livefeed/stream/:cameraId', async (req, res) => {
  const running = detectorProcesses.get(req.params.cameraId);
  if (!running) {
    return res.status(404).send('Camera stream is offline');
  }

  proxyDetectorStream(req, res, `http://localhost:${running.port}/stream`, 'Camera stream is unavailable');
});

app.get('/api/livefeed/config', dbMiddleware, async (req, res) => {
  try {
    res.json(await getLivefeedConfig(req.query.cameraId));
  } catch (error) {
    res.status(500).json(error);
  }
});

/////////////////// Register ///////////////////
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    database: {
      connected: isMongoConnected(),
      state: mongoose.STATES[mongoose.connection.readyState] || 'unknown',
      name: mongoose.connection.name || null
    }
  });
});

/////////////////// Pedestrian routing ///////////////////
app.get('/api/route', (req, res) => {
  try {
    const routeResult = calculateRoute({
      startLat: req.query.startLat,
      startLng: req.query.startLng,
      endLat: req.query.endLat,
      endLng: req.query.endLng
    });

    res.json({
      ...routeResult,
      message: 'Route calculated with campus pedestrian graph and A* search'
    });
  } catch (error) {
    res.status(error.statusCode || 400).json({
      message: error.message || 'Unable to calculate route'
    });
  }
});

app.post('/register', dbMiddleware, async (req, res) => {
  try {
    const { username, password, confirmPassword } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: 'Username already exists' });
    if (password !== confirmPassword) return res.status(400).json({ message: 'Passwords do not match' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword, role: 'user' });
    await newUser.save();
    res.json({ message: 'Register Success' });
  } catch (error) {
    res.status(500).json(error);
  }
});

/////////////////// Login ///////////////////
app.post('/login', dbMiddleware, async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Wrong password' });
    const token = jwt.sign({ id: user._id, role: user.role }, SECRET_KEY, { expiresIn: '1d' });
    res.json({ message: 'Login Success', token, user: { id: user._id, username: user.username, role: user.role } });
  } catch (error) {
    res.status(500).json(error);
  }
});

app.use('/api', authMiddleware);
app.use('/api', dbMiddleware);

/////////////////// Dashboard ///////////////////
app.get('/api/dashboard', adminMiddleware, async (req, res) => {
  try {
    const stations = await Station.find().lean();
    const buses = await Bus.find().lean();
    const analytics = await Analytics.findOne().sort({ createdAt: -1 }).lean();
    const hourlyAnalytics = await HourlyAnalytics
      .find()
      .sort({ timestamp: -1, station_id: 1 })
      .limit(12)
      .lean();

    const passengerChart = analytics
      ? { weekly: analytics.weeklyData, monthly: analytics.monthlyData }
      : { weekly: [], monthly: [] };

    const totalPassengers = stations.reduce((sum, s) => sum + (s.waitingPassengers || 0), 0);
    const activeBuses = buses.filter(b => b.status === 'on route').length;
    const stillBuses = buses.filter(b => b.status === 'standby').length;
    const maintainBuses = buses.filter(b => b.status === 'maintenance').length;

    const kpis = [
      { title: 'TOTAL PASSENGERS', value: totalPassengers, trend: 'Current waiting', type: 'positive' },
      { title: 'ACTIVE BUSES', value: activeBuses, trend: 'On route', type: 'positive' },
      { title: 'STILL BUSES', value: stillBuses, trend: 'Standby at station', type: 'neutral' },
      { title: 'MAINTAIN BUSES', value: maintainBuses, trend: 'Under maintenance', type: 'warning' }
    ];

    const notifications = stations
      .filter(s => s.status === 'alert' || s.status === 'critical')
      .map((s, i) => ({
        id: `NOT-${String(i + 1).padStart(2, '0')}`,
        station: s.name,
        message: s.status === 'critical' ? 'Critical passenger density' : 'Congestion detected',
        people: s.waitingPassengers || 0,
        severity: s.status === 'critical' ? 'high' : 'medium'
      }));

    res.json({ kpis, passengerChart, notifications, stations, buses, hourlyAnalytics });
  } catch (error) {
    res.status(500).json(error);
  }
});

/////////////////// Analytics ///////////////////
app.get('/api/analytics', adminMiddleware, async (req, res) => {
  try {
    const analytics = await Analytics.findOne().sort({ createdAt: -1 }).lean();
    res.json({
      overview: analytics?.metrics || {},
      weeklyData: analytics?.weeklyData || [],
      monthlyData: analytics?.monthlyData || [],
      previousData: analytics?.previousData || [],
      dateRanges: analytics?.dateRanges || [],
      terminals: analytics?.terminals || []
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

app.get('/api/hourly-analytics', adminMiddleware, async (req, res) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 24, 1), 168);
    const query = {};
    if (req.query.station_id) query.station_id = String(req.query.station_id);

    const hourlyAnalytics = await HourlyAnalytics
      .find(query)
      .sort({ timestamp: -1, station_id: 1 })
      .limit(limit)
      .lean();

    res.json({ hourlyAnalytics });
  } catch (error) {
    res.status(500).json(error);
  }
});

app.post('/api/analytics', adminMiddleware, async (req, res) => {
  try {
    const analytics = await Analytics.create(req.body);
    res.status(201).json({ message: 'Analytics created', analytics });
  } catch (error) {
    res.status(500).json(error);
  }
});

/////////////////// Home ///////////////////
app.get('/api/home', async (req, res) => {
  try {
    const analytics = await Analytics.findOne().sort({ createdAt: -1 }).lean();
    const stations = await Station.find().lean();

    const rankings = stations
      .slice()
      .sort((a, b) => (b.waitingPassengers || 0) - (a.waitingPassengers || 0))
      .slice(0, 3)
      .map((s, i) => ({
        rank: i + 1,
        title: s.name,
        subtitle: `${s.waitingPassengers || 0} waiting / ${s.incomingBuses || 'N/A'}`,
        severity: s.status === 'critical' ? 'critical' : s.status === 'alert' ? 'warning' : 'normal'
      }));

    res.json({
      passengerChart: analytics ? { weekly: analytics.weeklyData, monthly: analytics.monthlyData } : { weekly: [], monthly: [] },
      stations,
      rankings
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

/////////////////// Map ///////////////////
app.get('/api/map', adminMiddleware, async (req, res) => {
  try {
    const stations = await Station.find({}, { stationId: 1, name: 1, location: 1, waitingPassengers: 1, incomingBuses: 1, status: 1 }).lean();
    res.json({ stations });
  } catch (error) {
    res.status(500).json(error);
  }
});

/////////////////// Live Feed ///////////////////
app.get('/api/livefeed/detection', adminMiddleware, (req, res) => {
  res.json(getLivefeedDetectionStatus());
});

app.get('/api/livefeed/cameras', adminMiddleware, async (req, res) => {
  try {
    const settings = await getSettingsDocument();
    const cameras = (settings?.hardware || [])
      .map(normalizeHardware)
      .filter(item => item.type === 'camera')
      .map((item, index) => {
        const running = detectorProcesses.get(item.deviceId);
        const detection = formatDetectionStatus(
          cameraDetections.get(item.deviceId) || {},
          running ? `/api/livefeed/stream/${item.deviceId}` : ''
        );
        return {
          deviceId: item.deviceId,
          name: item.name,
          ip: item.ip,
          rtspUrl: item.rtspUrl,
          status: item.status,
          running: Boolean(running),
          streamUrl: running ? `/api/livefeed/stream/${item.deviceId}` : '',
          port: running?.port || DETECTOR_BASE_PORT + index + 1,
          detection,
        };
      });

    res.json({ cameras });
  } catch (error) {
    res.status(500).json(error);
  }
});

io.on('connection', (socket) => {
  console.log(`[SOCKET.IO] Client connected: ${socket.id}`);

  socket.on('detection:update', async (payload) => {
    const detectionState = updateLivefeedDetection(payload);
    if (!detectionState) {
      console.warn('[SOCKET.IO] Invalid detection payload received');
      socket.emit('detection:error', { message: 'Invalid detection payload' });
      return;
    }

    try {
      if (isMongoConnected()) {
        await updateHourlyAnalytics(payload, detectionState);
      }
    } catch (error) {
      console.error('[HOURLY_ANALYTICS] Could not update hourly analytics:', error);
    }

    // console.log(
    //   `[SOCKET.IO] detection:update camera=${livefeedDetection.cameraId} count=${livefeedDetection.count}`
    // );
    io.emit('detection:broadcast', getLivefeedDetectionStatus());
  });

  socket.on('disconnect', () => {
    console.log(`[SOCKET.IO] Client disconnected: ${socket.id}`);
  });
});

/////////////////// Feedback ///////////////////
app.get('/api/feedback', adminMiddleware, async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 }).lean();
    const summary = {
      unresolved: feedbacks.filter(f => f.status !== 'resolved').length,
      resolved: feedbacks.filter(f => f.status === 'resolved').length
    };
    res.json({ summary, feedbacks });
  } catch (error) {
    res.status(500).json(error);
  }
});

app.post('/api/feedback', async (req, res) => {
  try {
    const { message, rating } = req.body;
    const normalizedMessage = String(message || '').trim();
    const normalizedRating = Number(rating);

    if (!normalizedMessage) {
      return res.status(400).json({ message: 'Feedback message is required' });
    }

    if (!Number.isInteger(normalizedRating) || normalizedRating < 1 || normalizedRating > 5) {
      return res.status(400).json({ message: 'Rating must be a number from 1 to 5' });
    }

    const user = await User.findById(req.user.id).select('username').lean();
    const feedback = await Feedback.create({
      userName: user?.username || 'Unknown user',
      message: normalizedMessage,
      rating: normalizedRating,
      status: 'unresolved',
      response: ''
    });

    res.status(201).json({ message: 'Feedback created', feedback });
  } catch (error) {
    res.status(500).json(error);
  }
});

app.patch('/api/feedback/:id', adminMiddleware, async (req, res) => {
  try {
    const { status, response } = req.body;
    const update = {};

    if (status !== undefined) {
      if (!['unresolved', 'resolved'].includes(status)) {
        return res.status(400).json({ message: 'Invalid feedback status' });
      }
      update.status = status;
    }

    if (response !== undefined) {
      update.response = String(response).trim();
    }

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ message: 'No feedback changes provided' });
    }

    const feedback = await Feedback.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true
    });
    if (!feedback) return res.status(404).json({ message: 'Feedback not found' });
    res.json({ message: 'Feedback updated', feedback });
  } catch (error) {
    res.status(500).json(error);
  }
});

/////////////////// Settings ///////////////////
app.get('/api/settings', adminMiddleware, async (req, res) => {
  try {
    const includeReferenceImages = req.query.includeReferenceImages === 'true';
    const settings = await getSettingsDocument(includeReferenceImages);
    const normalizedSettings = normalizeSettingsForResponse(settings || {});
    res.json(includeReferenceImages ? normalizedSettings : sanitizeSettingsForResponse(normalizedSettings));
  } catch (error) {
    res.status(500).json(error);
  }
});

app.put('/api/settings', adminMiddleware, async (req, res) => {
  try {
    const payloadBody = stripReferenceImagesFromSettingsPayload(req.body);
    const existingSettings = Array.isArray(payloadBody.hardware) || payloadBody.livefeed
      ? await Setting.findOne().lean()
      : await getSettingsDocument();
    const payload = normalizeSettingsPayload(payloadBody, existingSettings, {
      preserveExistingReferenceImage: true
    });
    if (!Array.isArray(payloadBody.hardware)) {
      delete payload.hardware;
    }

    const settings = await Setting.findOneAndUpdate(
      {},
      { $set: payload },
      { returnDocument: 'after', upsert: true, projection: SETTINGS_LIGHT_PROJECTION }
    ).lean();
    await syncHardwareDetectors(settings);
    res.json({ message: 'Settings saved', settings: sanitizeSettingsForResponse(settings) });
  } catch (error) {
    res.status(500).json(error);
  }
});

/////////////////// Settings - Zones ///////////////////
app.post('/api/settings/zones', adminMiddleware, async (req, res) => {
  try {
    const settings = await Setting.findOneAndUpdate(
      {},
      { $push: { zones: req.body } },
      { returnDocument: 'after', upsert: true }
    );
    res.json({ message: 'Zone added', settings: sanitizeSettingsForResponse(settings) });
  } catch (error) {
    res.status(500).json(error);
  }
});

app.put('/api/settings/zones/:index', adminMiddleware, async (req, res) => {
  try {
    const index = parseInt(req.params.index);
    const settings = await Setting.findOne();
    if (!settings) return res.status(404).json({ message: 'Settings not found' });

    settings.zones[index] = { ...settings.zones[index].toObject(), ...req.body };
    settings.markModified('zones');
    await settings.save();
    res.json({ message: 'Zone updated', settings: sanitizeSettingsForResponse(settings) });
  } catch (error) {
    res.status(500).json(error);
  }
});

app.delete('/api/settings/zones/:index', adminMiddleware, async (req, res) => {
  try {
    const index = parseInt(req.params.index);
    const settings = await Setting.findOne();
    if (!settings) return res.status(404).json({ message: 'Settings not found' });

    settings.zones.splice(index, 1);
    settings.markModified('zones');
    await settings.save();
    res.json({ message: 'Zone deleted', settings: sanitizeSettingsForResponse(settings) });
  } catch (error) {
    res.status(500).json(error);
  }
});

/////////////////// Settings - Hardware ///////////////////
app.get('/api/settings/hardware', adminMiddleware, async (req, res) => {
  try {
    const includeReferenceImages = req.query.includeReferenceImages === 'true';
    const settings = await getSettingsDocument(includeReferenceImages);
    res.json(Array.isArray(settings?.hardware)
      ? settings.hardware.map((item, index) => normalizeHardware(item, index))
      : []);
  } catch (error) {
    res.status(500).json(error);
  }
});

app.post('/api/settings/hardware', adminMiddleware, async (req, res) => {
  try {
    const currentSettings = await getSettingsDocument();
    const hardware = normalizeHardware(req.body, currentSettings?.hardware?.length || 0);
    const settings = await Setting.findOneAndUpdate(
      {},
      { $push: { hardware } },
      { returnDocument: 'after', upsert: true }
    );
    await syncHardwareDetectors(settings?.toObject ? settings.toObject() : settings);
    res.json({ message: 'Hardware added', settings: sanitizeSettingsForResponse(settings) });
  } catch (error) {
    res.status(500).json(error);
  }
});

app.put('/api/settings/hardware/:hardwareId', adminMiddleware, async (req, res) => {
  try {
    const settings = await Setting.findOne();
    if (!settings) return res.status(404).json({ message: 'Settings not found' });

    const index = getHardwareIndex(settings, req.params.hardwareId);
    if (!Number.isInteger(index) || index < 0 || index >= settings.hardware.length) {
      return res.status(404).json({ message: 'Hardware not found' });
    }

    const existingHardware = settings.hardware[index].toObject();
    settings.hardware[index] = normalizeHardware(
      { ...existingHardware, ...req.body },
      index,
      existingHardware,
      { preserveExistingReferenceImage: true }
    );
    settings.markModified('hardware');
    await settings.save();
    await syncHardwareDetectors(settings.toObject());
    res.json({ message: 'Hardware updated', settings: sanitizeSettingsForResponse(settings) });
  } catch (error) {
    res.status(500).json(error);
  }
});

app.get('/api/settings/hardware/:hardwareId/livefeed/status', adminMiddleware, async (req, res) => {
  try {
    const hardwareId = normalizeHardwareIdentifier(req.params.hardwareId);
    const normalizedHardwareId = mongoose.Types.ObjectId.isValid(hardwareId)
      ? new mongoose.Types.ObjectId(hardwareId)
      : null;
    const hardwareExpression = /^\d+$/.test(hardwareId)
      ? { $arrayElemAt: [{ $ifNull: ['$hardware', []] }, Number(hardwareId)] }
      : {
          $first: {
            $filter: {
              input: { $ifNull: ['$hardware', []] },
              as: 'hardware',
              cond: {
                $or: [
                  { $eq: ['$$hardware.deviceId', hardwareId] },
                  ...(normalizedHardwareId ? [{ $eq: ['$$hardware._id', normalizedHardwareId] }] : [])
                ]
              }
            }
          }
        };

    const [result] = await Setting.aggregate([
      {
        $project: {
          hardware: hardwareExpression
        }
      },
      {
        $project: {
          livefeed: {
            dwellSeconds: '$hardware.livefeed.dwellSeconds',
            zones: '$hardware.livefeed.zones',
            referenceImageBytes: {
              $strLenBytes: { $ifNull: ['$hardware.livefeed.referenceImage', ''] }
            }
          }
        }
      }
    ]).option({ maxTimeMS: 5000 });

    if (!result?.livefeed) {
      return res.status(404).json({ message: 'Hardware not found' });
    }

    res.json({ livefeed: result.livefeed });
  } catch (error) {
    res.status(500).json(error);
  }
});

app.put('/api/settings/hardware/:hardwareId/livefeed', adminMiddleware, async (req, res) => {
  try {
    const settings = await getSettingsDocument();
    if (!settings) return res.status(404).json({ message: 'Settings not found' });

    const index = getHardwareIndex(settings, req.params.hardwareId);
    if (!Number.isInteger(index) || index < 0 || index >= settings.hardware.length) {
      return res.status(404).json({ message: 'Hardware not found' });
    }

    const hardware = settings.hardware[index];
    if (hardware.type !== 'camera') {
      return res.status(400).json({ message: 'Livefeed grid can only be saved for camera hardware' });
    }

    const livefeed = normalizeLivefeedConfig(stripReferenceImagesFromSettingsPayload({ livefeed: req.body }).livefeed, hardware.name);
    const setFields = {
      [`hardware.${index}.livefeed.dwellSeconds`]: livefeed.dwellSeconds,
      [`hardware.${index}.livefeed.zones`]: livefeed.zones
    };

    const updatedSettings = await Setting.findOneAndUpdate(
      {},
      { $set: setFields },
      { returnDocument: 'after', projection: SETTINGS_LIGHT_PROJECTION }
    ).lean();
    await syncHardwareDetectors(updatedSettings);
    res.json({ message: 'Hardware livefeed saved', livefeed });
  } catch (error) {
    res.status(500).json(error);
  }
});

app.delete('/api/settings/hardware/:hardwareId', adminMiddleware, async (req, res) => {
  try {
    const settings = await Setting.findOne();
    if (!settings) return res.status(404).json({ message: 'Settings not found' });

    const index = getHardwareIndex(settings, req.params.hardwareId);
    if (!Number.isInteger(index) || index < 0 || index >= settings.hardware.length) {
      return res.status(404).json({ message: 'Hardware not found' });
    }

    settings.hardware.splice(index, 1);
    settings.markModified('hardware');
    await settings.save();
    await syncHardwareDetectors(settings.toObject());
    res.json({ message: 'Hardware deleted', settings: sanitizeSettingsForResponse(settings) });
  } catch (error) {
    res.status(500).json(error);
  }
});

/////////////////// Stations ///////////////////
app.post('/api/stations', adminMiddleware, async (req, res) => {
  try {
    const station = await Station.create(req.body);
    res.status(201).json({ message: 'Station created', station });
  } catch (error) {
    res.status(500).json(error);
  }
});

// GET all stations
app.get('/api/stations', adminMiddleware, async (req, res) => {
  try {
    const stations = await Station.find().lean();
    res.json(stations);
  } catch (error) {
    res.status(500).json(error);
  }
});

// BULK save stations
const saveStationsBulk = async (req, res) => {
  try {
    const { stations } = req.body;
    if (!Array.isArray(stations)) return res.status(400).json({ message: 'Stations must be an array' });

    await Station.deleteMany({});
    const sanitizedStations = stations.map(({ _id, ...rest }) => rest);
    await Station.insertMany(sanitizedStations);

    const savedStations = await Station.find().lean();
    res.json({ message: 'Stations saved', stations: savedStations });
  } catch (error) {
    res.status(500).json(error);
  }
};

app.put('/api/stations-bulk', adminMiddleware, saveStationsBulk);
app.put('/api/stations/bulk', adminMiddleware, saveStationsBulk);

// PUT update station
app.put('/api/stations/:id', adminMiddleware, async (req, res) => {
  try {
    const station = await Station.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!station) return res.status(404).json({ message: 'Station not found' });
    res.json({ message: 'Station updated', station });
  } catch (error) {
    res.status(500).json(error);
  }
});

// DELETE station
app.delete('/api/stations/:id', adminMiddleware, async (req, res) => {
  try {
    const station = await Station.findByIdAndDelete(req.params.id);
    if (!station) return res.status(404).json({ message: 'Station not found' });
    res.json({ message: 'Station deleted' });
  } catch (error) {
    res.status(500).json(error);
  }
});

/////////////////// Buses ///////////////////
app.post('/api/buses', adminMiddleware, async (req, res) => {
  try {
    const bus = await Bus.create(req.body);
    res.status(201).json({ message: 'Bus created', bus });
  } catch (error) {
    res.status(500).json(error);
  }
});
/////////////////// API สำหรับ User ธรรมดา (Home) ///////////////////

// 1. เพิ่ม API ดึงแผนที่สำหรับ User ธรรมดา (ไม่มี adminMiddleware)
app.get('/api/user-map', async (req, res) => {
  try {
    const stations = await Station.find({}, { stationId: 1, name: 1, location: 1, waitingPassengers: 1, incomingBuses: 1, status: 1 }).lean();
    res.json({ stations });
  } catch (error) {
    res.status(500).json(error);
  }
});

// 2. เพิ่ม API ดึงข้อมูล User Profile ปัจจุบัน
app.get('/api/user/me', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password').lean();
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.json({
      id: user._id,
      name: user.username,
      email: user.email || '', 
      role: user.role,
      avatar: user.avatar || 'https://i.pravatar.cc/150?img=11' 
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

/////////////////// Start server ///////////////////
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
