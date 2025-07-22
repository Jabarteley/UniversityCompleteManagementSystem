
import express from 'express';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Check admission status
router.get('/', auth, authorize('admin', 'staff-affairs', 'student'), async (req, res) => {
  try {
    // Add your logic to check admission status here
    res.json({ success: true, status: 'Admission status checked' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
