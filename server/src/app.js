
// Import the express library
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Create an express application
const app = express();

// Middleware - these run before your routes
app.use(cors()); // Allows frontend to connect
app.use(express.json()); // Allows reading JSON data

// Your first route - a simple test
app.get('/', (req, res) => {
  res.json({ message: 'Quiz Builder API is running!' });
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
