import express from 'express';
import db from '../database.js';
import { authenticateToken, checkMaintenanceMode } from '../middleware/auth.js';

const router = express.Router();

// Create booking
router.post('/', authenticateToken, checkMaintenanceMode, (req, res) => {
  const { event_id, tickets } = req.body;
  
  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(event_id);
  
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }
  
  if (event.booked + tickets > event.capacity) {
    return res.status(400).json({ error: 'Not enough tickets available' });
  }
  
  const total_price = event.price * tickets;
  
  const result = db.prepare(`
    INSERT INTO bookings (user_id, event_id, tickets, total_price, payment_status)
    VALUES (?, ?, ?, ?, 'completed')
  `).run(req.user.id, event_id, tickets, total_price);
  
  db.prepare('UPDATE events SET booked = booked + ? WHERE id = ?').run(tickets, event_id);
  
  // Create notification
  db.prepare(`
    INSERT INTO notifications (user_id, message, type)
    VALUES (?, ?, 'success')
  `).run(req.user.id, `Successfully booked ${tickets} ticket(s) for ${event.title}`);
  
  res.json({ 
    id: result.lastInsertRowid,
    message: 'Booking successful',
    booking: {
      id: result.lastInsertRowid,
      event_id,
      tickets,
      total_price
    }
  });
});

// Get user bookings
router.get('/my-bookings', authenticateToken, checkMaintenanceMode, (req, res) => {
  const bookings = db.prepare(`
    SELECT b.*, e.title, e.date, e.time, e.image_url
    FROM bookings b
    JOIN events e ON b.event_id = e.id
    WHERE b.user_id = ?
    ORDER BY b.booking_date DESC
  `).all(req.user.id);
  
  res.json(bookings);
});

export default router;
