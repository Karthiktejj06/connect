const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @desc    Register a new user
// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      username,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
const { protect } = require('../middleware/auth');
router.put('/profile', protect, async (req, res) => {
  try {
    const user = req.user; // Already found by protect middleware
    user.username = req.body.username || user.username;
    const updatedUser = await user.save();
    
    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      token: generateToken(updatedUser._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/profile/password', protect, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user._id); // Need it here to get password field (if select -password was used)

    if (user && (await user.comparePassword(currentPassword))) {
      user.password = newPassword;
      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid current password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete user account
// @route   DELETE /api/auth/profile
router.delete('/profile', protect, async (req, res) => {
  try {
    console.log(`Auth API: Deletion request for user ${req.user?._id}`);
    const user = await User.findById(req.user._id);
    if (user) {
      await User.deleteOne({ _id: req.user._id });
      console.log(`Auth API: User ${req.user._id} deleted successfully`);
      res.json({ message: 'User removed' });
    } else {
      console.log(`Auth API: User ${req.user?._id} not found for deletion`);
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Auth API: Deletion error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Google login
// @route   POST /api/auth/google
router.post('/google', async (req, res) => {
  const { idToken } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { name, email } = ticket.getPayload();

    let user = await User.findOne({ email });

    if (!user) {
      // Create a password-less user
      // We generate a random password because User model might require it
      const randomPassword = Math.random().toString(36).slice(-8);
      user = await User.create({
        username: name,
        email,
        password: randomPassword,
      });
    }

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Google Auth Error:', error.message);
    res.status(401).json({ message: 'Google authentication failed' });
  }
});

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

module.exports = router;
