import express from 'express';
import { auth, authorize } from '../middleware/auth.js';
import Student from '../models/Student.js';

const router = express.Router();

// Download statement of result
router.get('/download/:userId', auth, authorize('student', 'admin', 'staff-registry'), async (req, res) => {
  try {
    const { userId } = req.params;

    const student = await Student.findOne({ userId }).populate('userId');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // For now, just return the student's results and academic info
    // In a real application, this would generate a PDF or a more formatted document
    res.json({
      success: true,
      message: 'Statement of result generated successfully',
      studentName: `${student.userId?.profile?.firstName} ${student.userId?.profile?.lastName}`,
      registrationNumber: student.registrationNumber,
      academicInfo: student.academicInfo,
      results: student.results,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;