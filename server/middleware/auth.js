import jwt from 'jsonwebtoken';
import db from '../database.js';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

export function checkMaintenanceMode(req, res, next) {
  // Skip maintenance check for owner
  if (req.user && req.user.role === 'owner') {
    return next();
  }

  const setting = db.prepare('SELECT value FROM settings WHERE key = ?').get('maintenance_mode');
  
  if (setting && setting.value === 'true') {
    return res.status(503).json({ 
      error: 'Site is under maintenance',
      maintenance: true 
    });
  }
  
  next();
}
