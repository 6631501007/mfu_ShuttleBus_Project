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
  ],
  livefeed: {
    dwellSeconds: { type: Number, default: 30 },
    referenceImage: { type: String, default: '' },
    zones: [
      {
        name: { type: String, default: 'Counting Zone' },
        x: { type: Number, default: 20 },
        y: { type: Number, default: 20 },
        width: { type: Number, default: 60 },
        height: { type: Number, default: 60 },
        color: { type: String, default: '#16a34a' },
        enabled: { type: Boolean, default: true }
      }
    ]
  }
}, { timestamps: true });

module.exports = mongoose.model('Setting', settingSchema);
