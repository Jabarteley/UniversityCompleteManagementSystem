
import express from 'express';
import { auth, authorize } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Get student profile
router.get('/:id', auth, authorize('admin', 'student'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user || user.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json({ success: true, profile: user.profile });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create/Update student profile
router.put('/:id', auth, authorize('admin', 'student'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    user.profile = { ...user.profile, ...req.body };
    await user.save();

    res.json({ success: true, profile: user.profile });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
