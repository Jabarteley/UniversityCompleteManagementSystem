import mongoose, { Document, Schema } from 'mongoose';

export interface IStaff extends Document {
  userId: mongoose.Types.ObjectId;
  staffId?: string;
  employmentInfo?: {
    position?: string;
    department?: string;
    rank?: string;
    dateOfEmployment?: Date;
    currentStatus?: string;
  };
  leaveGrants?: [
    {
      type: string;
      startDate: Date;
      endDate: Date;
      reason: string;
      status: string;
    }
  ];
  promotions?: [
    {
      toRank: string;
      date: Date;
      reason: string;
    }
  ];
}

const staffSchema = new Schema<IStaff>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  staffId: {
    type: String,
    unique: true,
    sparse: true,
  },
  employmentInfo: {
    position: String,
    department: String,
    rank: String,
    dateOfEmployment: Date,
    currentStatus: String,
  },
  leaveGrants: [
    {
      type: String,
      startDate: Date,
      endDate: Date,
      reason: String,
      status: String,
    },
  ],
  promotions: [
    {
      toRank: String,
      date: Date,
      reason: String,
    },
  ],
}, { timestamps: true });

export default mongoose.model<IStaff>('Staff', staffSchema);