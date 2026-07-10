const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const mongoose = require('mongoose');

const Analytics = require('../models/analytics');
const Station = require('../models/station');

const MONGO_URI = process.env.MONGO_URI || process.env.MONGOURL || '';

if (!MONGO_URI) {
  console.error('Please set MONGO_URI in environment or backend-node/.env');
  process.exit(1);
}

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const stations = await Station.find().lean().catch(() => []);

  const terminals = stations.map(s => ({ id: s.stationId || String(s._id), name: s.name || 'Station' }));

  const totalWaiting = stations.reduce((sum, s) => sum + (s.waitingPassengers || 0), 0) || rand(20, 200);

  const weeklyData = [];
  for (let i = 6; i >= 0; i--) {
    weeklyData.push({ label: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString(), value: rand(Math.max(10, totalWaiting / 2), Math.max(50, totalWaiting * 2)) });
  }

  const monthlyData = [];
  for (let i = 1; i <= 30; i += 3) {
    monthlyData.push({ label: `Day ${i}`, value: rand(Math.max(20, totalWaiting / 2), Math.max(100, totalWaiting * 3)) });
  }

  const previousData = weeklyData.map(w => ({ label: w.label, value: Math.max(0, Math.round(w.value * (0.6 + Math.random() * 0.8))) }));

  const metrics = {
    avgPassengerFlow: Math.floor(totalWaiting / Math.max(1, terminals.length)),
    peakOccupancy: `${rand(30, 95)}%`,
    avgWaitTime: `${(rand(30, 300) / 60).toFixed(1)}m`,
    totalEntries: weeklyData.reduce((s, x) => s + x.value, 0)
  };

  const dateRanges = ['Today', 'Last 7 Days (1 Week)', 'Last 30 Days (1 Month)', 'This Month', 'Custom Date...'];

  const doc = await Analytics.create({ dateRanges, terminals, metrics, weeklyData, monthlyData, previousData });

  console.log('Inserted Analytics document id:', doc._id.toString());

  await mongoose.disconnect();
  console.log('Disconnected, done.');
}

main().catch(err => {
  console.error('Error seeding analytics:', err);
  process.exit(1);
});
