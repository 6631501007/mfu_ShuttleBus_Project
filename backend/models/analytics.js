const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  dateRanges: [String],
  terminals: [
    {
      id: String,
      name: String
    }
  ],
  metrics: {
    avgPassengerFlow: Number,
    peakOccupancy: String,
    avgWaitTime: String,
    totalEntries: Number
  },
  weeklyData: [
    {
      label: String,
      value: Number
    }
  ],
  monthlyData: [
    {
      label: String,
      value: Number
    }
  ],
  previousData: [
    {
      label: String,
      value: Number
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Analytics', analyticsSchema);
