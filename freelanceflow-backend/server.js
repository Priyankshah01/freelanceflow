// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

// Load environment variables
dotenv.config();

const app = express();

/* ----------------------------- CORS SETUP ----------------------------- */
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Preflight support
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    const origin = req.headers.origin;
    if (origin && corsOptions.origin.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Vary', 'Origin');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', corsOptions.methods.join(', '));
    res.header('Access-Control-Allow-Headers', corsOptions.allowedHeaders.join(', '));
    return res.sendStatus(204);
  }
  next();
});

/* -------------------------- Body & Logging -------------------------- */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.get('origin') || 'none'}`);
  next();
});

/* -------------------------- Database -------------------------- */
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch((error) => console.error('❌ MongoDB connection error:', error));

/* -------------------------- Base Routes -------------------------- */
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'FreelanceFlow API is running!',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

/* -------------------------- Load Routes -------------------------- */
try {
  app.use('/api/auth', require('./routes/auth'));
  console.log('✅ Auth routes loaded');
} catch {
  console.log('⚠️  Auth routes not found');
}

try {
  app.use('/api/users', require('./routes/users'));
  console.log('✅ User routes loaded');
} catch {
  console.log('⚠️  User routes not found');
}

try {
  app.use('/api/projects', require('./routes/projects'));
  console.log('✅ Project routes loaded');
} catch {
  console.log('⚠️  Project routes not found');
}

try {
  app.use('/api/proposals', require('./routes/proposals'));
  console.log('✅ Proposal routes loaded');
} catch {
  console.log('⚠️  Proposal routes not found');
}

/* -------------------------- Error Handling -------------------------- */
app.use((error, req, res, next) => {
  console.error('Error:', error.message);
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    method: req.method,
    availableRoutes: [
      'GET /',
      'GET /api/health',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/auth/me'
    ]
  });
});

/* -------------------------- Socket.IO Setup -------------------------- */
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: corsOptions.origin,
    methods: corsOptions.methods,
    credentials: true
  }
});

// Attach io to app so controllers can emit events
app.set('io', io);

io.on('connection', (socket) => {
  const userId = socket.handshake.query?.userId;
  if (userId) {
    socket.join(`user:${userId}`);
    console.log(`🔌 User connected to room: user:${userId}`);
  }

  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${userId || socket.id}`);
  });
});

/* -------------------------- Start Server -------------------------- */
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 API Base URL: http://localhost:${PORT}`);
  console.log(`🌐 Frontend URL: http://localhost:3000 or http://localhost:5173`);
});
