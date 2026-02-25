const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const { protect } = require('../middleware/auth');

// @desc    Create a new room
// @route   POST /api/rooms
router.post('/', protect, async (req, res) => {
  const { name, roomId } = req.body;

  try {
    const room = await Room.create({
      roomId,
      name,
      host: req.user._id,
      participants: [req.user._id],
    });

    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get room by ID
// @route   GET /api/rooms/:roomId
router.get('/:roomId', protect, async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId })
      .populate('host', 'username')
      .populate('participants', 'username');

    if (room) {
      res.json(room);
    } else {
      res.status(404).json({ message: 'Room not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
