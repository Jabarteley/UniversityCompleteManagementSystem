
import mongoose, { Document, Schema } from 'mongoose';

export interface IHostel extends Document {
  name: string;
  totalRooms: number;
  availableRooms: number;
}

const hostelSchema = new Schema<IHostel>({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  totalRooms: {
    type: Number,
    required: true,
  },
  availableRooms: {
    type: Number,
    required: true,
  },
}, { timestamps: true });

export default mongoose.model<IHostel>('Hostel', hostelSchema);
