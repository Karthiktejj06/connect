const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  host: {
    type: String, // Store Clerk User ID
    required: true,
  },
  canvasData: {
    type: String, // Store as Base64 or JSON string of strokes
    default: '',
  },
  participants: [{
    type: String, // Store Clerk User IDs
  }],
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
