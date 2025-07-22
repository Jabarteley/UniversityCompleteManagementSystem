import express from 'express';
import { body, validationResult } from 'express-validator';
import Student from '../models/Student.js';
import { auth, authorize, AuthRequest } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Check admission status
router.get('/check/:regNumber', auth, authorize('student'), async (req, res) => {
  try {
    const { regNumber } = req.params;

    const student = await Student.findOne({ 
      registrationNumber: regNumber 
    }).select('registrationNumber academicInfo userId').populate('userId', 'profile');

    if (!student) {
      return res.status(404).json({ 
        success: false,
        message: 'No admission record found for this registration number' 
      });
    }

    res.json({
      success: true,
      admission: {
        registrationNumber: student.registrationNumber,
        status: student.academicInfo.status,
        faculty: student.academicInfo.faculty,
        department: student.academicInfo.department,
        program: student.academicInfo.program,
        level: student.academicInfo.level,
        yearOfAdmission: student.academicInfo.yearOfAdmission,
        studentName: `${student.userId?.profile?.firstName} ${student.userId?.profile?.lastName}`
      }
    });
  } catch (error) {
    logger.error('Check admission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update admission status (Staff Affairs)
router.put('/status/:id', auth, authorize('staff-affairs'), [
  body('status').isIn(['active', 'graduated', 'suspended', 'withdrawn', 'deferred']).withMessage('Valid status is required')
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { status, remarks } = req.body;

    const student = await Student.findByIdAndUpdate(
      id,
      { 
        'academicInfo.status': status,
        updatedAt: new Date()
      },
      { new: true }
    ).populate('userId', 'profile');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({
      success: true,
      message: 'Admission status updated successfully',
      student
    });
  } catch (error) {
    logger.error('Update admission status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get admission statistics
router.get('/stats', auth, authorize('staff-affairs'), async (req: AuthRequest, res) => {
  try {
    const currentYear = new Date().getFullYear();
    
    const stats = await Student.aggregate([
      {
        $group: {
          _id: '$academicInfo.status',
          count: { $sum: 1 }
        }
      }
    ]);

    const yearlyAdmissions = await Student.aggregate([
      {
        $group: {
          _id: '$academicInfo.yearOfAdmission',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      stats: {
        statusBreakdown: stats,
        yearlyAdmissions,
        totalStudents: await Student.countDocuments({ isActive: true })
      }
    });
  } catch (error) {
    logger.error('Get admission stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;