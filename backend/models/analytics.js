const mongoose = require('mongoose');

const metricPointSchema = new mongoose.Schema(
  {
    label: String,
    value: Number
  },
  { _id: false }
);

const analyticsSchema = new mongoose.Schema(
  {
    dateRange: String,
    terminal: String,
    metrics: {
      avgPassengerFlow: Number,
      peakOccupancy: String,
      avgWaitTime: String,
      totalEntries: Number
    },
    weeklyData: [metricPointSchema],
    monthlyData: [metricPointSchema],
    previousData: [metricPointSchema]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Analytics', analyticsSchema);
