function roleGuard(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: '403 Forbidden - Access Denied'
      });
    }

    next();
  };
}

module.exports = roleGuard;
