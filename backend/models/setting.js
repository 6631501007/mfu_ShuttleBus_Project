const mongoose = require('mongoose');

const zoneSchema = new mongoose.Schema(
  {
    name: String,
    desc: String,
    currentPassengers: Number,
    limit: Number,
    color: String,
    criticalPercent: Number
  },
  { _id: false }
);

const notificationChannelsSchema = new mongoose.Schema(
  {
    emailEnabled: Boolean,
    smsEnabled: Boolean,
    emails: [String],
    mobiles: [String]
  },
  { _id: false }
);

const hardwareSchema = new mongoose.Schema(
  {
    deviceId: String,
    name: String,
    type: String,
    ip: String,
    status: String,
    details: String
  },
  { _id: false }
);

const settingSchema = new mongoose.Schema(
  {
    zones: [zoneSchema],
    notificationChannels: notificationChannelsSchema,
    delayThreshold: { type: Number, default: 15 },
    hardware: [hardwareSchema]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Setting', settingSchema);
