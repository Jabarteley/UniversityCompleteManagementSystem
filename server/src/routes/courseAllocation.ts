
import express from 'express';
import { auth, authorize } from '../middleware/auth.js';
import CourseAllocation from '../models/CourseAllocation.js';

const router = express.Router();

// Get all course allocations
router.get('/', auth, authorize('admin', 'academic-staff', 'head-department'), async (req, res) => {
  try {
    const allocations = await CourseAllocation.find().populate('assignedLecturer').populate('enrolledStudents');
    res.json({ success: true, allocations });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

import Course from '../models/Course.js';


// Create course allocation
router.post('/', auth, authorize('admin', 'head-department'), async (req, res) => {
  try {
    const {
      courseCode,
      courseName,
      creditHours,
      semester,
      academicYear,
      department,
      faculty,
      level,
      assignedLecturer,
      maxStudents,
    } = req.body;

    // Create or update the course
    await Course.findOneAndUpdate(
      { code: courseCode },
      {
        code: courseCode,
        title: courseName,
        creditUnits: creditHours,
        semester: semester.toLowerCase(), // Ensure semester is lowercase
        level: parseInt(level, 10), // Ensure level is a number
        department,
        faculty,
        isCompulsory: true, // Assuming allocated courses are compulsory
      },
      { upsert: true, new: true, runValidators: true }
    );

    const newAllocation = await CourseAllocation.create({
      courseCode,
      courseName,
      creditHours,
      semester,
      academicYear,
      department,
      faculty,
      level,
      assignedLecturer,
      maxStudents,
    });
    res.status(201).json({ success: true, allocation: newAllocation });
  } catch (error) {
    console.error('Error creating course allocation:', error);
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
