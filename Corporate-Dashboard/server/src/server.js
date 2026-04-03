import http from 'http';
import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './config/db.js';
import { migrateLegacyEmployees, seedSuperAdmin } from './services/seedService.js';

dotenv.config();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

app.locals.io = io;

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next();
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_change_me');
    socket.user = decoded;
    socket.join(decoded.sub);
    return next();
  } catch (err) {
    return next(new Error('socket unauthorized'));
  }
});

io.on('connection', (socket) => {
  socket.on('location:update', (payload) => {
    io.emit('dashboard:location:update', {
      userId: socket.user?.sub,
      ...payload
    });
  });

  socket.on('claim:new', (payload) => {
    io.emit('admin:claim:new', payload);
  });

  socket.on('chat:message', (payload) => {
    io.emit('chat:ticket:update', payload);
  });
});

const PORT = process.env.PORT || 5001;

async function start() {
  await connectDB();
  await migrateLegacyEmployees();
  await seedSuperAdmin();
  server.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('startup_failed', err);
  process.exit(1);
});
