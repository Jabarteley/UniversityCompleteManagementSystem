export interface UserRole {
  id: string;
  name: string;
  activities: string[];
}

export const USER_ROLES: UserRole[] = [
  {
    id: 'admin',
    name: 'Admin User (Registrar)',
    activities: [
      'Login',
      'Add New User',
      'Update/Delete Users',
      'Logout'
    ]
  },
  {
    id: 'staff-registry',
    name: 'Staff User (Administrative Registry)',
    activities: [
      'Login',
      'Add Records',
      'View Records',
      'Retrieve Records',
      'Update Records (Staff and Students)',
      'Create/Update Nominal Roll, Promotions, Leave Grants, Employment, etc.',
      'Write Reports',
      'Delete Records'
    ]
  },
  {
    id: 'staff-affairs',
    name: 'Staff User (Student Affairs)',
    activities: [
      'Login',
      'Hostel Allocations',
      'Verify Check-in/Out Student from Hostel',
      'Download Student Reports',
      'Upload Students Results',
      'Checking of Admission Status',
      'Mobilize/Upload Students Records to dedicated websites (JAMB, NYSC, etc.)'
    ]
  },
  {
    id: 'student',
    name: 'Student User',
    activities: [
      'Login',
      'Create Student Profile',
      'Check Admission',
      'Make Fee Payment',
      'Check Semester Result',
      'Register Courses Per Semester',
      'Check Wrong Course',
      'Process Final Clearance',
      'Download Statement of Result',
      'Request for Transcripts',
      'Logout'
    ]
  },
  {
    id: 'academic-staff',
    name: 'Academic Staff (Lecturer) User',
    activities: [
      'Login',
      'Check Course Allocation',
      'Upload Results',
      'Update/Delete Results',
      'Logout'
    ]
  },
  {
    id: 'head-department',
    name: 'Head Department User',
    activities: [
      'Login',
      'Upload Results',
      'Create Course Allocation',
      'Course Reconciliation',
      'Add New Staff',
      'Logout'
    ]
  }
];