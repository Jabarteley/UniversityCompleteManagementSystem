
import express from 'express';
import { auth, authorize } from '../middleware/auth.js';
import Hostel from '../models/Hostel.js';

const router = express.Router();

// Get all hostels
router.get('/', auth, authorize('admin', 'staff-affairs'), async (req, res) => {
  try {
    const hostels = await Hostel.find();
    res.json({ success: true, hostels });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
