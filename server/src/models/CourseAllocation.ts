
import mongoose, { Document, Schema } from 'mongoose';

export interface ICourseAllocation extends Document {
  courseCode: string;
  courseName: string;
  creditHours: number;
  semester: string;
  academicYear: string;
  department: string;
  faculty: string;
  level: string;
  assignedLecturer: mongoose.Types.ObjectId;
  maxStudents: number;
}

const courseAllocationSchema = new Schema<ICourseAllocation>({
  courseCode: { type: String, required: true },
  courseName: { type: String, required: true },
  creditHours: { type: Number, required: true },
  semester: { type: String, required: true },
  academicYear: { type: String, required: true },
  department: { type: String, required: true },
  faculty: { type: String, required: true },
  level: { type: String, required: true },
  assignedLecturer: {
    type: Schema.Types.ObjectId,
    ref: 'Staff',
    required: true,
  },
  maxStudents: { type: Number, required: true },
}, { timestamps: true });

export default mongoose.model<ICourseAllocation>('CourseAllocation', courseAllocationSchema);
