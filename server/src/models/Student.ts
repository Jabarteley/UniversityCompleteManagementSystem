
import mongoose, { Document, Schema } from 'mongoose';

export interface IStudent extends Document {
  userId: mongoose.Types.ObjectId;
  registrationNumber?: string;
  academicInfo?: {
    major?: string;
    department?: string;
    faculty?: string;
    level?: string;
    entryYear?: number;
    currentSemester?: string;
    status?: string; // e.g., 'active', 'graduated', 'withdrawn'
    program?: string;
    yearOfAdmission?: number;
  };
  contactInfo?: {
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  results: [
    {
      semester: number;
      year: number;
      courses: [
        {
          courseCode: string;
          courseName: string;
          creditUnits: number;
          grade: string;
          gradePoint: number;
        }
      ];
      gpa: number;
      cgpa: number;
    }
  ];
  registeredCourses?: mongoose.Types.ObjectId[];
}

const studentSchema = new Schema<IStudent>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  registrationNumber: {
    type: String,
    unique: true,
    sparse: true, // Allows null values to be unique
  },
  academicInfo: {
    major: String,
    department: String,
    faculty: String,
    level: String,
    entryYear: Number,
    currentSemester: String,
    status: String,
    program: String,
    yearOfAdmission: Number,
  },
  contactInfo: {
    address: String,
    city: String,
    state: String,
    zipCode: String,
  },
  results: [
    {
      semester: Number,
      year: Number,
      courses: [
        {
          courseCode: String,
          courseName: String,
          creditUnits: Number,
          grade: String,
          gradePoint: Number
        }
      ],
      gpa: Number,
      cgpa: Number,
    },
  ],
  registeredCourses: [{
    type: Schema.Types.ObjectId,
    ref: 'Course',
  }],
}, { timestamps: true });

export default mongoose.model<IStudent>('Student', studentSchema);
