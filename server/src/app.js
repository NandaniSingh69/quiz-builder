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
// Initialize Socket.IO
const io = initializeSocket(httpServer);

// Store io instance in app for use in controllers
app.set('io', io);


// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5000', 'http://127.0.0.1:5500'],
  credentials: true
}));
app.use(express.json());

// Serve static files (for test HTML)
app.use(express.static(path.join(__dirname, '../')));

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Quiz Builder API is running!',
    endpoints: {
      quiz: '/api/quiz',
      session: '/api/session',
      test: '/test-socket.html'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// API routes
app.use('/api/quiz', quizRoutes);
app.use('/api/session', sessionRoutes);

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔌 Socket.IO ready for real-time connections`);
  console.log(`🧪 Test page: http://localhost:${PORT}/test-socket.html`);
});
