import express from 'express';
import Student from '../models/Student.js';
import Staff from '../models/Staff.js';
import Document from '../models/Document.js';
import Report from '../models/Report.js';
import User from '../models/User.js';
import { auth, AuthRequest } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Get dashboard statistics
router.get('/stats', auth, async (req: AuthRequest, res) => {
  try {
    logger.debug('Fetching dashboard stats for user:', req.user?.email);

    // Get basic counts
    const [totalStudents, totalStaff, totalFiles, totalReports, totalUsers, activeStudents, activeStaff] = await Promise.all([
      User.countDocuments({ role: 'student', isActive: { $ne: false } }),
      User.countDocuments({ role: 'staff', isActive: { $ne: false } }),
      Document.countDocuments({ isArchived: { $ne: true } }),
      Report.countDocuments(),
      User.countDocuments({ isActive: { $ne: false } }),
      Student.countDocuments({ 'academicInfo.status': 'active' }),
      Staff.countDocuments({ 'employmentInfo.currentStatus': 'active' })
    ]);

    // Get recent activities from various collections
    const recentActivities = [];

    // Recent student registrations
    const recentStudents = await Student.find({ isActive: { $ne: false } })
      .populate('userId', 'profile')
      .sort({ createdAt: -1 })
      .limit(2)
      .select('userId createdAt');

    recentStudents.forEach(student => {
      if (student.userId?.profile) {
        recentActivities.push({
          _id: student._id,
          type: 'student',
          action: 'registered',
          description: `New student ${student.userId.profile.firstName} ${student.userId.profile.lastName} registered`,
          timestamp: student.createdAt,
          user: `${student.userId.profile.firstName} ${student.userId.profile.lastName}`
        });
      }
    });

    // Recent staff additions
    const recentStaff = await Staff.find({ isActive: { $ne: false } })
      .populate('userId', 'profile')
      .sort({ createdAt: -1 })
      .limit(2)
      .select('userId createdAt');

    recentStaff.forEach(staff => {
      if (staff.userId?.profile) {
        recentActivities.push({
          _id: staff._id,
          type: 'staff',
          action: 'added',
          description: `New staff member ${staff.userId.profile.firstName} ${staff.userId.profile.lastName} added`,
          timestamp: staff.createdAt,
          user: `${staff.userId.profile.firstName} ${staff.userId.profile.lastName}`
        });
      }
    });

    // Recent file uploads
    const recentDocuments = await Document.find({ isArchived: { $ne: true } })
      .sort({ createdAt: -1 })
      .limit(2)
      .populate('uploadedBy', 'profile')
      .select('title originalName createdAt uploadedBy');

    recentDocuments.forEach(doc => {
      recentActivities.push({
        _id: doc._id,
        type: 'document',
        action: 'uploaded',
        description: `Document "${doc.title}" uploaded`,
        timestamp: doc.createdAt,
        user: doc.uploadedBy?.profile ? 
          `${doc.uploadedBy.profile.firstName} ${doc.uploadedBy.profile.lastName}` : 
          'Unknown User'
      });
    });

    // Recent reports
    const recentReports = await Report.find()
      .sort({ createdAt: -1 })
      .limit(2)
      .populate('generatedBy', 'profile')
      .select('title createdAt generatedBy');

    recentReports.forEach(report => {
      recentActivities.push({
        _id: report._id,
        type: 'report',
        action: 'generated',
        description: `Report "${report.title}" generated`,
        timestamp: report.createdAt,
        user: report.generatedBy?.profile ? 
          `${report.generatedBy.profile.firstName} ${report.generatedBy.profile.lastName}` : 
          'Unknown User'
      });
    });

    // Sort activities by timestamp
    recentActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Get faculty statistics
    const facultyStats = await Student.aggregate([
      { $match: { isActive: { $ne: false } } },
      {
        $group: {
          _id: '$academicInfo.faculty',
          students: { $sum: 1 }
        }
      },
      { $sort: { students: -1 } }
    ]);

    // Get staff counts by faculty
    const staffByFaculty = await Staff.aggregate([
      { $match: { isActive: { $ne: false } } },
      {
        $group: {
          _id: '$employmentInfo.faculty',
          staff: { $sum: 1 }
        }
      }
    ]);

    // Combine faculty stats
    const combinedFacultyStats = facultyStats.map(faculty => {
      const staffCount = staffByFaculty.find(s => s._id === faculty._id)?.staff || 0;
      return {
        name: faculty._id || 'Unknown',
        students: faculty.students,
        staff: staffCount
      };
    });

    // Get student status distribution
    const studentStatusStats = await Student.aggregate([
      { $match: { isActive: { $ne: false } } },
      {
        $group: {
          _id: '$academicInfo.status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get staff type distribution
    const staffTypeStats = await Staff.aggregate([
      { $match: { isActive: { $ne: false } } },
      {
        $group: {
          _id: '$employmentInfo.employmentType',
          count: { $sum: 1 }
        }
      }
    ]);

    // Calculate additional metrics
    const currentYear = new Date().getFullYear();
    const studentsThisYear = await Student.countDocuments({
      'academicInfo.yearOfAdmission': currentYear,
      isActive: { $ne: false }
    });

    const graduatedThisYear = await Student.countDocuments({
      'academicInfo.status': 'graduated',
      updatedAt: { $gte: new Date(currentYear, 0, 1) }
    });

    const recentUploads = await Document.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      isArchived: { $ne: true }
    });

    const pendingReports = await Report.countDocuments({ status: 'generating' });

    const stats = {
      totalStudents,
      totalStaff,
      totalFiles,
      totalReports,
      totalUsers,
      activeStudents,
      activeStaff,
      studentsThisYear,
      graduatedThisYear,
      recentUploads,
      pendingReports
    };

    logger.debug('Dashboard stats calculated:', stats);

    res.json({
      success: true,
      stats,
      recentActivities: recentActivities.slice(0, 10), // Limit to 10 most recent
      facultyStats: combinedFacultyStats,
      studentStatusStats,
      staffTypeStats
    });
  } catch (error) {
    logger.error('Dashboard stats error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

// Get student-specific dashboard statistics
router.get('/student-stats', auth, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'student') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const student = await Student.findOne({ userId: req.user._id });

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    // Calculate student-specific stats
    const totalCourses = student.results.reduce((sum, result) => sum + result.courses.length, 0);
    const latestCGPA = student.results.length > 0 ? student.results[student.results.length - 1].cgpa : 0;
    const totalDocuments = await Document.countDocuments({ uploadedBy: req.user._id });

    res.json({
      success: true,
      stats: {
        currentCGPA: latestCGPA,
        completedCourses: totalCourses,
        currentSemester: student.academicInfo.currentSemester,
        totalDocuments: totalDocuments,
        academicStatus: student.academicInfo.status,
        currentLevel: student.academicInfo.level,
      }
    });
  } catch (error) {
    logger.error('Student dashboard stats error:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

// Get staff-specific dashboard statistics
router.get('/staff-stats', auth, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'staff') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const staff = await Staff.findOne({ userId: req.user._id });

    if (!staff) {
      return res.status(404).json({ message: 'Staff profile not found' });
    }

    // Calculate staff-specific stats
    const totalStudentsSupervised = staff.teachingLoad?.researchSupervision?.length || 0;
    const totalCoursesTaught = staff.teachingLoad?.courses?.length || 0;
    const totalDocuments = await Document.countDocuments({ uploadedBy: req.user._id });

    res.json({
      success: true,
      stats: {
        totalStudentsSupervised,
        totalCoursesTaught,
        totalDocuments,
        employmentType: staff.employmentInfo.employmentType,
        currentStatus: staff.employmentInfo.currentStatus,
      },
      myClasses: staff.teachingLoad?.courses || [],
    });
  } catch (error) {
    logger.error('Staff dashboard stats error:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

export default router;