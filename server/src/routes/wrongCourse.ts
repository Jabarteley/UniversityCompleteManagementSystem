import express from 'express';
import { auth, authorize } from '../middleware/auth.js';
import Student from '../models/Student.js';
import Course from '../models/Course.js';

const router = express.Router();

// Check wrong course
router.get('/:studentId', auth, authorize('student', 'admin', 'staff-registry', 'academic-staff', 'head-department'), async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const studentDepartment = student.academicInfo?.department;
    const studentFaculty = student.academicInfo?.faculty;

    if (!studentDepartment || !studentFaculty) {
      return res.status(400).json({ message: 'Student academic information (department/faculty) is incomplete.' });
    }

    const allCourses = await Course.find();

    const wrongCourses = allCourses.filter(course => {
      // A course is 'wrong' if its department or faculty does not match the student's
      return course.department !== studentDepartment || course.faculty !== studentFaculty;
    });

    res.json({ success: true, wrongCourses });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;