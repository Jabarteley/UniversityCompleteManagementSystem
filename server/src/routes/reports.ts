import express from 'express';
import { body, validationResult } from 'express-validator';
import Report from '../models/Report.js';
import Student from '../models/Student.js';
import Staff from '../models/Staff.js';
import { auth, authorize, AuthRequest } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { convertJsonToCsv } from '../utils/csvConverter.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const baseUploadsDir = path.join(__dirname, '..', '..', 'uploads');

// Get all reports
router.get('/', auth, authorize('admin', 'staff', 'staff-registry', 'staff-affairs'), async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const type = req.query.type as string;
    const status = req.query.status as string;
    const search = req.query.search as string;

    logger.debug('Fetching reports with params:', { page, limit, type, status, search });

    const query: any = {};
    if (type) query.type = type;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const reports = await Report.find(query)
      .populate('generatedBy', 'profile')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const reportsWithFileUrl = reports.map(report => ({
      ...report.toObject(),
      fileUrl: report.filePath ? `/api/reports/${report._id}/download` : undefined,
    }));

    const total = await Report.countDocuments(query);

    logger.debug(`Found ${reports.length} reports out of ${total} total`);

    res.json({
      success: true,
      reports: reportsWithFileUrl,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    logger.error('Get reports error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

// Generate student academic report
router.post('/student-academic', auth, authorize('admin', 'staff', 'staff-registry', 'staff-affairs'), [
  body('title').notEmpty().withMessage('Report title is required'),
  body('parameters.dateRange.startDate').isISO8601().withMessage('Valid start date is required'),
  body('parameters.dateRange.endDate').isISO8601().withMessage('Valid end date is required')
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Generate actual report data
    const { parameters } = req.body;
    const query: any = { isActive: { $ne: false } };
    
    if (parameters.faculty) query['academicInfo.faculty'] = parameters.faculty;
    if (parameters.department) query['academicInfo.department'] = parameters.department;
    if (parameters.level) query['academicInfo.level'] = parameters.level;

    const students = await Student.find(query);
    
    // Calculate report data
    const reportData = {
      totalStudents: students.length,
      averageGPA: students.reduce((sum, s) => {
        const latestResult = s.results && s.results.length > 0 ? s.results[s.results.length - 1] : null;
        return sum + (latestResult?.cgpa || 0);
      }, 0) / (students.length || 1),
      facultyBreakdown: await Student.aggregate([
        { $match: query },
        { $group: { _id: '$academicInfo.faculty', count: { $sum: 1 } } }
      ]),
      statusBreakdown: await Student.aggregate([
        { $match: query },
        { $group: { _id: '$academicInfo.status', count: { $sum: 1 } } }
      ])
    };

    const report = await Report.create({
      ...req.body,
      type: 'student-academic',
      generatedBy: req.user?._id,
      data: reportData,
      status: 'completed',
      format: 'csv',
    });

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const baseUploadsDir = path.join(__dirname, '../../uploads');
    const reportSubDir = path.join(baseUploadsDir, 'reports');
    if (!fs.existsSync(reportSubDir)) {
      fs.mkdirSync(reportSubDir, { recursive: true });
    }
    const csvData = convertJsonToCsv(students); // Convert students data to CSV
    const fileName = `${report._id}.csv`;
    const absoluteFilePath = path.join(reportSubDir, fileName);
    fs.writeFileSync(absoluteFilePath, csvData);
    report.filePath = path.join('reports', fileName);
    await report.save();

    await report.populate('generatedBy', 'profile');

    logger.success('Student academic report generated:', report.title);

    res.status(201).json({
      success: true,
      report
    });
  } catch (error) {
    logger.error('Generate student academic report error:', error);
    res.status(500).json({ 
      message: 'Failed to generate report',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

// Generate staff administrative report
router.post('/staff-administrative', auth, authorize('admin', 'staff-affairs', 'staff-registry'), [
  body('title').notEmpty().withMessage('Report title is required'),
  body('parameters.dateRange.startDate').isISO8601().withMessage('Valid start date is required'),
  body('parameters.dateRange.endDate').isISO8601().withMessage('Valid end date is required')
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { parameters } = req.body;
    const query: any = { isActive: { $ne: false } };
    
    if (parameters.department) query.department = parameters.department;
    if (parameters.position) query.position = parameters.position;

    const staff = await Staff.find(query);
    
    const reportData = {
      totalStaff: staff.length,
      departmentBreakdown: await Staff.aggregate([
        { $match: query },
        { $group: { _id: '$department', count: { $sum: 1 } } }
      ]),
      positionBreakdown: await Staff.aggregate([
        { $match: query },
        { $group: { _id: '$position', count: { $sum: 1 } } }
      ])
    };

    const report = await Report.create({
      ...req.body,
      type: 'staff-administrative',
      generatedBy: req.user?._id,
      data: reportData,
      status: 'completed',
      format: 'csv',
    });

    const reportSubDir = path.join(baseUploadsDir, 'reports');
    if (!fs.existsSync(reportSubDir)) {
      fs.mkdirSync(reportSubDir, { recursive: true });
    }

    const csvData = convertJsonToCsv(staff); // Convert staff data to CSV
    const fileName = `${report._id}.csv`;
    const absoluteFilePath = path.join(reportSubDir, fileName);
    fs.writeFileSync(absoluteFilePath, csvData);
    
    report.filePath = path.join('reports', fileName);
    await report.save();

    res.json({
      success: true,
      message: 'Staff administrative report generated successfully',
      report: {
        ...report.toObject(),
        fileUrl: `/api/reports/${report._id}/download`
      }
    });
  } catch (error) {
    logger.error('Generate staff administrative report error:', error);
    res.status(500).json({ 
      message: 'Failed to generate report',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

// Download report file
router.get('/:id/download', auth, authorize('admin', 'staff', 'staff-registry', 'staff-affairs'), async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report || !report.filePath) {
      return res.status(404).json({ message: 'Report not found or no file available' });
    }

    const absolutePath = path.join(baseUploadsDir, report.filePath);
    logger.debug(`Attempting to download file from: ${absolutePath}`);
    if (!fs.existsSync(absolutePath)) {
      logger.error(`File not found at: ${absolutePath}`);
      return res.status(404).json({ message: 'Report file not found on server.' });
    }

    res.download(absolutePath);
  } catch (error) {
    logger.error('Download report error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

export default router;