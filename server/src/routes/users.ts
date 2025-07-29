import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { auth, authorize } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';
import Staff from '../models/Staff.js';
import Student from '../models/Student.js';

const router = express.Router();

// Get all users
router.get('/', auth, authorize('admin', 'system-admin', 'staff-registry', 'head-department'), async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;

    logger.debug('Fetching users with params:', { page, limit, search });

    const query: any = { isActive: { $ne: false } };
    if (search) {
      query.$or = [
        { 'profile.firstName': { $regex: search, $options: 'i' } },
        { 'profile.lastName': { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    logger.debug(`Found ${users.length} users out of ${total} total`);

    res.json({
      success: true,
      users,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    logger.error('Get users error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

// Create user
router.post('/', auth, authorize('admin', 'system-admin', 'staff-registry', 'head-department'), [
  body('username').optional().trim(),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['student', 'staff-registry', 'staff-affairs', 'academic-staff', 'head-of-department', 'admin', 'system-admin']).withMessage('Valid role is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const existingUser = await User.findOne({ 
      $or: [{ email: req.body.email }, { username: req.body.username }] 
    });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const { department, ...userData } = req.body;
    const user = await User.create(userData);

    if (user.role === 'academic-staff') {
      const newStaff = new Staff({
        userId: user._id,
        employmentInfo: {
          department: department,
        },
      });
      await newStaff.save();
      user.recordRef = newStaff._id;
      user.recordType = 'Staff';
      await user.save();
    } else if (user.role === 'student') {
      const registrationNumber = `REG-${Date.now()}`;
      // Check if a student record already exists for this userId
      let studentRecord = await Student.findOne({ userId: user._id });

      if (studentRecord) {
        // If student record exists, update it
        studentRecord.registrationNumber = registrationNumber;
        studentRecord.academicInfo = req.body.academicInfo || {};
        await studentRecord.save();
      } else {
        // If no student record exists, create a new one
        studentRecord = new Student({
          userId: user._id,
          registrationNumber,
          academicInfo: req.body.academicInfo || {},
          email: undefined, // Workaround for unexpected email index in students collection
        });
        await studentRecord.save();
      }
      user.recordRef = studentRecord._id;
      user.recordType = 'Student';
      await user.save();
    }

    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profile: user.profile,
        permissions: user.permissions,
        registrationNumber: (user.recordType === 'Student' && user.recordRef) ? (await Student.findById(user.recordRef))?.registrationNumber : undefined
      }
    });
  } catch (error) {
    logger.error('Create user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user
router.put('/:id', auth, authorize('admin', 'system-admin', 'head-department', 'staff-registry'), async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
      id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    logger.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user
router.delete('/:id', auth, authorize('admin', 'system-admin', 'head-department'), async (req, res) => {
  try {
    const { id } = req.params;

    // Soft delete - set isActive to false
    const user = await User.findByIdAndUpdate(
      id,
      { isActive: false, updatedAt: new Date() },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    logger.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;