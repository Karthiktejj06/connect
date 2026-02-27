const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Note: With Clerk, most authentication (Login/Register) happens on the frontend.
// These routes can be used for things like profile management or syncing.

// @desc    Update user profile
// @route   PUT /api/auth/profile
router.put('/profile', protect, async (req, res) => {
  // In a real app with Clerk, you might update the user in Clerk's database too.
  // For now, we'll just acknowledge the request or update our local DB if we keep one.
  res.json(req.user);
});

// @desc    Delete user account
// @route   DELETE /api/auth/profile
router.delete('/profile', protect, async (req, res) => {
  try {
    // You would call Clerk API to delete the user here if needed
    res.json({ message: 'User removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
