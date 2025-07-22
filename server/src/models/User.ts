import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: 'student' | 'staff-registry' | 'staff-affairs' | 'academic-staff' | 'head-department' | 'admin';
  profile: {
    firstName: string;
    lastName: string;
    middleName?: string;
    avatar?: string;
    phone?: string;
    dateOfBirth?: Date;
    gender?: 'male' | 'female';
    address?: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  };
  permissions: {
    canManageUsers: boolean;
    canManageStudents: boolean;
    canManageStaff: boolean;
    canGenerateReports: boolean;
    canManageFiles: boolean;
    canViewReports: boolean;
    canApproveLeave: boolean;
    canPromoteStaff: boolean;
    canBackupData: boolean;
    canManageSystem: boolean;
  };
  recordRef?: mongoose.Types.ObjectId;
  recordType?: 'Student' | 'Staff';
  lastLogin?: Date;
  loginAttempts: number;
  lockUntil?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  emailVerified: boolean;
  emailVerificationToken?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  isLocked(): boolean;
  incLoginAttempts(): Promise<void>;
}

const userSchema = new Schema<IUser>({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['student', 'staff-registry', 'staff-affairs', 'academic-staff', 'head-department', 'admin'],
    required: [true, 'User role is required']
  },
  profile: {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true
    },
    middleName: {
      type: String,
      trim: true
    },
    avatar: String,
    phone: String,
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['male', 'female']
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    }
  },
  permissions: {
    canManageUsers: { type: Boolean, default: false },
    canManageStudents: { type: Boolean, default: false },
    canManageStaff: { type: Boolean, default: false },
    canGenerateReports: { type: Boolean, default: false },
    canManageFiles: { type: Boolean, default: false },
    canViewReports: { type: Boolean, default: false },
    canApproveLeave: { type: Boolean, default: false },
    canPromoteStaff: { type: Boolean, default: false },
    canBackupData: { type: Boolean, default: false },
    canManageSystem: { type: Boolean, default: false }
  },
  recordRef: {
    type: Schema.Types.ObjectId,
    refPath: 'recordType'
  },
  recordType: {
    type: String,
    enum: ['Student', 'Staff']
  },
  lastLogin: Date,
  loginAttempts: { type: Number, default: 0 },
  lockUntil: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  emailVerified: { type: Boolean, default: false },
  emailVerificationToken: String,
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

userSchema.index({ role: 1 });
userSchema.index({ recordRef: 1, recordType: 1 });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    if (!this.password || !candidatePassword) return false;
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

userSchema.methods.isLocked = function(): boolean {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

userSchema.methods.incLoginAttempts = async function(): Promise<void> {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { loginAttempts: 1, lockUntil: 1 }
    });
  }
  
  const updates: any = { $inc: { loginAttempts: 1 } };
  
  if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 };
  }
  
  return this.updateOne(updates);
};

export default mongoose.model<IUser>('User', userSchema);