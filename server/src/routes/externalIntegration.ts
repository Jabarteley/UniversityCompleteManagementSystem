import express from 'express';
import Student from '../models/Student.js';
import { auth, authorize, AuthRequest } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Upload to JAMB
router.post('/jamb/upload', auth, authorize('staff-affairs'), async (req: AuthRequest, res) => {
  try {
    const { studentIds, examYear } = req.body;

    const students = await Student.find({
      _id: { $in: studentIds },
      isActive: true
    }).populate('userId', 'profile.firstName profile.lastName profile.middleName profile.dateOfBirth profile.gender');

    // Format data for JAMB
    const jambData = students.map(student => ({
      registrationNumber: student.registrationNumber,
      surname: student.userId?.profile?.lastName,
      firstName: student.userId?.profile?.firstName,
      middleName: student.userId?.profile?.middleName || '',
      dateOfBirth: student.userId?.profile?.dateOfBirth,
      gender: student.userId?.profile?.gender,
      faculty: student.academicInfo.faculty,
      department: student.academicInfo.department,
      program: student.academicInfo.program,
      yearOfAdmission: student.academicInfo.yearOfAdmission,
      currentLevel: student.academicInfo.level
    }));

    // In a real implementation, this would integrate with JAMB API
    logger.info(`JAMB upload initiated for ${students.length} students`);

    res.json({
      success: true,
      message: `Successfully prepared ${students.length} student records for JAMB upload`,
      data: jambData
    });
  } catch (error) {
    logger.error('JAMB upload error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload to NYSC
router.post('/nysc/upload', auth, authorize('staff-affairs'), async (req: AuthRequest, res) => {
  try {
    const { studentIds } = req.body;

    const students = await Student.find({
      _id: { $in: studentIds },
      'academicInfo.status': 'graduated',
      isActive: true
    }).populate('userId', 'profile.firstName profile.lastName profile.middleName profile.dateOfBirth profile.gender');

    // Format data for NYSC
    const nyscData = students.map(student => ({
      registrationNumber: student.registrationNumber,
      surname: student.userId?.profile?.lastName,
      firstName: student.userId?.profile?.firstName,
      middleName: student.userId?.profile?.middleName || '',
      dateOfBirth: student.userId?.profile?.dateOfBirth,
      gender: student.userId?.profile?.gender,
      institution: 'University Name',
      faculty: student.academicInfo.faculty,
      department: student.academicInfo.department,
      degreeClass: this.calculateDegreeClass(student.results),
      graduationYear: new Date().getFullYear()
    }));

    logger.info(`NYSC upload initiated for ${students.length} graduates`);

    res.json({
      success: true,
      message: `Successfully prepared ${students.length} graduate records for NYSC upload`,
      data: nyscData
    });
  } catch (error) {
    logger.error('NYSC upload error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get external upload history
router.get('/history', auth, authorize('staff-affairs'), async (req: AuthRequest, res) => {
  try {
    // In a real implementation, this would fetch from an upload history collection
    const history: any[] = []; // Empty array instead of demo data

    res.json({
      success: true,
      history
    });
  } catch (error) {
    logger.error('Get upload history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;