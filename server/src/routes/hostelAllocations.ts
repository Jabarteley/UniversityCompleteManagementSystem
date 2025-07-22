import express from 'express';
import { auth, authorize } from '../middleware/auth.js';
import HostelAllocation from '../models/HostelAllocation.js';

const router = express.Router();

// Get all hostel allocations
router.get('/', auth, authorize('admin', 'staff-affairs'), async (req, res) => {
  try {
    const allocations = await HostelAllocation.find()
      .populate({ path: 'student', populate: { path: 'userId', select: 'profile.firstName profile.lastName' } })
      .populate('hostel', 'name');
    res.json({ success: true, allocations });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Check in student to hostel
router.put('/:id/check-in', auth, authorize('admin', 'staff-affairs'), async (req, res) => {
  try {
    const updatedAllocation = await HostelAllocation.findByIdAndUpdate(
      req.params.id,
      { status: 'checked-in' },
      { new: true }
    );
    if (!updatedAllocation) {
      return res.status(404).json({ message: 'Hostel allocation not found' });
    }
    res.json({ success: true, allocation: updatedAllocation });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Check out student from hostel
router.put('/:id/check-out', auth, authorize('admin', 'staff-affairs'), async (req, res) => {
  try {
    const updatedAllocation = await HostelAllocation.findByIdAndUpdate(
      req.params.id,
      { status: 'checked-out' },
      { new: true }
    );
    if (!updatedAllocation) {
      return res.status(404).json({ message: 'Hostel allocation not found' });
    }
    res.json({ success: true, allocation: updatedAllocation });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
