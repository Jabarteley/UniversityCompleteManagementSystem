import express from 'express';
import { auth, authorize } from '../middleware/auth.js';
import Course from '../models/Course.js';

const router = express.Router();

// Get all courses
router.get('/', auth, authorize('admin', 'staff-registry', 'academic-staff', 'head-department', 'student'), async (req, res) => {
  try {
    const courses = await Course.find();
    res.json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new course
router.post('/', auth, authorize('admin', 'staff-registry', 'academic-staff', 'head-department'), async (req, res) => {
  try {
    const newCourse = await Course.create(req.body);
    res.status(201).json({ success: true, course: newCourse });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
