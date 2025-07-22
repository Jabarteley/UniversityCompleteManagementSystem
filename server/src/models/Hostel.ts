
import mongoose, { Document, Schema } from 'mongoose';

export interface IHostel extends Document {
  name: string;
  capacity: number;
}

const hostelSchema = new Schema<IHostel>({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  capacity: {
    type: Number,
    required: true,
  },
}, { timestamps: true });

export default mongoose.model<IHostel>('Hostel', hostelSchema);
