const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const Room = require('./models/Room');

dotenv.config();

const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/rooms');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // In production, restrict this to your frontend URL
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);

const rooms = new Map(); // Track users in each room: roomId -> Map(socket.id -> { username, userId })

// Socket.io logic
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join-room', ({ roomId, username, userId }) => {
    socket.join(roomId);
    socket.username = username;
    socket.roomId = roomId;
    socket.userId = userId; 

    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Map());
    }
    rooms.get(roomId).set(socket.id, { username, userId });

    console.log(`Server: ${username} (${userId}) joined room: ${roomId}`);
    
    // Broadcast full user objects for reliable host/me labeling
    const userList = Array.from(rooms.get(roomId).values())
      .map(u => ({ username: u.username, _id: u.userId }));
      
    console.log(`Server: Broadcasting user-list for room ${roomId}:`, userList);
    io.to(roomId).emit('user-list', userList);
    
    socket.to(roomId).emit('chat-message', { 
      message: `${username} joined the room`, 
      username: 'System', 
      time: new Date().toLocaleTimeString() 
    });
  });

  socket.on('draw', ({ roomId, drawData }) => {
    socket.to(roomId).emit('draw', drawData);
  });

  // WebRTC Signaling Generic Handler
  socket.on('signaling', ({ roomId, to, type, data }) => {
    if (to) {
      // Targeted signaling
      const targetSocket = Array.from(io.sockets.sockets.values()).find(s => s.username === to && s.roomId === roomId);
      if (targetSocket) {
        targetSocket.emit('signaling', { type, data, from: socket.username });
      }
    } else {
      // Broadcast signaling (legacy fallback)
      socket.to(roomId).emit('signaling', { type, data, from: socket.username });
    }
  });

  socket.on('clear-board', ({ roomId }) => {
    socket.to(roomId).emit('clear-board');
  });

  socket.on('chat-message', ({ roomId, message, username }) => {
    io.to(roomId).emit('chat-message', { message, username, time: new Date().toLocaleTimeString() });
  });

  socket.on('disconnect', () => {
    if (socket.roomId && rooms.has(socket.roomId)) {
      rooms.get(socket.roomId).delete(socket.id);
      console.log(`Server: User ${socket.username} disconnected from room ${socket.roomId}`);
      
      const userList = Array.from(rooms.get(socket.roomId).values())
        .map(u => ({ username: u.username, _id: u.userId }));
        
      console.log(`Server: Broadcasting updated user-list for room ${socket.roomId}:`, userList);
      io.to(socket.roomId).emit('user-list', userList);
    }
    console.log('Server: socket disconnected:', socket.id);
  });

  socket.on('update-username', ({ roomId, userId, newUsername }) => {
    if (rooms.has(roomId) && rooms.get(roomId).has(socket.id)) {
      console.log(`Server: Updating username for ${userId} to ${newUsername} in room ${roomId}`);
      
      // Update the socket records
      socket.username = newUsername;
      rooms.get(roomId).get(socket.id).username = newUsername;

      // Broadcast updated list
      const userList = Array.from(rooms.get(roomId).values())
        .map(u => ({ username: u.username, _id: u.userId }));

      io.to(roomId).emit('user-list', userList);
      
      // Add system message about name change
      io.to(roomId).emit('chat-message', { 
        message: `System: A user changed their name to ${newUsername}`, 
        username: 'System', 
        time: new Date().toLocaleTimeString() 
      });
    }
  });
});

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
