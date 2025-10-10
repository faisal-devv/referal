const connectDB = require('../../config/database');
const { setCorsHeaders, handleOptions } = require('./_utils');

module.exports = async (req, res) => {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return handleOptions(res);
  }

  try {
    // Emit a structured log for observability in Vercel logs
    console.log('health_check', {
      path: req.url,
      method: req.method,
      ip: req.headers['x-forwarded-for'] || (req.socket && req.socket.remoteAddress) || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      at: new Date().toISOString()
    });

    await connectDB();

    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Database connection failed',
      timestamp: new Date().toISOString()
    });
  }
};
