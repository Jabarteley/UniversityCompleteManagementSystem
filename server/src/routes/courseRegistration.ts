import express from 'express';
import { auth, authorize } from '../middleware/auth.js';
import Student from '../models/Student.js';
import Course from '../models/Course.js';

const router = express.Router();

// Get registered courses for a student
router.get('/registered/:userId', auth, authorize('student', 'admin', 'staff-registry'), async (req, res) => {
  try {
    const { userId } = req.params;

    const student = await Student.findOne({ userId }).populate('registeredCourses');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({ success: true, registeredCourses: student.registeredCourses || [] });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Register courses
router.post('/register', auth, authorize('student'), async (req, res) => {
  try {
    const { studentId, courseIds } = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const courses = await Course.find({ '_id': { $in: courseIds } });
    if (courses.length !== courseIds.length) {
      return res.status(400).json({ message: 'One or more courses not found' });
    }

    // Add selected courses to the student's registeredCourses array
    student.registeredCourses = courses.map(course => course._id);
    await student.save();

    res.json({ success: true, message: 'Courses registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Unregister a course
router.delete('/unregister/:studentId/:courseId', auth, authorize('student'), async (req, res) => {
  try {
    const { studentId, courseId } = req.params;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    student.registeredCourses = student.registeredCourses?.filter(
      (id) => id.toString() !== courseId
    );
    await student.save();

    res.json({ success: true, message: 'Course unregistered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;