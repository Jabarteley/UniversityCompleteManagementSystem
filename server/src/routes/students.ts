
import express from 'express';
import { auth, authorize } from '../middleware/auth.js';
import Student from '../models/Student.js';
import User from '../models/User.js';

const router = express.Router();

// Get all students
router.get('/', auth, authorize('admin', 'staff-registry', 'staff-affairs', 'head-department', 'academic-staff'), async (req, res) => {
  try {
    const students = await Student.find().populate('userId').populate('registeredCourses');
    res.json({ success: true, students });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create student
router.post('/', auth, authorize('admin', 'staff-registry'), async (req, res) => {
  try {
    const { userId, academicInfo } = req.body;

    // Generate a unique registration number
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000); // Add a random number for more uniqueness

    const registrationNumber = `REG-${year}${month}${day}-${hours}${minutes}${seconds}-${random}`;

    const newStudent = await Student.create({
      userId,
      registrationNumber,
      academicInfo: {
        level: '100',
        ...(academicInfo || {}),
      },
    });
    res.status(201).json({ success: true, student: newStudent });
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update student
router.get('/:id', auth, authorize('admin', 'staff-registry', 'student', 'staff-affairs', 'head-department'), async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('userId');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json({ success: true, student });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', auth, authorize('admin', 'staff-registry', 'student'), async (req, res) => {
  try {
    const { academicInfo, contactInfo } = req.body;
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      { academicInfo, contactInfo },
      { new: true, runValidators: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Update user profile if provided
    if (req.body.profile) {
      await User.findByIdAndUpdate(
        updatedStudent.userId,
        { profile: req.body.profile },
        { new: true, runValidators: true }
      );
    }

    res.json({ success: true, student: updatedStudent });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete student
router.delete('/:id', auth, authorize('admin', 'staff-registry'), async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    await Student.findByIdAndDelete(id);
    await User.findByIdAndDelete(student.userId);

    res.json({ success: true, message: 'Student and associated user deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
