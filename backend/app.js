const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const User = require('./models/user');
const Station = require('./models/station');
const Bus = require('./models/bus');
const Feedback = require('./models/feedback');
const Analytics = require('./models/analytics');
const Setting = require('./models/setting');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.JWT_SECRET;
const MONGO_URI = process.env.MONGO_URI;

const requiredEnv = ['JWT_SECRET', 'MONGO_URI'];
const missingEnv = requiredEnv.filter(key => !process.env[key]);

if (missingEnv.length > 0) {
  console.error(`Missing required environment variables: ${missingEnv.join(', ')}`);
  process.exit(1);
}

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    if (!token) return res.status(401).json({ message: 'No Token' });
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid Token' });
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

/////////////////// Register ///////////////////
app.post('/register', async (req, res) => {
  try {
    const { username, password, confirmPassword } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: 'Username already exists' });
    if (password !== confirmPassword) return res.status(400).json({ message: 'Passwords do not match' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword, role: 'user' });
    await newUser.save();
    res.json({ message: 'Register Success' });
  } catch (error) {
    res.status(500).json(error);
  }
});

/////////////////// Login ///////////////////
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Wrong password' });
    const token = jwt.sign({ id: user._id, role: user.role }, SECRET_KEY, { expiresIn: '1d' });
    res.json({ message: 'Login Success', token, user: { id: user._id, username: user.username, role: user.role } });
  } catch (error) {
    res.status(500).json(error);
  }
});

app.use('/api', authMiddleware);

/////////////////// Dashboard ///////////////////
app.get('/api/dashboard', adminMiddleware, async (req, res) => {
  try {
    const stations = await Station.find().lean();
    const buses = await Bus.find().lean();
    const analytics = await Analytics.findOne().sort({ createdAt: -1 }).lean();

    const passengerChart = analytics
      ? { weekly: analytics.weeklyData, monthly: analytics.monthlyData }
      : { weekly: [], monthly: [] };

    const totalPassengers = stations.reduce((sum, s) => sum + (s.waitingPassengers || 0), 0);
    const activeBuses = buses.filter(b => b.status === 'on route').length;
    const stillBuses = buses.filter(b => b.status === 'standby').length;
    const maintainBuses = buses.filter(b => b.status === 'maintenance').length;

    const kpis = [
      { title: 'TOTAL PASSENGERS', value: totalPassengers, trend: 'Current waiting', type: 'positive' },
      { title: 'ACTIVE BUSES', value: activeBuses, trend: 'On route', type: 'positive' },
      { title: 'STILL BUSES', value: stillBuses, trend: 'Standby at station', type: 'neutral' },
      { title: 'MAINTAIN BUSES', value: maintainBuses, trend: 'Under maintenance', type: 'warning' }
    ];

    const notifications = stations
      .filter(s => s.status === 'alert' || s.status === 'critical')
      .map((s, i) => ({
        id: `NOT-${String(i + 1).padStart(2, '0')}`,
        station: s.name,
        message: s.status === 'critical' ? 'Critical passenger density' : 'Congestion detected',
        people: s.waitingPassengers || 0,
        severity: s.status === 'critical' ? 'high' : 'medium'
      }));

    res.json({ kpis, passengerChart, notifications, stations, buses });
  } catch (error) {
    res.status(500).json(error);
  }
});

/////////////////// Analytics ///////////////////
app.get('/api/analytics', adminMiddleware, async (req, res) => {
  try {
    const analytics = await Analytics.findOne().sort({ createdAt: -1 }).lean();
    res.json({
      overview: analytics?.metrics || {},
      weeklyData: analytics?.weeklyData || [],
      monthlyData: analytics?.monthlyData || [],
      previousData: analytics?.previousData || [],
      dateRanges: analytics?.dateRanges || [],
      terminals: analytics?.terminals || []
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

app.post('/api/analytics', adminMiddleware, async (req, res) => {
  try {
    const analytics = await Analytics.create(req.body);
    res.status(201).json({ message: 'Analytics created', analytics });
  } catch (error) {
    res.status(500).json(error);
  }
});

/////////////////// Home ///////////////////
app.get('/api/home', async (req, res) => {
  try {
    const analytics = await Analytics.findOne().sort({ createdAt: -1 }).lean();
    const stations = await Station.find().lean();

    const rankings = stations
      .slice()
      .sort((a, b) => (b.waitingPassengers || 0) - (a.waitingPassengers || 0))
      .slice(0, 3)
      .map((s, i) => ({
        rank: i + 1,
        title: s.name,
        subtitle: `${s.waitingPassengers || 0} waiting / ${s.incomingBuses || 'N/A'}`,
        severity: s.status === 'critical' ? 'critical' : s.status === 'alert' ? 'warning' : 'normal'
      }));

    res.json({
      passengerChart: analytics ? { weekly: analytics.weeklyData, monthly: analytics.monthlyData } : { weekly: [], monthly: [] },
      stations,
      rankings
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

/////////////////// Map ///////////////////
app.get('/api/map', adminMiddleware, async (req, res) => {
  try {
    const stations = await Station.find({}, { stationId: 1, name: 1, location: 1, waitingPassengers: 1, incomingBuses: 1, status: 1 }).lean();
    res.json({ stations });
  } catch (error) {
    res.status(500).json(error);
  }
});

/////////////////// Feedback ///////////////////
app.get('/api/feedback', adminMiddleware, async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 }).lean();
    const summary = {
      newFeedback: feedbacks.filter(f => f.status === 'new').length,
      resolved: feedbacks.filter(f => f.status === 'resolved').length
    };
    res.json({ summary, feedbacks });
  } catch (error) {
    res.status(500).json(error);
  }
});

app.post('/api/feedback', adminMiddleware, async (req, res) => {
  try {
    const { userName, message, rating } = req.body;
    const feedback = await Feedback.create({ userName, message, rating });
    res.status(201).json({ message: 'Feedback created', feedback });
  } catch (error) {
    res.status(500).json(error);
  }
});

app.patch('/api/feedback/:id', adminMiddleware, async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!feedback) return res.status(404).json({ message: 'Feedback not found' });
    res.json({ message: 'Feedback updated', feedback });
  } catch (error) {
    res.status(500).json(error);
  }
});

/////////////////// Settings ///////////////////
app.get('/api/settings', adminMiddleware, async (req, res) => {
  try {
    const settings = await Setting.findOne().lean();
    res.json(settings || {});
  } catch (error) {
    res.status(500).json(error);
  }
});

app.put('/api/settings', adminMiddleware, async (req, res) => {
  try {
    const settings = await Setting.findOneAndUpdate({}, req.body, { new: true, upsert: true });
    if (settings) {
      settings.markModified('notificationChannels');
      settings.markModified('hardware');
      await settings.save();
    }
    res.json({ message: 'Settings saved', settings });
  } catch (error) {
    res.status(500).json(error);
  }
});

/////////////////// Settings - Zones ///////////////////
app.post('/api/settings/zones', adminMiddleware, async (req, res) => {
  try {
    const settings = await Setting.findOneAndUpdate(
      {},
      { $push: { zones: req.body } },
      { new: true, upsert: true }
    );
    res.json({ message: 'Zone added', settings });
  } catch (error) {
    res.status(500).json(error);
  }
});

app.put('/api/settings/zones/:index', adminMiddleware, async (req, res) => {
  try {
    const index = parseInt(req.params.index);
    const settings = await Setting.findOne();
    if (!settings) return res.status(404).json({ message: 'Settings not found' });

    settings.zones[index] = { ...settings.zones[index].toObject(), ...req.body };
    settings.markModified('zones');
    await settings.save();
    res.json({ message: 'Zone updated', settings });
  } catch (error) {
    res.status(500).json(error);
  }
});

app.delete('/api/settings/zones/:index', adminMiddleware, async (req, res) => {
  try {
    const index = parseInt(req.params.index);
    const settings = await Setting.findOne();
    if (!settings) return res.status(404).json({ message: 'Settings not found' });

    settings.zones.splice(index, 1);
    settings.markModified('zones');
    await settings.save();
    res.json({ message: 'Zone deleted', settings });
  } catch (error) {
    res.status(500).json(error);
  }
});

/////////////////// Settings - Hardware ///////////////////
app.post('/api/settings/hardware', adminMiddleware, async (req, res) => {
  try {
    const settings = await Setting.findOneAndUpdate(
      {},
      { $push: { hardware: req.body } },
      { new: true, upsert: true }
    );
    res.json({ message: 'Hardware added', settings });
  } catch (error) {
    res.status(500).json(error);
  }
});

app.put('/api/settings/hardware/:index', adminMiddleware, async (req, res) => {
  try {
    const index = parseInt(req.params.index);
    const settings = await Setting.findOne();
    if (!settings) return res.status(404).json({ message: 'Settings not found' });

    settings.hardware[index] = { ...settings.hardware[index].toObject(), ...req.body };
    settings.markModified('hardware');
    await settings.save();
    res.json({ message: 'Hardware updated', settings });
  } catch (error) {
    res.status(500).json(error);
  }
});

app.delete('/api/settings/hardware/:index', adminMiddleware, async (req, res) => {
  try {
    const index = parseInt(req.params.index);
    const settings = await Setting.findOne();
    if (!settings) return res.status(404).json({ message: 'Settings not found' });

    settings.hardware.splice(index, 1);
    settings.markModified('hardware');
    await settings.save();
    res.json({ message: 'Hardware deleted', settings });
  } catch (error) {
    res.status(500).json(error);
  }
});

/////////////////// Stations ///////////////////
app.post('/api/stations', adminMiddleware, async (req, res) => {
  try {
    const station = await Station.create(req.body);
    res.status(201).json({ message: 'Station created', station });
  } catch (error) {
    res.status(500).json(error);
  }
});

// GET all stations
app.get('/api/stations', adminMiddleware, async (req, res) => {
  try {
    const stations = await Station.find().lean();
    res.json(stations);
  } catch (error) {
    res.status(500).json(error);
  }
});

// BULK save stations
const saveStationsBulk = async (req, res) => {
  try {
    const { stations } = req.body;
    if (!Array.isArray(stations)) return res.status(400).json({ message: 'Stations must be an array' });

    await Station.deleteMany({});
    const sanitizedStations = stations.map(({ _id, ...rest }) => rest);
    await Station.insertMany(sanitizedStations);

    const savedStations = await Station.find().lean();
    res.json({ message: 'Stations saved', stations: savedStations });
  } catch (error) {
    res.status(500).json(error);
  }
};

app.put('/api/stations-bulk', adminMiddleware, saveStationsBulk);
app.put('/api/stations/bulk', adminMiddleware, saveStationsBulk);

// PUT update station
app.put('/api/stations/:id', adminMiddleware, async (req, res) => {
  try {
    const station = await Station.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!station) return res.status(404).json({ message: 'Station not found' });
    res.json({ message: 'Station updated', station });
  } catch (error) {
    res.status(500).json(error);
  }
});

// DELETE station
app.delete('/api/stations/:id', adminMiddleware, async (req, res) => {
  try {
    const station = await Station.findByIdAndDelete(req.params.id);
    if (!station) return res.status(404).json({ message: 'Station not found' });
    res.json({ message: 'Station deleted' });
  } catch (error) {
    res.status(500).json(error);
  }
});

/////////////////// Buses ///////////////////
app.post('/api/buses', adminMiddleware, async (req, res) => {
  try {
    const bus = await Bus.create(req.body);
    res.status(201).json({ message: 'Bus created', bus });
  } catch (error) {
    res.status(500).json(error);
  }
});


/////////////////// Start server ///////////////////
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
