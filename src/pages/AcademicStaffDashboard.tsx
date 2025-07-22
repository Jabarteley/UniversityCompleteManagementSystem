import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  BookOpen, 
  Upload, 
  Edit, 
  LogOut,
  School,
  Calendar,
  Save,
  Trash2
} from 'lucide-react';
import { courseAllocationAPI } from '../api/courseAllocation';
import { studentResultsAPI } from '../api/studentResults';
import { studentsAPI } from '../api/students';
import toast from 'react-hot-toast';

const AcademicStaffDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('course-allocation');
  const [resultForm, setResultForm] = useState({
    studentId: '',
    courseCode: '',
    courseName: '',
    creditUnits: 3,
    grade: '',
    gradePoint: 0,
    semester: 1,
    year: new Date().getFullYear()
  });
  const queryClient = useQueryClient();

  // Fetch data
  const { data: allocationsData } = useQuery('course-allocations', () => courseAllocationAPI.getAll({ limit: 50 }));
  const { data: studentsData } = useQuery('students', () => studentsAPI.getAll({ limit: 100 }));

  const allocations = allocationsData?.allocations || [];
  const students = studentsData?.students || [];

  // Mutations
  const uploadResultMutation = useMutation(studentResultsAPI.upload, {
    onSuccess: () => {
      toast.success('Result uploaded successfully');
      setResultForm({
        studentId: '',
        courseCode: '',
        courseName: '',
        creditUnits: 3,
        grade: '',
        gradePoint: 0,
        semester: 1,
        year: new Date().getFullYear()
      });
    },
    onError: () => toast.error('Failed to upload result')
  });

  const academicActivities = [
    {
      id: 'course-allocation',
      title: 'Check Course Allocation',
      description: 'View your assigned courses for the semester',
      icon: BookOpen,
      color: 'bg-blue-500',
      action: () => setActiveSection('course-allocation')
    },
    {
      id: 'upload-results',
      title: 'Upload Results',
      description: 'Upload student results and grades',
      icon: Upload,
      color: 'bg-green-500',
      action: () => setActiveSection('upload-results')
    },
    {
      id: 'update-results',
      title: 'Update/Delete Results',
      description: 'Modify or remove existing results',
      icon: Edit,
      color: 'bg-orange-500',
      action: () => setActiveSection('update-results')
    }
  ];

  const handleUploadResult = () => {
    if (!resultForm.studentId || !resultForm.courseCode || !resultForm.grade) {
      toast.error('Please fill all required fields');
      return;
    }

    uploadResultMutation.mutate({
      ...resultForm,
      studentId: resultForm.studentId,
      courseName: resultForm.courseName,
      creditUnits: resultForm.creditUnits,
      gradePoint: resultForm.gradePoint,
      semester: resultForm.semester,
      year: resultForm.year,
    });
  };

  const getGradePoint = (grade: string) => {
    switch (grade.toUpperCase()) {
      case 'A': return 5.0;
      case 'B': return 4.0;
      case 'C': return 3.0;
      case 'D': return 2.0;
      case 'E': return 1.0;
      case 'F': return 0.0;
      default: return 0.0;
    }
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'course-allocation':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Course Allocations</h3>
            <div className="space-y-4">
              {allocations.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No courses allocated yet</p>
              ) : (
                allocations.map((allocation: any) => (
                  <div key={allocation._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {allocation.courseCode} - {allocation.courseName}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {allocation.department} • {allocation.creditHours} Credit Hours
                        </p>
                      </div>
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                        {allocation.level} Level
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Semester:</span>
                        <span className="ml-2 font-medium">{allocation.semester}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Students:</span>
                        <span className="ml-2 font-medium">{allocation.enrolledStudents?.length || 0}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Academic Year:</span>
                        <span className="ml-2 font-medium">{allocation.academicYear}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Status:</span>
                        <span className="ml-2 font-medium capitalize">{allocation.status}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );

      case 'upload-results':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Student Results</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                  <select
                    value={resultForm.studentId}
                    onChange={(e) => setResultForm({ ...resultForm, studentId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select Student</option>
                    {students.map((student: any) => (
                      <option key={student._id} value={student._id}>
                        {student.registrationNumber} - {student.userId?.profile?.firstName} {student.userId?.profile?.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                  <select
                    value={resultForm.courseCode}
                    onChange={(e) => {
                      const selectedAllocation = allocations.find((a: any) => a.courseCode === e.target.value);
                      setResultForm({ 
                        ...resultForm, 
                        courseCode: e.target.value,
                        courseName: selectedAllocation?.courseName || '',
                        creditUnits: selectedAllocation?.creditHours || 3
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select Course</option>
                    {allocations.map((allocation: any) => (
                      <option key={allocation._id} value={allocation.courseCode}>
                        {allocation.courseCode} - {allocation.courseName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                  <select
                    value={resultForm.grade}
                    onChange={(e) => {
                      const grade = e.target.value;
                      setResultForm({ 
                        ...resultForm, 
                        grade,
                        gradePoint: getGradePoint(grade)
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select Grade</option>
                    <option value="A">A (5.0)</option>
                    <option value="B">B (4.0)</option>
                    <option value="C">C (3.0)</option>
                    <option value="D">D (2.0)</option>
                    <option value="E">E (1.0)</option>
                    <option value="F">F (0.0)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                  <select
                    value={resultForm.semester}
                    onChange={(e) => setResultForm({ ...resultForm, semester: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value={1}>1st Semester</option>
                    <option value={2}>2nd Semester</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                  <input
                    type="number"
                    value={resultForm.year}
                    onChange={(e) => setResultForm({ ...resultForm, year: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grade Point</label>
                  <input
                    type="number"
                    step="0.1"
                    value={resultForm.gradePoint}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
              </div>

              <button
                onClick={handleUploadResult}
                disabled={uploadResultMutation.isLoading}
                className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <Save className="h-4 w-4 mr-2" />
                {uploadResultMutation.isLoading ? 'Uploading...' : 'Upload Result'}
              </button>
            </div>
          </div>
        );

      case 'update-results':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Update/Delete Results</h3>
            <div className="space-y-4">
              <p className="text-gray-600">Select a student to view and modify their results:</p>
              
              <div className="space-y-3">
                {students.slice(0, 5).map((student: any) => (
                  <div key={student._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium">
                        {student.userId?.profile?.firstName} {student.userId?.profile?.lastName}
                      </p>
                      <p className="text-sm text-gray-600">{student.registrationNumber}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200">
                        <Edit className="h-3 w-3 mr-1 inline" />
                        Edit
                      </button>
                      <button className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200">
                        <Trash2 className="h-3 w-3 mr-1 inline" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Academic Overview</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{allocations.length}</div>
                <div className="text-sm text-blue-700">Courses Assigned</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {allocations.reduce((sum: number, a: any) => sum + (a.enrolledStudents?.length || 0), 0)}
                </div>
                <div className="text-sm text-green-700">Total Students</div>
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
              <div className="bg-indigo-600 rounded-lg p-2 mr-3">
                <School className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">URMS</h1>
                <p className="text-sm text-gray-500">Academic Staff Portal</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.profile?.firstName} {user?.profile?.lastName}
                </p>
                <p className="text-xs text-gray-500">Lecturer</p>
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
          className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl shadow-sm p-6 text-white mb-8"
        >
          <h1 className="text-2xl font-bold mb-2">
            Academic Staff Dashboard
          </h1>
          <p className="text-indigo-100">
            Manage your courses and student results
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Academic Activities Grid */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {academicActivities.map((activity, index) => (
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

export default AcademicStaffDashboard;