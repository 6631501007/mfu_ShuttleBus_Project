const mongoose = require('mongoose');  // เพิ่มบรรทัดนี้

const stationSchema = new mongoose.Schema({
  stationId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  desc: { type: String, default: '' },
  zone: String,
  location: { lat: Number, lng: Number },
  capacity: { type: Number, default: 100 },
  waitingPassengers: { type: Number, default: 0 },
  incomingBuses: { type: String, default: 'N/A' },
  status: {
    type: String,
    enum: ['normal', 'alert', 'critical'],
    default: 'normal'
  }
}, { timestamps: true });

module.exports = mongoose.model('Station', stationSchema);