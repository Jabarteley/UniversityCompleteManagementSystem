import mongoose, { Document, Schema } from 'mongoose';

export interface ILeaveGrant {
  type: string;
  startDate: Date;
  endDate: Date;
  days: number;
  reason: string;
  status: string;
}

export interface IPromotion {
  toRank: string;
  date: Date;
  reason: string;
}

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
  leaveGrants?: ILeaveGrant[];
  promotions?: IPromotion[];
}

const leaveGrantSchema = new Schema<ILeaveGrant>({
  type: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  days: { type: Number, required: true },
  reason: { type: String, required: true },
  status: { type: String, required: true },
});

const promotionSchema = new Schema<IPromotion>({
  toRank: { type: String, required: true },
  date: { type: Date, required: true },
  reason: { type: String, required: true },
});

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
  leaveGrants: [leaveGrantSchema],
  promotions: [promotionSchema],
}, { timestamps: true });

export default mongoose.model<IStaff>('Staff', staffSchema);