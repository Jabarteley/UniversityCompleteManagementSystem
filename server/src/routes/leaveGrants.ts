
import express from 'express';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get leave grants
router.get('/', auth, authorize('admin', 'staff-registry'), async (req, res) => {
  try {
    // Add your logic to fetch leave grants here
    res.json({ success: true, leaveGrants: [] });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
