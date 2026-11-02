require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDb } = require('./database/initDb');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize SQLite Database and Seed Data
initDb();

// Middlewares
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'StaffSync HRM Backend API',
    database: 'SQLite (staffsync.db)',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/employees', employeeRoutes);
app.use('/api/v1/leaves', leaveRoutes);

// Undefined Route Fallback (404)
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Global Error Handler
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`  StaffSync HRM Express Server running on Port ${PORT}`);
    console.log(`  API Base URL: http://localhost:${PORT}/api/v1`);
    console.log(`  Health Check: http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);
  });
}

module.exports = app;
