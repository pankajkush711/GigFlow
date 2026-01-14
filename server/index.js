import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';

import authRoutes from './routes/auth.js';
import gigRoutes from './routes/gigs.js';
import bidRoutes from './routes/bids.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

/* ================= SOCKET.IO ================= */
const io = new Server(server, {
  cors: {
    origin: true,
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// ✅ ADD THIS MAP
const userSockets = new Map();

// ✅ SOCKET CONNECTION
io.on('connection', (socket) => {
  const { userId } = socket.handshake.query;

  if (userId) {
    userSockets.set(String(userId), socket.id);
  }

  socket.on('disconnect', () => {
    for (const [uid, sid] of userSockets.entries()) {
      if (sid === socket.id) {
        userSockets.delete(uid);
        break;
      }
    }
  });
});

// ✅ EXPORT THIS FUNCTION (THIS FIXES THE ERROR)
export const notifyUserHired = (userId, payload) => {
  const socketId = userSockets.get(String(userId));
  if (socketId) {
    io.to(socketId).emit('hired', payload);
  }
};

/* ================= ROOT ROUTE ================= */
app.get('/', (req, res) => {
  res.status(200).send('GigFlow backend is running');
});

/* ================= MIDDLEWARE ================= */
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

/* ================= ROUTES ================= */
app.use('/api/auth', authRoutes);
app.use('/api/gigs', gigRoutes);
app.use('/api/bids', bidRoutes);

/* ================= SERVER ================= */
const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

/* ================= DATABASE ================= */
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB error:', err));
