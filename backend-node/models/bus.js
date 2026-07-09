const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
  busId: { type: String, required: true, unique: true },
  route: String,
  status: {
    type: String,
    enum: ['on route', 'standby', 'maintenance'],
    default: 'standby'
  },
  currentLocation: {
    lat: Number,
    lng: Number
  },
  eta: String
}, { timestamps: true });

module.exports = mongoose.model('Bus', busSchema);