
import express from 'express';
import { auth, authorize } from '../middleware/auth.js';
import CourseAllocation from '../models/CourseAllocation.js';

const router = express.Router();

// Get all course allocations
router.get('/', auth, authorize('admin', 'academic-staff', 'head-department'), async (req, res) => {
  try {
    const allocations = await CourseAllocation.find().populate('assignedLecturer');
    res.json({ success: true, allocations });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create course allocation
router.post('/', auth, authorize('admin', 'head-department'), async (req, res) => {
  try {
    const newAllocation = await CourseAllocation.create(req.body);
    res.status(201).json({ success: true, allocation: newAllocation });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update course allocation
router.put('/:id', auth, authorize('admin', 'head-department'), async (req, res) => {
  try {
    const updatedAllocation = await CourseAllocation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedAllocation) {
      return res.status(404).json({ message: 'Allocation not found' });
    }
    res.json({ success: true, allocation: updatedAllocation });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete course allocation
router.delete('/:id', auth, authorize('admin', 'head-department'), async (req, res) => {
  try {
    const deletedAllocation = await CourseAllocation.findByIdAndDelete(req.params.id);
    if (!deletedAllocation) {
      return res.status(404).json({ message: 'Allocation not found' });
    }
    res.json({ success: true, message: 'Allocation deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
