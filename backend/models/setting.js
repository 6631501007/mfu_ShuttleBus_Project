const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  zones: [
    {
      name: String,
      desc: String,
      currentPassengers: Number,
      limit: Number,
      color: String,
      criticalPercent: { type: Number, default: null }
    }
  ],
  notificationChannels: {
    emailEnabled: { type: Boolean, default: false },
    smsEnabled: { type: Boolean, default: false },
    emails: [String],
    mobiles: [String]
  },
  delayThreshold: { type: Number, default: 15 },
  hardware: [
    {
      deviceId: String,
      name: String,
      type: { type: String, enum: ['sensor', 'camera', 'other'] },
      ip: String,
      status: { type: String, enum: ['online', 'offline'], default: 'offline' },
      details: String
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Setting', settingSchema);
