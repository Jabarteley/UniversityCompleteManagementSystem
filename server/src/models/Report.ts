import mongoose, { Document, Schema } from 'mongoose';

export interface IReport extends Document {
  title: string;
  type: 'student-academic' | 'staff-administrative' | 'staff-academic' | 'departmental' | 'financial' | 'custom';
  description?: string;
  generatedBy: mongoose.Types.ObjectId;
  parameters: {
    dateRange?: {
      startDate: Date;
      endDate: Date;
    };
    department?: string;
    faculty?: string;
    semester?: string;
    academicYear?: string;
    studentLevel?: string;
    staffType?: string;
    customFilters?: any;
  };
  data: any;
  format: 'pdf' | 'excel' | 'csv' | 'json';
  filePath?: string;
  status: 'generating' | 'completed' | 'failed';
  isScheduled: boolean;
  scheduleConfig?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    nextRun: Date;
  };
  accessLevel: 'public' | 'restricted' | 'confidential';
  sharedWith: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const reportSchema = new Schema<IReport>({
  title: {
    type: String,
    required: [true, 'Report title is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['student-academic', 'staff-administrative', 'staff-academic', 'departmental', 'financial', 'custom'],
    required: [true, 'Report type is required']
  },
  description: {
    type: String,
    trim: true
  },
  generatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Report generator is required']
  },
  parameters: {
    dateRange: {
      startDate: Date,
      endDate: Date
    },
    department: String,
    faculty: String,
    semester: String,
    academicYear: String,
    studentLevel: String,
    staffType: String,
    customFilters: Schema.Types.Mixed
  },
  data: {
    type: Schema.Types.Mixed,
    required: [true, 'Report data is required']
  },
  format: {
    type: String,
    enum: ['pdf', 'excel', 'csv', 'json'],
    default: 'pdf'
  },
  filePath: String,
  status: {
    type: String,
    enum: ['generating', 'completed', 'failed'],
    default: 'generating'
  },
  isScheduled: {
    type: Boolean,
    default: false
  },
  scheduleConfig: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly']
    },
    nextRun: Date
  },
  accessLevel: {
    type: String,
    enum: ['public', 'restricted', 'confidential'],
    default: 'restricted'
  },
  sharedWith: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

export default mongoose.model<IReport>('Report', reportSchema);