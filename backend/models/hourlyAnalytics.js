const mongoose = require('mongoose');

const hourlyAnalyticsSchema = new mongoose.Schema({
  station_id: { type: String, required: true },
  camera_id: { type: String, default: '' },
  date: { type: Date, required: true },
  hour: { type: Number, required: true, min: 0, max: 23 },
  timestamp: { type: Date, required: true },
  timezone: { type: String, default: 'UTC' },
  current_queue_count: { type: Number, default: 0 },
  max_queue_count: { type: Number, default: 0 },
  min_queue_count: { type: Number, default: 0 },
  avg_queue_time_seconds: { type: Number, default: 0 },
  median_queue_time_seconds: { type: Number, default: 0 },
  peak_time: { type: String, default: '' },
  peak_queue_count: { type: Number, default: 0 },
  total_persons_processed: { type: Number, default: 0 },
  sample_count: { type: Number, default: 0 },
  queue_time_samples_seconds: { type: [Number], default: [], select: false },
  last_total_persons_seen: { type: Number, default: 0, select: false }
}, {
  collection: 'hourly_analytics',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  versionKey: false
});

hourlyAnalyticsSchema.index({ station_id: 1, timestamp: 1 }, { unique: true });
hourlyAnalyticsSchema.index({ timestamp: -1 });

module.exports = mongoose.model('HourlyAnalytics', hourlyAnalyticsSchema);
