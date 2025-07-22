
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

// Create a new hostel
router.post('/', auth, authorize('admin', 'staff-affairs'), async (req, res) => {
  try {
    const { name, totalRooms } = req.body;
    if (!name || !totalRooms) {
      return res.status(400).json({ message: 'Name and totalRooms are required' });
    }
    const newHostel = new Hostel({
      name,
      totalRooms,
      availableRooms: totalRooms, // Initially, all rooms are available
    });
    await newHostel.save();
    res.status(201).json({ success: true, hostel: newHostel });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
