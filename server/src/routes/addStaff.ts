
import express from 'express';
import { auth, authorize } from '../middleware/auth.js';
import Staff from '../models/Staff.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Add new staff (Head of Department)
router.post('/', auth, authorize('admin', 'head-department'), async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, phone, department } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email or username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: 'academic-staff', // Default role for new staff added by HOD
      profile: {
        firstName,
        lastName,
        phone,
      },
    });

    const savedUser = await newUser.save();

    const newStaff = new Staff({
      userId: savedUser._id,
      firstName,
      lastName,
      email,
      phone,
      department,
    });

    await newStaff.save();

    savedUser.recordRef = newStaff._id;
    savedUser.recordType = 'Staff';
    await savedUser.save();

    res.status(201).json({ success: true, message: 'Staff added successfully', user: savedUser });
  } catch (error) {
    console.error('Error adding staff:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
