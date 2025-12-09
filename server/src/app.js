const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const connectDB = require('./config/database');
const initializeSocket = require('./config/socket');
const quizRoutes = require('./routes/quizRoutes');
const sessionRoutes = require('./routes/sessionRoutes');

const app = express();

// Create HTTP server
const httpServer = http.createServer(app);

// Initialize Socket.IO
const io = initializeSocket(httpServer);

// Store io instance in app for use in controllers
app.set('io', io);

// Connect to MongoDB
connectDB();

// Middleware - UPDATED FOR PRODUCTION
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (for test HTML)
app.use(express.static(path.join(__dirname, '../')));

// Health check (important for Render)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development',
    mongodb: require('mongoose').connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Quiz Builder API is running!',
    version: '1.0.0',
    endpoints: {
      quiz: '/api/quiz',
      session: '/api/session',
      health: '/health'
    }
  });
});

// API routes
app.use('/api/quiz', quizRoutes);
app.use('/api/session', sessionRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Route not found' 
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
});

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔌 Socket.IO ready for real-time connections`);
  console.log(`💾 MongoDB: ${require('mongoose').connection.readyState === 1 ? 'Connected' : 'Connecting...'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  httpServer.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
