import express from 'express';
import { auth, authorize } from '../middleware/auth.js';
import TranscriptRequest from '../models/TranscriptRequest.js';

const router = express.Router();

// Request transcripts
router.post('/request', auth, authorize('student'), async (req, res) => {
  try {
    const { studentId, reason, destination } = req.body;

    const newRequest = await TranscriptRequest.create({
      studentId,
      reason,
      destination,
    });

    res.status(201).json({ success: true, message: 'Transcripts requested successfully', request: newRequest });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all transcript requests for a student
router.get('/student/:studentId', auth, authorize('student', 'admin', 'staff-registry'), async (req, res) => {
  try {
    const { studentId } = req.params;
    const requests = await TranscriptRequest.find({ studentId }).sort({ requestDate: -1 });
    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;