import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { auth, AuthRequest } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Generate JWT Token
const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback-secret', {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// Set default permissions based on role
const getDefaultPermissions = (role: string) => {
  switch (role) {
    case 'admin':
      return {
        canManageUsers: true,
        canManageStudents: true,
        canManageStaff: true,
        canGenerateReports: true,
        canManageFiles: true,
        canViewReports: true,
        canApproveLeave: true,
        canPromoteStaff: true
      };
    case 'staff-registry':
      return {
        canManageUsers: false,
        canManageStudents: true,
        canManageStaff: true,
        canGenerateReports: true,
        canManageFiles: true,
        canViewReports: true,
        canApproveLeave: true,
        canPromoteStaff: true
      };
    case 'staff-affairs':
      return {
        canManageUsers: false,
        canManageStudents: true,
        canManageStaff: false,
        canGenerateReports: true,
        canManageFiles: true,
        canViewReports: true,
        canApproveLeave: false,
        canPromoteStaff: false
      };
    case 'academic-staff':
      return {
        canManageUsers: false,
        canManageStudents: false,
        canManageStaff: false,
        canGenerateReports: false,
        canManageFiles: true,
        canViewReports: false,
        canApproveLeave: false,
        canPromoteStaff: false
      };
    case 'head-department':
      return {
        canManageUsers: false,
        canManageStudents: false,
        canManageStaff: true,
        canGenerateReports: true,
        canManageFiles: true,
        canViewReports: true,
        canApproveLeave: false,
        canPromoteStaff: false
      };
    case 'student':
    default:
      return {
        canManageUsers: false,
        canManageStudents: false,
        canManageStaff: false,
        canGenerateReports: false,
        canManageFiles: false,
        canViewReports: false,
        canApproveLeave: false,
        canPromoteStaff: false
      };
  }
};

router.post('/register', [
  body('username').notEmpty().withMessage('Username is required').trim(),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['student', 'staff', 'admin', 'system-admin']).withMessage('Valid role is required'),
  body('role').isIn(['student', 'staff-registry', 'staff-affairs', 'academic-staff', 'head-department', 'admin']).withMessage('Valid role is required'),
  body('profile.firstName').notEmpty().withMessage('First name is required'),
  body('profile.lastName').notEmpty().withMessage('Last name is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, role, profile } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email or username already exists' });
    }

    const user = await User.create({
      username,
      email,
      password,
      role,
      profile,
      permissions: getDefaultPermissions(role) // Set default permissions based on role
    });

    const token = generateToken(user._id.toString());

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profile: user.profile,
        permissions: user.permissions
      }
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

// Login user
router.post('/login', [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    logger.debug('Login attempt for:', email);

    // Check if MongoDB is connected
    if (!process.env.MONGODB_URI) {
      logger.error('No MongoDB URI configured');
      return res.status(500).json({ message: 'Database not configured' });
    }

    // Find user with password field included
    const user = await User.findOne({ 
      $or: [
        { email: email.toLowerCase() },
        { email: email }
      ]
    }).select('+password').populate('recordRef');
    
    if (!user) {
      logger.debug('User not found:', email);
      
      // Try to find user with any email case variations
      const userAnyCase = await User.findOne({
        email: { $regex: new RegExp(`^${email}$`, 'i') }
      }).select('+password');
      
      if (!userAnyCase) {
        logger.debug('User not found with case-insensitive search');
        return res.status(401).json({ message: 'Invalid credentials' });
      }
    }

    const foundUser = user || await User.findOne({
      email: { $regex: new RegExp(`^${email}$`, 'i') }
    }).select('+password');

    if (!foundUser) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    logger.debug('User found:', foundUser.email, 'Role:', foundUser.role);

    // Check if user is active (default to true if not set)
    if (foundUser.isActive === false) {
      logger.debug('User account is inactive:', email);
      return res.status(401).json({ message: 'Account is inactive' });
    }

    // Check password
    if (!foundUser.password) {
      logger.debug('No password set for user:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    logger.debug('Attempting password verification...');
    
    // Use the comparePassword method
    const isMatch = await foundUser.comparePassword(password);

    if (!isMatch) {
      logger.debug('Password verification failed for user:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    logger.success('Password verified for:', email);

    // Update last login
    try {
      foundUser.lastLogin = new Date();
      await foundUser.save();
      logger.debug('Last login updated');
    } catch (saveError) {
      logger.warning('Failed to update last login:', saveError);
      // Don't fail login for this
    }

    const token = generateToken(foundUser._id.toString());

    logger.success('Login successful for:', email);

    // Get default permissions based on role
    const defaultPermissions = getDefaultPermissions(foundUser.role);
    
    // Merge with existing permissions, giving priority to defaults for admin role
    const finalPermissions = foundUser.role === 'admin'
      ? defaultPermissions 
      : { ...defaultPermissions, ...foundUser.permissions };

    // Prepare user response with safe data
    const userResponse = {
      id: foundUser._id,
      username: foundUser.username || foundUser.email.split('@')[0],
      email: foundUser.email,
      role: foundUser.role,
      profile: {
        firstName: foundUser.profile?.firstName || '',
        lastName: foundUser.profile?.lastName || '',
        avatar: foundUser.profile?.avatar || '',
        phone: foundUser.profile?.phone || ''
      },
      permissions: finalPermissions,
      lastLogin: foundUser.lastLogin,
      registrationNumber: foundUser.recordRef?.registrationNumber
    };

    res.json({
      success: true,
      token,
      user: userResponse
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ 
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

// Get current user
router.get('/me', auth, async (req: AuthRequest, res) => {
  try {
    const user = await req.user?.populate('recordRef');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Get default permissions based on role
    const defaultPermissions = getDefaultPermissions(user.role);
    
    // Merge with existing permissions, giving priority to defaults for admin role
    const finalPermissions = user.role === 'admin'
      ? defaultPermissions 
      : { ...defaultPermissions, ...user.permissions };

    const userResponse = {
      id: user._id,
      username: user.username || user.email.split('@')[0],
      email: user.email,
      role: user.role,
      profile: {
        firstName: user.profile?.firstName || '',
        lastName: user.profile?.lastName || '',
        avatar: user.profile?.avatar || '',
        phone: user.profile?.phone || ''
      },
      permissions: finalPermissions,
      lastLogin: user.lastLogin,
      registrationNumber: user.recordRef?.registrationNumber
    };

    res.json({
      success: true,
      user: userResponse
    });
  } catch (error) {
    logger.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;