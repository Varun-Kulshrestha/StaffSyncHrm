function errorHandler(err, req, res, next) {
  console.error('[SERVER ERROR]:', err.message);

  // Return 500 for unhandled exceptions (supports DEFECT-002)
  return res.status(500).json({
    status: 'error',
    message: err.message || 'Internal Server Error'
  });
}

module.exports = errorHandler;
