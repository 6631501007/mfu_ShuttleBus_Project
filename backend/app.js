const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require("./models/user");

const app = express();
app.use(express.json());

const PORT = 3000;
const SECRET_KEY = 'APc-QA'; // เปลี่ยนได้ใน production
const MONGO_URI = 'mongodb+srv://user:1111@cluster0.lbtbl38.mongodb.net/APC-QA?retryWrites=true&w=majority'

// Middleware
app.use(cors());
app.use(express.json());

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({
        message: 'No Token'
      });
    }

    const decoded = jwt.verify(token, SECRET_KEY);

    req.user = decoded;

    next();
  } catch (error) {
    res.status(401).json({
      message: 'Invalid Token'
    });
  }
};

//MongoDB Connection
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

/////////////////// Register ///////////////////
app.post('/register', async (req, res) => {
  try {
    const { username, password, confirmPassword, role } = req.body;

    // เช็ค username ซ้ำ
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(400).json({
        message: 'Username already exists'
      });
    }

    // เช็ค password ตรงกันมั้ย
    if (password !== confirmPassword) {
      return res.status(400).json({
        message: 'Passwords do not match'
      });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const newUser = new User({
      username,
      password: hashedPassword,
      role
    });

    await newUser.save();

    res.json({
      message: 'Register Success'
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

/////////////////// Login ///////////////////
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // หา user
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: 'Wrong password'
      });
    }

    // create token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      SECRET_KEY,
      {
        expiresIn: '1d'
      }
    );

    res.json({
      message: 'Login Success',
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

/////////////////// Start server ///////////////////
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});