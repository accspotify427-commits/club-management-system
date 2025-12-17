import express from 'express';
import db from '../database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require admin or owner role
router.use(authenticateToken);
router.use(requireRole('admin', 'owner'));

// Create event
router.post('/events', (req, res) => {
  const { title, description, date, time, price, capacity, image_url } = req.body;
  
  const result = db.prepare(`
    INSERT INTO events (title, description, date, time, price, capacity, image_url, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(title, description, date, time, price, capacity, image_url || '', req.user.id);
  
  res.json({ 
    id: result.lastInsertRowid,
    message: 'Event created successfully' 
  });
});

// Update event
router.put('/events/:id', (req, res) => {
  const { title, description, date, time, price, capacity, image_url } = req.body;
  
  db.prepare(`
    UPDATE events 
    SET title = ?, description = ?, date = ?, time = ?, price = ?, capacity = ?, image_url = ?
    WHERE id = ?
  `).run(title, description, date, time, price, capacity, image_url || '', req.params.id);
  
  res.json({ message: 'Event updated successfully' });
});

// Delete event
router.delete('/events/:id', (req, res) => {
  db.prepare('DELETE FROM events WHERE id = ?').run(req.params.id);
  res.json({ message: 'Event deleted successfully' });
});

// Get all bookings
router.get('/bookings', (req, res) => {
  const bookings = db.prepare(`
    SELECT b.*, e.title as event_title, u.name as user_name, u.email as user_email
    FROM bookings b
    JOIN events e ON b.event_id = e.id
    JOIN users u ON b.user_id = u.id
    ORDER BY b.booking_date DESC
  `).all();
  
  res.json(bookings);
});

// Send notification to all users
router.post('/notifications/broadcast', (req, res) => {
  const { message, type } = req.body;
  
  const users = db.prepare('SELECT id FROM users WHERE role = "user"').all();
  
  const insert = db.prepare(`
    INSERT INTO notifications (user_id, message, type)
    VALUES (?, ?, ?)
  `);
  
  users.forEach(user => {
    insert.run(user.id, message, type || 'info');
  });
  
  res.json({ message: `Notification sent to ${users.length} users` });
});

// Get dashboard stats
router.get('/stats', (req, res) => {
  const totalEvents = db.prepare('SELECT COUNT(*) as count FROM events').get();
  const totalBookings = db.prepare('SELECT COUNT(*) as count FROM bookings').get();
  const totalRevenue = db.prepare('SELECT SUM(total_price) as total FROM bookings').get();
  const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = "user"').get();
  
  res.json({
    totalEvents: totalEvents.count,
    totalBookings: totalBookings.count,
    totalRevenue: totalRevenue.total || 0,
    totalUsers: totalUsers.count
  });
});

export default router;
