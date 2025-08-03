
import express from 'express';
import { auth, authorize } from '../middleware/auth.js';
import Staff from '../models/Staff.js';
import User from '../models/User.js';

const router = express.Router();

// Get all staff
router.get('/', auth, authorize('admin', 'staff-registry', 'head-department'), async (req, res) => {
  try {
    const staff = await Staff.find().populate('userId');
    res.json({ success: true, staff });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create staff
router.post('/', auth, authorize('admin', 'staff-registry', 'head-department'), async (req, res) => {
  try {
    const { userId } = req.body;

    const existingStaff = await Staff.findOne({ userId });
    if (existingStaff) {
      return res.status(400).json({ message: 'Staff record for this user already exists' });
    }

    const newStaff = await Staff.create({ userId, staffId: `STAFF-${Date.now()}`, employmentInfo: { position: '', department: '', rank: '', currentStatus: '' }, leaveGrants: [], promotions: [] });
    res.status(201).json({ success: true, staff: newStaff });
  } catch (error) {
    console.error('Create staff error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update staff
router.put('/:id', auth, authorize('admin', 'staff-registry', 'head-department'), async (req, res) => {
  try {
    const updatedStaff = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedStaff) {
      return res.status(404).json({ message: 'Staff not found' });
    }
    res.json({ success: true, staff: updatedStaff });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Promote staff
router.put('/:id/promote', auth, authorize('admin', 'staff-registry'), async (req, res) => {
  try {
    const { toRank, reason } = req.body;
    const staffMember = await Staff.findById(req.params.id);

    if (!staffMember) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    staffMember.promotions.push({ toRank, reason, date: new Date() });
    staffMember.employmentInfo.rank = toRank; // Update current rank
    await staffMember.save();

    res.json({ success: true, message: 'Staff promoted successfully', staff: staffMember });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Grant leave to staff
router.put('/:id/grant-leave', auth, authorize('admin', 'staff-registry'), async (req, res) => {
  try {
    const { type, startDate, endDate, days, reason, status } = req.body;
    const staffMember = await Staff.findById(req.params.id);

    if (!staffMember) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    staffMember.leaveGrants.push({ type, startDate, endDate, days, reason, status });
    await staffMember.save();

    res.json({ success: true, message: 'Leave granted successfully', staff: staffMember });
  } catch (error) {
    console.error('Grant leave error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete staff
router.delete('/:id', auth, authorize('admin', 'staff-registry', 'head-department'), async (req, res) => {
  try {
    const { id } = req.params;

    const staffMember = await Staff.findById(id);
    if (!staffMember) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    await Staff.findByIdAndDelete(id);
    await User.findByIdAndDelete(staffMember.userId);

    res.json({ success: true, message: 'Staff and associated user deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
