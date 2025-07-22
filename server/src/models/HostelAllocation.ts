
import mongoose, { Document, Schema } from 'mongoose';

export interface IHostelAllocation extends Document {
  student: mongoose.Types.ObjectId;
  hostel: mongoose.Types.ObjectId;
  roomNumber: string;
  status: 'allocated' | 'checked-in' | 'checked-out';
}

const hostelAllocationSchema = new Schema<IHostelAllocation>({
  student: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  hostel: {
    type: Schema.Types.ObjectId,
    ref: 'Hostel',
    required: true,
  },
  roomNumber: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['allocated', 'checked-in', 'checked-out'],
    default: 'allocated',
  },
}, { timestamps: true });

export default mongoose.model<IHostelAllocation>('HostelAllocation', hostelAllocationSchema);
