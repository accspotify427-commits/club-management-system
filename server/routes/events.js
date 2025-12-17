import express from 'express';
import db from '../database.js';
import { authenticateToken, checkMaintenanceMode } from '../middleware/auth.js';

const router = express.Router();

// Get all events
router.get('/', authenticateToken, checkMaintenanceMode, (req, res) => {
  const events = db.prepare(`
    SELECT e.*, u.name as created_by_name 
    FROM events e 
    LEFT JOIN users u ON e.created_by = u.id 
    ORDER BY e.date ASC, e.time ASC
  `).all();
  
  res.json(events);
});

// Get single event
router.get('/:id', authenticateToken, checkMaintenanceMode, (req, res) => {
  const event = db.prepare(`
    SELECT e.*, u.name as created_by_name 
    FROM events e 
    LEFT JOIN users u ON e.created_by = u.id 
    WHERE e.id = ?
  `).get(req.params.id);
  
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }
  
  res.json(event);
});

export default router;
