import express from 'express';
import { body, validationResult } from 'express-validator';
import Student from '../models/Student.js';
import CourseAllocation from '../models/CourseAllocation.js';
import { auth, authorize, AuthRequest } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Upload results (Academic Staff and Staff Affairs)
router.post(
  '/upload',
  auth,
  authorize('academic-staff', 'staff-affairs', 'head-department'),
  [
    body('studentId').notEmpty().withMessage('Student ID is required'),
    body('courseCode').notEmpty().withMessage('Course code is required'),
    body('semester').notEmpty().withMessage('Semester is required'),
    body('year').isInt().withMessage('Year is required'),
    body('grade').notEmpty().withMessage('Grade is required'),
    body('gradePoint').isFloat({ min: 0, max: 5 }).withMessage('Grade point must be between 0 and 5'),
  ],
  async (req: AuthRequest, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { studentId, courseCode, courseName, creditUnits, grade, gradePoint, semester, year } = req.body;

      const student = await Student.findById(studentId);
      if (!student) return res.status(404).json({ message: 'Student not found' });

      let semesterResult = student.results.find(r => r.semester === semester && r.year === year);

      if (!semesterResult) {
        semesterResult = { semester, year, courses: [], gpa: 0, cgpa: 0 };
        student.results.push(semesterResult);
      }

      const existingCourseIndex = semesterResult.courses.findIndex(c => c.courseCode === courseCode);
      const courseResult = { courseCode, courseName, creditUnits, grade, gradePoint };

      if (existingCourseIndex >= 0) {
        semesterResult.courses[existingCourseIndex] = courseResult;
      } else {
        semesterResult.courses.push(courseResult);
      }

      const totalPoints = semesterResult.courses.reduce((sum, course) => sum + (course.gradePoint * course.creditUnits), 0);
      const totalUnits = semesterResult.courses.reduce((sum, course) => sum + course.creditUnits, 0);
      semesterResult.gpa = totalUnits > 0 ? totalPoints / totalUnits : 0;

      const allCourses = student.results.flatMap(r => r.courses);
      const totalCGPAPoints = allCourses.reduce((sum, course) => sum + (course.gradePoint * course.creditUnits), 0);
      const totalCGPAUnits = allCourses.reduce((sum, course) => sum + course.creditUnits, 0);
      const cgpa = totalCGPAUnits > 0 ? totalCGPAPoints / totalCGPAUnits : 0;

      student.results.forEach(result => {
        result.cgpa = cgpa;
      });

      await student.save();

      res.json({ success: true, message: 'Result uploaded successfully', student });
    } catch (error) {
      logger.error('Upload result error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Get student results by registration number
router.get('/student/:regNumber', auth, authorize('student'), async (req, res) => {
  try {
    const { regNumber } = req.params;
    console.log('Backend: Received regNumber for student results:', regNumber);

    const student = await Student.findOne({
      registrationNumber: new RegExp(`^${regNumber.trim()}$`, 'i'),
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({ success: true, student });
  } catch (error) {
    logger.error('Error fetching student result:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
