const mongoose = require('mongoose');

const stationSchema = new mongoose.Schema({
  stationId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  zone: String,
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  waitingPassengers: { type: Number, default: 0 },
  incomingBuses: { type: String, default: 'N/A' },
  status: {
    type: String,
    enum: ['normal', 'alert', 'critical'],
    default: 'normal'
  },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Station', stationSchema);
