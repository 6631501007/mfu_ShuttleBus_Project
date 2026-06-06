const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/user');
const Station = require('./models/station');
const Bus = require('./models/bus');
const Feedback = require('./models/feedback');
const Analytics = require('./models/analytics');
const Setting = require('./models/setting');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;
const SECRET_KEY = 'APc-QA'; // เปลี่ยนได้ใน production
const MONGO_URI = 'mongodb+srv://user:1111@cluster0.lbtbl38.mongodb.net/APC-QA?retryWrites=true&w=majority';

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ message: 'No Token' });
    }

    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid Token' });
  }
};

const seedDatabase = async () => {
  const stationCount = await Station.countDocuments();
  if (stationCount === 0) {
    await Station.create([
      {
        stationId: 'ST-14',
        name: 'Station: 14 - M-square Building',
        zone: 'Red Zone',
        location: { lat: 20.04582132999694, lng: 99.89134391063925 },
        waitingPassengers: 20,
        incomingBuses: '0 mins away',
        status: 'alert'
      },
      {
        stationId: 'ST-09',
        name: 'Station: 9 - Swimming Pool',
        zone: 'Main Route',
        location: { lat: 20.04566810292221, lng: 99.89155253753619 },
        waitingPassengers: 12,
        incomingBuses: '5 mins away',
        status: 'normal'
      },
      {
        stationId: 'ST-08',
        name: 'Station: 8 - D1 Building',
        zone: 'Campus',
        location: { lat: 20.0473286489084, lng: 99.8932291391427 },
        waitingPassengers: 8,
        incomingBuses: '12 mins away',
        status: 'normal'
      },
      {
        stationId: 'ST-01',
        name: 'VIP Terminal',
        zone: 'Premium',
        location: { lat: 20.046500, lng: 99.892000 },
        waitingPassengers: 32,
        incomingBuses: '2 mins away',
        status: 'critical'
      }
    ]);
  }

  const busCount = await Bus.countDocuments();
  if (busCount === 0) {
    await Bus.create([
      {
        busId: 'BUS-001',
        route: 'Route A',
        status: 'on route',
        currentLocation: { lat: 20.0451, lng: 99.8927 },
        eta: '3 mins'
      },
      {
        busId: 'BUS-002',
        route: 'Route B',
        status: 'standby',
        currentLocation: { lat: 20.0467, lng: 99.8936 },
        eta: 'Arriving'
      },
      {
        busId: 'BUS-003',
        route: 'Route C',
        status: 'maintenance',
        currentLocation: { lat: 20.0482, lng: 99.8949 },
        eta: 'TBD'
      }
    ]);
  }

  const feedbackCount = await Feedback.countDocuments();
  if (feedbackCount === 0) {
    await Feedback.create([
      {
        userName: 'สมชาย นิยม',
        message: 'จังหวะการมาของรถเมล์ไม่ตรงตามกำหนดเวลา บางครั้งช้ามากเลย ต้องรอนานขึ้นจากปกติถึง 30 นาที',
        rating: 2,
        status: 'new'
      },
      {
        userName: 'นชั่ว ชัยวัฒน์',
        message: 'แอปมีปัญหาเรื่องการแสดงตำแหน่งรถเมล์แบบ Real-time ข้อมูลไม่ตรงกับความเป็นจริง',
        rating: 1,
        status: 'new'
      },
      {
        userName: 'กรรมการ เรียนรู้',
        message: 'ขอบคุณที่ปรับปรุงฟีเจอร์การแจ้งเตือนล่วงหน้า มีประโยชน์มากสำหรับการวางแผนการเดินทาง',
        rating: 5,
        status: 'resolved',
        response: 'ขอบคุณที่ให้ความเห็นเพื่อปรับปรุงการบริการ เราจะพัฒนาต่อไป'
      },
      {
        userName: 'ปรมาภ บุญสิ่ง',
        message: 'ต้องการให้เพิ่มช่องทางการชำระเงินอื่นๆ นอกจากบัตรเครดิต เช่น QR Code Payment',
        rating: 3,
        status: 'resolved',
        response: 'ขอบคุณสำหรับข้อเสนอแนะ ทีมเราจะประเมินความเป็นไปได้ในการเพิ่ม QR Code Payment'
      }
    ]);
  }

  const analyticsCount = await Analytics.countDocuments();
  if (analyticsCount === 0) {
    await Analytics.create({
      dateRange: 'Oct 01, 2023 - Oct 31, 2023',
      terminal: 'All Main Concourses',
      metrics: {
        avgPassengerFlow: 12482,
        peakOccupancy: '84%',
        avgWaitTime: '6.5m',
        totalEntries: 386900
      },
      weeklyData: [
        { label: 'Mon', value: 72000 },
        { label: 'Tue', value: 85000 },
        { label: 'Wed', value: 80000 },
        { label: 'Thu', value: 92000 },
        { label: 'Fri', value: 98000 },
        { label: 'Sat', value: 82000 },
        { label: 'Sun', value: 70000 }
      ],
      monthlyData: [
        { label: 'Week 1', value: 320000 },
        { label: 'Week 2', value: 410000 },
        { label: 'Week 3', value: 365000 },
        { label: 'Week 4', value: 445000 }
      ],
      previousData: [
        { label: 'Mon', value: 68000 },
        { label: 'Tue', value: 79000 },
        { label: 'Wed', value: 76000 },
        { label: 'Thu', value: 88000 },
        { label: 'Fri', value: 93000 },
        { label: 'Sat', value: 77000 },
        { label: 'Sun', value: 69000 }
      ]
    });
  }

  const settingCount = await Setting.countDocuments();
  if (settingCount === 0) {
    await Setting.create({
      zones: [
        {
          name: 'Station: 14 - M-square',
          desc: 'Red Zone Area',
          currentPassengers: 382,
          limit: 450,
          color: 'red',
          criticalPercent: 90
        },
        {
          name: 'Station: 9 - Swimming pool',
          desc: 'Main Route Wait Area',
          currentPassengers: 50,
          limit: 120,
          color: 'blue',
          criticalPercent: null
        },
        {
          name: 'VIP Terminal',
          desc: 'Premium Lounge Area',
          currentPassengers: 51,
          limit: 75,
          color: 'yellow',
          criticalPercent: null
        }
      ],
      notificationChannels: {
        emailEnabled: true,
        smsEnabled: false,
        emails: ['admin-ops@busstop.com'],
        mobiles: []
      },
      delayThreshold: 15,
      hardware: [
        {
          deviceId: 'HW-001',
          name: 'Sensor-Unit-001',
          type: 'sensor',
          ip: '192.168.1.20',
          status: 'online',
          details: 'FW 3.1 • 192.168.1.20'
        },
        {
          deviceId: 'HW-002',
          name: 'Camera-Feed-03',
          type: 'camera',
          ip: '192.168.1.22',
          status: 'offline',
          details: 'FW 2.8 • 192.168.1.22'
        }
      ]
    });
  }
};

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log('MongoDB Connected');
    await seedDatabase();
  })
  .catch(err => console.error('MongoDB connection error:', err));

/////////////////// Register ///////////////////
app.post('/register', async (req, res) => {
  try {
    const { username, password, confirmPassword, role } = req.body;
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword, role });
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

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Wrong password' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, SECRET_KEY, { expiresIn: '1d' });

    res.json({
      message: 'Login Success',
      token,
      user: { id: user._id, username: user.username, role: user.role }
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

/////////////////// Dashboard ///////////////////
app.get('/api/dashboard', async (req, res) => {
  try {
    const stations = await Station.find().lean();
    const buses = await Bus.find().lean();
    const analytics = await Analytics.findOne().sort({ createdAt: -1 }).lean();

    const passengerChart = analytics
      ? { weekly: analytics.weeklyData, monthly: analytics.monthlyData }
      : { weekly: [], monthly: [] };

    const totalPassengers = stations.reduce((sum, station) => sum + (station.waitingPassengers || 0), 0);
    const activeBuses = buses.filter(bus => bus.status === 'on route').length;
    const stillBuses = buses.filter(bus => bus.status === 'standby').length;
    const maintainBuses = buses.filter(bus => bus.status === 'maintenance').length;

    const kpis = [
      { title: 'TOTAL PASSENGERS', value: totalPassengers, trend: 'Current waiting', type: 'positive' },
      { title: 'ACTIVE BUSES', value: activeBuses, trend: 'On route', type: 'positive' },
      { title: 'STILL BUSES', value: stillBuses, trend: 'Standby at station', type: 'neutral' },
      { title: 'MAINTAIN BUSES', value: maintainBuses, trend: 'Under maintenance', type: 'warning' }
    ];

    const notifications = stations
      .filter(station => station.status === 'alert' || station.status === 'critical')
      .map((station, index) => ({
        id: `NOT-${String(index + 1).padStart(2, '0')}`,
        station: station.name,
        message: station.status === 'critical' ? 'Critical passenger density' : 'Congestion detected',
        people: station.waitingPassengers || 0,
        severity: station.status === 'critical' ? 'high' : 'medium'
      }));

    res.json({ kpis, passengerChart, notifications, stations, buses });
  } catch (error) {
    res.status(500).json(error);
  }
});

/////////////////// Analytics ///////////////////
app.get('/api/analytics', async (req, res) => {
  try {
    const analytics = await Analytics.findOne().sort({ createdAt: -1 }).lean();

    const dateRanges = ['Oct 01, 2023 - Oct 31, 2023', 'Nov 01, 2023 - Nov 30, 2023', 'Dec 01, 2023 - Dec 31, 2023'];
    const terminals = [
      { id: 'T-A', name: 'All Main Concourses' },
      { id: 'T-B', name: 'Terminal A' },
      { id: 'T-C', name: 'Terminal B' },
      { id: 'T-D', name: 'Terminal C' }
    ];

    res.json({
      overview: analytics ? analytics.metrics : {},
      weeklyData: analytics ? analytics.weeklyData : [],
      monthlyData: analytics ? analytics.monthlyData : [],
      previousData: analytics ? analytics.previousData : [],
      dateRanges,
      terminals
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

/////////////////// Home ///////////////////
app.get('/api/home', async (req, res) => {
  try {
    const analytics = await Analytics.findOne().sort({ createdAt: -1 }).lean();
    const stations = await Station.find().lean();

    const ranks = stations
      .slice()
      .sort((a, b) => (b.waitingPassengers || 0) - (a.waitingPassengers || 0))
      .slice(0, 3)
      .map((station, index) => ({
        rank: index + 1,
        title: station.name,
        subtitle: `${station.waitingPassengers || 0} waiting / ${station.incomingBuses || 'N/A'}`,
        severity: station.status === 'critical' ? 'critical' : station.status === 'alert' ? 'warning' : 'normal'
      }));

    res.json({
      passengerChart: analytics ? { weekly: analytics.weeklyData, monthly: analytics.monthlyData } : { weekly: [], monthly: [] },
      stations,
      rankings: ranks
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

/////////////////// Map ///////////////////
app.get('/api/map', async (req, res) => {
  try {
    const stations = await Station.find({}, { stationId: 1, name: 1, location: 1, waitingPassengers: 1, incomingBuses: 1, status: 1 }).lean();
    res.json({ stations });
  } catch (error) {
    res.status(500).json(error);
  }
});

/////////////////// Feedback ///////////////////
app.get('/api/feedback', async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 }).lean();
    const summary = {
      newFeedback: feedbacks.filter(item => item.status === 'new').length,
      resolved: feedbacks.filter(item => item.status === 'resolved').length
    };

    res.json({ summary, feedbacks });
  } catch (error) {
    res.status(500).json(error);
  }
});

app.post('/api/feedback', async (req, res) => {
  try {
    const { userName, message, rating } = req.body;
    const feedback = await Feedback.create({ userName, message, rating });
    res.status(201).json({ message: 'Feedback created', feedback });
  } catch (error) {
    res.status(500).json(error);
  }
});

app.patch('/api/feedback/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const feedback = await Feedback.findByIdAndUpdate(id, updates, { new: true });
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    res.json({ message: 'Feedback updated', feedback });
  } catch (error) {
    res.status(500).json(error);
  }
});

/////////////////// Settings ///////////////////
app.get('/api/settings', async (req, res) => {
  try {
    const settings = await Setting.findOne().lean();
    res.json(settings || {});
  } catch (error) {
    res.status(500).json(error);
  }
});

app.put('/api/settings', async (req, res) => {
  try {
    const updates = req.body;
    const settings = await Setting.findOneAndUpdate({}, updates, { new: true, upsert: true });
    res.json({ message: 'Settings saved', settings });
  } catch (error) {
    res.status(500).json(error);
  }
});

/////////////////// Start server ///////////////////
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});