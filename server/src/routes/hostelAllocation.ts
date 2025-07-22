
import express from 'express';
import { auth, authorize } from '../middleware/auth.js';
import HostelAllocation from '../models/HostelAllocation.js';

const router = express.Router();

// Get all hostel allocations
router.get('/', auth, authorize('admin', 'staff-affairs'), async (req, res) => {
  try {
    const allocations = await HostelAllocation.find()
      .populate({
        path: 'student',
        populate: {
          path: 'userId',
          model: 'User',
          select: 'profile.firstName profile.lastName registrationNumber' // Select only necessary fields
        }
      })
      .populate('hostel');
    res.json({ success: true, allocations });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create hostel allocation
router.post('/', auth, authorize('admin', 'staff-affairs'), async (req, res) => {
  try {
    const { studentId, hostelId, roomNumber } = req.body;

    const newAllocation = await HostelAllocation.create({
      student: studentId,
      hostel: hostelId,
      roomNumber,
    });
    res.status(201).json({ success: true, allocation: newAllocation });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update hostel allocation
router.put('/:id', auth, authorize('admin', 'staff-affairs'), async (req, res) => {
  try {
    const updatedAllocation = await HostelAllocation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedAllocation) {
      return res.status(404).json({ message: 'Allocation not found' });
    }
    res.json({ success: true, allocation: updatedAllocation });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete hostel allocation
router.delete('/:id', auth, authorize('admin', 'staff-affairs'), async (req, res) => {
  try {
    const deletedAllocation = await HostelAllocation.findByIdAndDelete(req.params.id);
    if (!deletedAllocation) {
      return res.status(404).json({ message: 'Allocation not found' });
    }
    res.json({ success: true, message: 'Allocation deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
