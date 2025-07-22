import mongoose, { Document, Schema } from 'mongoose';

export interface ICourse extends Document {
  code: string;
  title: string;
  description?: string;
  creditUnits: number;
  semester: 'first' | 'second' | 'summer';
  level: number;
  department: string;
  faculty: string;
  isCompulsory: boolean;
}

const CourseSchema: Schema = new Schema({
  code: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String },
  creditUnits: { type: Number, required: true },
  semester: { type: String, enum: ['first', 'second', 'summer'], required: true },
  level: { type: Number, required: true },
  department: { type: String, required: true },
  faculty: { type: String, required: true },
  isCompulsory: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model<ICourse>('Course', CourseSchema);
