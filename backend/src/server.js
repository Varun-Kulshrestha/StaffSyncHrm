const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'StaffSync HRM Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', adminRoutes);

// 404 Handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Global Error Handler
// Catches unhandled errors (e.g. DEFECT 2: CRITICAL_ACCOUNT_DEACTIVATED_EXCEPTION)
app.use((err, req, res, next) => {
  console.error('[ERROR HANDLER]:', err.message);
  return res.status(500).json({
    status: 'error',
    message: `Internal Server Error: ${err.message}`
  });
});

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`  StaffSync HRM Backend Server running on port ${PORT}`);
    console.log(`  API Base URL: http://localhost:${PORT}/api/v1`);
    console.log(`  Health Check: http://localhost:${PORT}/api/health`);
    console.log(`===============================================`);
  });
}

module.exports = app;
