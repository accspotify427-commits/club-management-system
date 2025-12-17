import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// All owner routes require owner role
router.use(authenticateToken);
router.use(requireRole('owner'));

// Get settings
router.get('/settings', (req, res) => {
  const settings = db.prepare('SELECT * FROM settings').all();
  const settingsObj = {};
  settings.forEach(s => {
    settingsObj[s.key] = s.value;
  });
  res.json(settingsObj);
});

// Update setting
router.put('/settings/:key', (req, res) => {
  const { value } = req.body;
  
  db.prepare(`
    INSERT INTO settings (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = ?
  `).run(req.params.key, value, value);
  
  res.json({ message: 'Setting updated successfully' });
});

// Toggle maintenance mode
router.post('/maintenance', (req, res) => {
  const { enabled } = req.body;
  
  db.prepare(`
    INSERT INTO settings (key, value) VALUES ('maintenance_mode', ?)
    ON CONFLICT(key) DO UPDATE SET value = ?
  `).run(enabled ? 'true' : 'false', enabled ? 'true' : 'false');
  
  res.json({ 
    message: `Maintenance mode ${enabled ? 'enabled' : 'disabled'}`,
    maintenance_mode: enabled
  });
});

// Get all users
router.get('/users', (req, res) => {
  const users = db.prepare('SELECT id, email, name, role, created_at FROM users').all();
  res.json(users);
});

// Create admin
router.post('/admins', (req, res) => {
  const { email, password, name } = req.body;
  
  const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (existingUser) {
    return res.status(400).json({ error: 'Email already exists' });
  }
  
  const hashedPassword = bcrypt.hashSync(password, 10);
  
  const result = db.prepare(`
    INSERT INTO users (email, password, name, role)
    VALUES (?, ?, ?, 'admin')
  `).run(email, hashedPassword, name);
  
  res.json({ 
    id: result.lastInsertRowid,
    message: 'Admin created successfully' 
  });
});

// Update user role
router.put('/users/:id/role', (req, res) => {
  const { role } = req.body;
  
  if (!['user', 'admin', 'owner'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }
  
  db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, req.params.id);
  
  res.json({ message: 'User role updated successfully' });
});

// Delete user
router.delete('/users/:id', (req, res) => {
  // Prevent deleting yourself
  if (parseInt(req.params.id) === req.user.id) {
    return res.status(400).json({ error: 'Cannot delete yourself' });
  }
  
  db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  res.json({ message: 'User deleted successfully' });
});

export default router;
