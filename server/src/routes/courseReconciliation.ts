
import express from 'express';
import { auth, authorize } from '../middleware/auth.js';
import Student from '../models/Student.js';
import CourseReconciliationReport from '../models/CourseReconciliationReport.js';

const router = express.Router();

// Reconcile courses
router.post('/reconcile', auth, authorize('admin', 'head-department'), async (req, res) => {
  try {
    const report = new CourseReconciliationReport({
      runBy: req.user.id,
    });
    await report.save();

    // Run reconciliation in the background
    reconcileCourses(report._id);

    res.status(202).json({ success: true, message: 'Course reconciliation process started.', reportId: report._id });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get reconciliation report
router.get('/report/:id', auth, authorize('admin', 'head-department'), async (req, res) => {
  try {
    const report = await CourseReconciliationReport.findById(req.params.id).populate('runBy', 'username').populate('discrepancies.student', 'studentId profile').populate('discrepancies.course', 'courseCode title');
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

async function reconcileCourses(reportId: string) {
  try {
    const students = await Student.find().populate('registeredCourses');
    const discrepancies = [];

    for (const student of students) {
      if (student.academicInfo && student.registeredCourses) {
        for (const course of student.registeredCourses) {
          if (course.level !== student.academicInfo.level) {
            discrepancies.push({
              student: student._id,
              course: course._id,
              reason: `Wrong level: Course is level ${course.level}, student is level ${student.academicInfo.level}`,
            });
          }
          if (course.department !== student.academicInfo.department) {
            discrepancies.push({
              student: student._id,
              course: course._id,
              reason: `Wrong department: Course is for ${course.department}, student is in ${student.academicInfo.department}`,
            });
          }
        }
      }
    }

    await CourseReconciliationReport.findByIdAndUpdate(reportId, {
      discrepancies,
      status: 'completed',
    });
  } catch (error) {
    console.error('Error during course reconciliation:', error);
    await CourseReconciliationReport.findByIdAndUpdate(reportId, {
      status: 'failed',
    });
  }
}

export default router;
