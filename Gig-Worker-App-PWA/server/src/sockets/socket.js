const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake?.auth?.token;
      if (!token) return next();
      const raw = token.startsWith('Bearer ') ? token.split(' ')[1] : token;
      const decoded = jwt.verify(raw, process.env.JWT_SECRET || 'fallback_secret');
      socket.userId = String(decoded.id);
      return next();
    } catch (_) {
      return next();
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    if (socket.userId) {
      socket.join(socket.userId);
    }

    // Worker sending location
    socket.on('location:update', (data) => {
      // emit to dashboard
      socket.broadcast.emit('dashboard:location:update', data);
    });

    // New claim
    socket.on('claim:new', (data) => {
      socket.broadcast.emit('admin:claim:new', data);
    });

    // Chat messages
    socket.on('chat:message', (data) => {
      io.emit('chat:message', data);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIo = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

module.exports = { initSocket, getIo };
