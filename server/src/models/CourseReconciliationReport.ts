
import mongoose from 'mongoose';

const ReconciliationDiscrepancySchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  reason: { type: String, required: true }, // e.g., "Wrong level", "Wrong department"
});

const CourseReconciliationReportSchema = new mongoose.Schema({
  runDate: { type: Date, default: Date.now },
  runBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  discrepancies: [ReconciliationDiscrepancySchema],
  status: { type: String, enum: ['running', 'completed', 'failed'], default: 'running' },
});

export default mongoose.model('CourseReconciliationReport', CourseReconciliationReportSchema);
