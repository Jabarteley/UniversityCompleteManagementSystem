export interface IUser {
  _id: string;
  username?: string;
  email: string;
  password: string;
  role: 'student' | 'staff' | 'admin' | 'system-admin';
  profile?: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
    phone?: string;
  };
  permissions?: {
    canManageUsers?: boolean;
    canManageStudents?: boolean;
    canManageStaff?: boolean;
    canGenerateReports?: boolean;
    canManageFiles?: boolean;
    canViewReports?: boolean;
    canApproveLeave?: boolean;
    canPromoteStaff?: boolean;
  };
  relatedId?: string;
  relatedType?: 'student' | 'staff';
  lastLogin?: Date;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IStudent {
  _id: string;
  registrationNumber: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: Date;
  gender: 'male' | 'female';
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  academicInfo: {
    faculty: string;
    department: string;
    program: string;
    level: string;
    yearOfAdmission: number;
    currentSemester: number;
    status: 'active' | 'graduated' | 'suspended' | 'withdrawn';
  };
  guardian: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
    address: string;
  };
  results: Array<{
    semester: number;
    year: number;
    courses: Array<{
      courseCode: string;
      courseName: string;
      creditUnits: number;
      grade: string;
      gradePoint: number;
    }>;
    gpa: number;
    cgpa: number;
  }>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStaff {
  _id: string;
  staffId: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: Date;
  gender: 'male' | 'female';
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  employmentInfo: {
    department: string;
    faculty: string;
    position: string;
    rank: string;
    employmentType: 'academic' | 'administrative' | 'support';
    dateOfAppointment: Date;
    currentStatus: 'active' | 'on-leave' | 'suspended' | 'retired' | 'terminated';
    salary: {
      basic: number;
      allowances: number;
      total: number;
    };
  };
  qualifications: Array<{
    degree: string;
    institution: string;
    yearObtained: number;
    field: string;
  }>;
  leaveRecords: Array<{
    type: 'annual' | 'sick' | 'casual' | 'maternity' | 'paternity' | 'study' | 'terminal';
    startDate: Date;
    endDate: Date;
    days: number;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    appliedDate: Date;
  }>;
  promotions: Array<{
    fromRank: string;
    toRank: string;
    effectiveDate: Date;
    reason: string;
  }>;
  deployments: Array<{
    fromDepartment: string;
    toDepartment: string;
    effectiveDate: Date;
    reason: string;
  }>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFile {
  _id: string;
  fileName: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  filePath: string;
  category: 'academic' | 'administrative' | 'student' | 'staff' | 'report' | 'other';
  description?: string;
  tags: string[];
  uploadedBy: {
    _id: string;
    profile: {
      firstName: string;
      lastName: string;
    };
  };
  accessLevel: 'public' | 'restricted' | 'confidential';
  metadata: {
    department?: string;
    semester?: string;
    academicYear?: string;
    subject?: string;
  };
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReport {
  _id: string;
  title: string;
  type: 'student-academic' | 'staff-administrative' | 'staff-academic' | 'departmental' | 'financial' | 'custom';
  description?: string;
  generatedBy: {
    _id: string;
    profile: {
      firstName: string;
      lastName: string;
    };
  };
  parameters: {
    dateRange?: {
      startDate: Date;
      endDate: Date;
    };
    department?: string;
    faculty?: string;
    semester?: string;
    academicYear?: string;
  };
  data: any;
  format: 'pdf' | 'excel' | 'csv' | 'json';
  status: 'generating' | 'completed' | 'failed';
  accessLevel: 'public' | 'restricted' | 'confidential';
  createdAt: Date;
  updatedAt: Date;
}