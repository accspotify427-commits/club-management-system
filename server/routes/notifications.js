import express from 'express';
import db from '../database.js';
import { authenticateToken, checkMaintenanceMode } from '../middleware/auth.js';

const router = express.Router();

// Get user notifications
router.get('/', authenticateToken, checkMaintenanceMode, (req, res) => {
  const notifications = db.prepare(`
    SELECT * FROM notifications 
    WHERE user_id = ? 
    ORDER BY created_at DESC 
    LIMIT 50
  `).all(req.user.id);
  
  res.json(notifications);
});

// Mark notification as read
router.put('/:id/read', authenticateToken, (req, res) => {
  db.prepare('UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?')
    .run(req.params.id, req.user.id);
  
  res.json({ message: 'Notification marked as read' });
});

// Mark all as read
router.put('/read-all', authenticateToken, (req, res) => {
  db.prepare('UPDATE notifications SET read = 1 WHERE user_id = ?')
    .run(req.user.id);
  
  res.json({ message: 'All notifications marked as read' });
});

export default router;
