require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDb } = require('./db');
const authRoutes = require('./routes/auth.routes');
const todoRoutes = require('./routes/todo.routes');
const app = express();
const PORT = process.env.PORT || 5000;
// Updated CORS configuration to secure communication with your frontends
const allowedOrigins = [
  'https://main.d23js2i5fwqmif.amplifyapp.com',
  'http://localhost:3000',
  'http://127.0.0.1:5500',
  'http://51.21.33.30',
  'http://todo.jo3.org',
  'https://todo.jo3.org',
  'http://www.todo.jo3.org',
  'https://www.todo.jo3.org',
  'https://hvfakja0j8.execute-api.eu-north-1.amazonaws.com' // API Gateway invoke URL
];
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date(),
    env: process.env.NODE_ENV || 'development'
  });
});
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);
// Centralized 404 Error Handler for undefined endpoints
app.use((req, res, next) => {
  res.status(404).json({ error: `Route not found: ${req.originalUrl}` });
});
// Centralized Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.message);
  res.status(500).json({ error: 'Internal Server Error' });
});
async function start() {
  try {
    await initDb();
    app.listen(PORT, () => {
      console.log(`Backend server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}
start();