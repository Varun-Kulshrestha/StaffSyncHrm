require('dotenv').config();

module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || 'staffsync_hrm_production_jwt_secret_key_2026',
  JWT_EXPIRES_IN: '8h'
};
