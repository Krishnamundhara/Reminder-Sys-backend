const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const { initializeDatabase } = require('./utils/dbInit');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000; // Changed to 5000 for backend API

// Initialize database
initializeDatabase()
  .then(() => console.log('Database initialized successfully'))
  .catch(err => console.error('Database initialization error:', err));

// Set up middleware
// Set up CORS before other middleware
app.use(cors({
  origin: 'https://remindersys.netlify.app',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 200
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Set up session middleware with more persistent configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  proxy: true,
  cookie: {
    secure: true, // Required for cross-site cookies
    sameSite: 'none',  // Required for cross-site cookies
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true
  },
  rolling: true,
  cookie: { 
    secure: false, // Set to false in both dev and prod since we might not have HTTPS
    sameSite: 'lax', // Use lax to allow cross-site requests
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    domain: process.env.NODE_ENV === 'production' ? process.env.COOKIE_DOMAIN : undefined // Only set domain in production
  }
}));

// Import routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');

// API health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is running' });
});

// Use routes with API prefix
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Backend API running on port ${PORT}`);
});
