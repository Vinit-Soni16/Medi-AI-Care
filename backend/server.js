import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import mongoose from 'mongoose';
import { initSocket } from './sockets/appointment.js';
import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import documentRoutes from './routes/documents.js';
import appointmentRoutes from './routes/appointments.js';
import vitalRoutes from './routes/vitals.js';
import userRoutes from './routes/users.js';
import { errorHandler } from './middleware/errorHandler.js';
import dns from 'dns';

// Fix for querySrv ECONNREFUSED on some Windows systems and local ISPs
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}
// Force Google DNS to resolve MongoDB Atlas SRV records correctly
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (error) {
  console.warn('⚠️ Could not set DNS servers:', error.message);
}

dotenv.config();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// ─── Core Middleware ───────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Attach io to every request
app.use((req, _res, next) => {
  req.io = io;
  next();
});

// ─── Health check (no DB needed) ──────────────────────────────────────────────
app.get('/', (_req, res) => res.send('MediVision API is running.'));

app.get('/health', (_req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbLabel = ['disconnected', 'connected', 'connecting', 'disconnecting'][dbState] || 'unknown';
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    db: dbLabel,
    gemini: !!process.env.GOOGLE_GEMINI_API_KEY,
  });
});

// ─── DB Guard Middleware ───────────────────────────────────────────────────────
// Returns a clean 503 response when MongoDB is not connected, instead of crashing
const requireDB = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: 'Database not connected. Please set MONGODB_URI in your backend .env file and restart the server.',
      hint: 'Run: mongod  (local) or set your Atlas URI in backend/.env',
      code: 'DB_NOT_CONNECTED',
    });
  }
  next();
};

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', requireDB, authRoutes);
app.use('/api/chat', requireDB, chatRoutes);
app.use('/api/documents', requireDB, documentRoutes);
app.use('/api/appointments', requireDB, appointmentRoutes);
app.use('/api/vitals', requireDB, vitalRoutes);
app.use('/api/users', requireDB, userRoutes);

// 404 fallback
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));

// Error handler
app.use(errorHandler);

// ─── Socket.io ────────────────────────────────────────────────────────────────
initSocket(io);

// ─── DB + Server ──────────────────────────────────────────────────────────────
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('\n⚠️  MONGODB_URI not set in .env');
    console.warn('   → Set it to: mongodb://127.0.0.1:27017/medivision  (local)');
    console.warn('   → Or use MongoDB Atlas connection string\n');
    return;
  }
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ MongoDB connected:', mongoose.connection.host);
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    console.warn('   Server will start but API calls requiring DB will return 503\n');
    // Don't exit — let the server start so health check still works
  }
};

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  httpServer.listen(PORT, () => {
    const dbStatus = mongoose.connection.readyState === 1 
      ? '✅ Connected' 
      : (process.env.MONGODB_URI ? '❌ Connection Error!' : '❌ Missing MONGODB_URI');
    const geminiStatus = process.env.GOOGLE_GEMINI_API_KEY ? '✅ Configured' : '⚠️  Not set (AI features disabled)';
    console.log(`\n🚀 MediAI Care  →  http://localhost:${PORT}`);
    console.log(`🌐 Frontend       →  ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    console.log(`🗄️  MongoDB        →  ${dbStatus}`);
    console.log(`🤖 Gemini AI      →  ${geminiStatus}`);
    console.log(`📋 Health check   →  http://localhost:${PORT}/health\n`);
  });
});
