import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  Upload, 
  Calendar, 
  GitBranch, 
  UserPlus, 
  LogOut,
  School,
  Users,
  BookOpen,
  Save
} from 'lucide-react';
import { courseAllocationAPI } from '../api/courseAllocation';
import { studentResultsAPI } from '../api/studentResults';
import { usersAPI } from '../api/users';
import { studentsAPI } from '../api/students';
import toast from 'react-hot-toast';
import UploadResultsForm from '../components/Forms/UploadResultsForm';

const HeadDepartmentDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');
  const [allocationForm, setAllocationForm] = useState({
    courseCode: '',
    courseName: '',
    creditHours: 3,
    semester: 'first',
    academicYear: new Date().getFullYear().toString(),
    department: '',
    faculty: '',
    level: '100',
    assignedLecturer: '',
    maxStudents: 50
  });
  const [newStaffForm, setNewStaffForm] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    department: ''
  });
  const queryClient = useQueryClient();

  // Fetch data
  const { data: allocationsData } = useQuery('course-allocations', () => courseAllocationAPI.getAll({ limit: 50 }));
  const { data: usersData } = useQuery('users', () => usersAPI.getAll({ limit: 100 }));
  const { data: studentsData } = useQuery('students', () => studentsAPI.getAll({ limit: 100 }));

  const allocations = allocationsData?.allocations || [];
  const users = usersData?.users || [];
  const students = studentsData?.students || [];
  const academicStaff = users.filter((u: any) => u.role === 'academic-staff');

  // Mutations
  const createAllocationMutation = useMutation(courseAllocationAPI.create, {
    onSuccess: () => {
      toast.success('Course allocation created successfully');
      queryClient.invalidateQueries('course-allocations');
      setAllocationForm({
        courseCode: '',
        courseName: '',
        creditHours: 3,
        semester: 'first',
        academicYear: new Date().getFullYear().toString(),
        department: '',
        faculty: '',
        level: '100',
        assignedLecturer: '',
        maxStudents: 50
      });
    },
    onError: () => toast.error('Failed to create course allocation')
  });

  const createStaffMutation = useMutation(usersAPI.create, {
    onSuccess: () => {
      toast.success('Staff member added successfully');
      queryClient.invalidateQueries('users');
      setNewStaffForm({
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        department: ''
      });
    },
    onError: () => toast.error('Failed to add staff member')
  });

  const reconcileMutation = useMutation(courseAllocationAPI.reconcile, {
    onSuccess: (data) => {
      toast.success('Course reconciliation completed');
      console.log('Reconciliation data:', data);
    },
    onError: () => toast.error('Failed to reconcile courses')
  });

  const hodActivities = [
    {
      id: 'upload-results',
      title: 'Upload Results',
      description: 'Upload departmental results and grades',
      icon: Upload,
      color: 'bg-blue-500',
      action: () => setActiveSection('upload-results')
    },
    {
      id: 'course-allocation',
      title: 'Create Course Allocation',
      description: 'Assign courses to academic staff',
      icon: Calendar,
      color: 'bg-green-500',
      action: () => setActiveSection('course-allocation')
    },
    {
      id: 'course-reconciliation',
      title: 'Course Reconciliation',
      description: 'Reconcile and verify course assignments',
      icon: GitBranch,
      color: 'bg-purple-500',
      action: () => setActiveSection('course-reconciliation')
    },
    {
      id: 'add-staff',
      title: 'Add New Staff',
      description: 'Add new academic staff to the department',
      icon: UserPlus,
      color: 'bg-orange-500',
      action: () => setActiveSection('add-staff')
    }
  ];

  const handleCreateAllocation = () => {
    if (!allocationForm.courseCode || !allocationForm.courseName || !allocationForm.assignedLecturer) {
      toast.error('Please fill all required fields');
      return;
    }

    createAllocationMutation.mutate({
      courseCode: allocationForm.courseCode,
      courseName: allocationForm.courseName,
      creditHours: allocationForm.creditHours,
      semester: allocationForm.semester,
      academicYear: allocationForm.academicYear,
      department: allocationForm.department,
      faculty: allocationForm.faculty,
      level: allocationForm.level,
      assignedLecturer: allocationForm.assignedLecturer,
      maxStudents: allocationForm.maxStudents,
    });
  };

  const handleAddStaff = () => {
    if (!newStaffForm.email || !newStaffForm.password || !newStaffForm.firstName || !newStaffForm.lastName) {
      toast.error('Please fill all required fields');
      return;
    }

    createStaffMutation.mutate({
      ...newStaffForm,
      role: 'academic-staff',
      profile: {
        firstName: newStaffForm.firstName,
        lastName: newStaffForm.lastName,
        phone: newStaffForm.phone
      },
      department: newStaffForm.department
    });
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'upload-results':
        return <UploadResultsForm />;

      case 'course-allocation':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Course Allocation</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course Code</label>
                  <input
                    type="text"
                    value={allocationForm.courseCode}
                    onChange={(e) => setAllocationForm({ ...allocationForm, courseCode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., CSC 301"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
                  <input
                    type="text"
                    value={allocationForm.courseName}
                    onChange={(e) => setAllocationForm({ ...allocationForm, courseName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., Data Structures"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Credit Hours</label>
                  <select
                    value={allocationForm.creditHours}
                    onChange={(e) => setAllocationForm({ ...allocationForm, creditHours: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                    <option value={5}>5</option>
                    <option value={6}>6</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Lecturer</label>
                  <select
                    value={allocationForm.assignedLecturer}
                    onChange={(e) => setAllocationForm({ ...allocationForm, assignedLecturer: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select Lecturer</option>
                    {academicStaff.map((staff: any) => (
                      <option key={staff._id} value={staff._id}>
                        {staff.profile?.firstName} {staff.profile?.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={allocationForm.department}
                    onChange={(e) => setAllocationForm({ ...allocationForm, department: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., Computer Science"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Faculty</label>
                  <input
                    type="text"
                    value={allocationForm.faculty}
                    onChange={(e) => setAllocationForm({ ...allocationForm, faculty: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., Engineering"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                  <select
                    value={allocationForm.level}
                    onChange={(e) => setAllocationForm({ ...allocationForm, level: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="100">100 Level</option>
                    <option value="200">200 Level</option>
                    <option value="300">300 Level</option>
                    <option value="400">400 Level</option>
                    <option value="500">500 Level</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                  <select
                    value={allocationForm.semester}
                    onChange={(e) => setAllocationForm({ ...allocationForm, semester: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="first">1st Semester</option>
                    <option value="second">2nd Semester</option>
                    <option value="summer">Summer</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleCreateAllocation}
                disabled={createAllocationMutation.isLoading}
                className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <Save className="h-4 w-4 mr-2" />
                {createAllocationMutation.isLoading ? 'Creating...' : 'Create Allocation'}
              </button>
            </div>
          </div>
        );

      case 'course-reconciliation':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Reconciliation</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{allocations.length}</div>
                  <div className="text-sm text-blue-700">Total Allocations</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{academicStaff.length}</div>
                  <div className="text-sm text-green-700">Academic Staff</div>
                </div>
              </div>

              <button
                onClick={() => reconcileMutation.mutate({
                  academicYear: new Date().getFullYear().toString(),
                  semester: '1st'
                })}
                disabled={reconcileMutation.isLoading}
                className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                <GitBranch className="h-4 w-4 mr-2" />
                {reconcileMutation.isLoading ? 'Reconciling...' : 'Start Reconciliation'}
              </button>

              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Current Allocations</h4>
                {allocations.slice(0, 5).map((allocation: any) => (
                  <div key={allocation._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{allocation.courseCode} - {allocation.courseName}</p>
                      <p className="text-sm text-gray-600">
                        {allocation.assignedLecturer?.profile?.firstName} {allocation.assignedLecturer?.profile?.lastName}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                      {allocation.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'add-staff':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Academic Staff</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={newStaffForm.firstName}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={newStaffForm.lastName}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input
                    type="text"
                    value={newStaffForm.username}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, username: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={newStaffForm.email}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={newStaffForm.password}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={newStaffForm.phone}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={newStaffForm.department}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, department: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <button
                onClick={handleAddStaff}
                disabled={createStaffMutation.isLoading}
                className="w-full flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                {createStaffMutation.isLoading ? 'Adding...' : 'Add Staff Member'}
              </button>
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Overview</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{academicStaff.length}</div>
                <div className="text-sm text-blue-700">Academic Staff</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{allocations.length}</div>
                <div className="text-sm text-green-700">Course Allocations</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{students.length}</div>
                <div className="text-sm text-purple-700">Students</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {allocations.reduce((sum: number, a: any) => sum + (a.enrolledStudents?.length || 0), 0)}
                </div>
                <div className="text-sm text-orange-700">Total Enrollments</div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-orange-600 rounded-lg p-2 mr-3">
                <School className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">URMS</h1>
                <p className="text-sm text-gray-500">Head of Department Portal</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.profile?.firstName} {user?.profile?.lastName}
                </p>
                <p className="text-xs text-gray-500">Head of Department</p>
              </div>
              <button
                onClick={logout}
                className="flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-sm p-6 text-white mb-8"
        >
          <h1 className="text-2xl font-bold mb-2">
            Head of Department Dashboard
          </h1>
          <p className="text-orange-100">
            Manage departmental operations, staff, and course allocations
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* HOD Activities Grid */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {hodActivities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={activity.action}
                >
                  <div className={`${activity.color} rounded-lg p-3 mb-4 w-fit`}>
                    <activity.icon className="h-6 w-6 text-white" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {activity.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {activity.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Active Section */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {renderActiveSection()}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeadDepartmentDashboard;