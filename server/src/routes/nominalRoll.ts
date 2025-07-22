
import express from 'express';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get nominal roll
router.get('/', auth, authorize('admin', 'staff-registry'), async (req, res) => {
  try {
    // Add your logic to fetch the nominal roll here
    res.json({ success: true, nominalRoll: [] });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
