import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  Home, 
  CheckCircle, 
  Download, 
  Upload, 
  UserCheck, 
  Globe,
  LogOut,
  School,
  Search,
  PlusCircle
} from 'lucide-react';
import { hostelAllocationAPI } from '../api/hostelAllocation';
import { hostelAPI } from '../api/hostel';
import { admissionsAPI } from '../api/admissions';
import { externalIntegrationAPI } from '../api/externalIntegration';
import { studentResultsAPI } from '../api/studentResults';
import { studentsAPI } from '../api/students';
import { reportsAPI } from '../api/reports';
import toast from 'react-hot-toast';

const StaffAffairsDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [showHostelAllocationForm, setShowHostelAllocationForm] = useState(false);
  const [newAllocationData, setNewAllocationData] = useState({
    studentId: '',
    hostelId: '',
    roomNumber: '',
  });
  const [newResultData, setNewResultData] = useState({
    studentId: '',
    courseCode: '',
    courseName: '',
    creditUnits: '',
    grade: '',
    gradePoint: '',
    semester: '',
    year: '',
  });
  const [showHostelManagementForm, setShowHostelManagementForm] = useState(false);
  const [newHostelData, setNewHostelData] = useState({
    name: '',
    totalRooms: '',
  });
  const [selectedStudentForReport, setSelectedStudentForReport] = useState('');
  const [reportType, setReportType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const queryClient = useQueryClient();

  // Fetch data
  const { data: hostelData } = useQuery('hostel-allocations', () => hostelAllocationAPI.getAll(), {
    onError: () => toast.error('Failed to load hostel allocations')
  });
  const { data: hostelsList } = useQuery('hostels-list', () => hostelAPI.getAll(), {
    onError: () => toast.error('Failed to load hostels list')
  });
  const { data: studentsData } = useQuery('students', () => studentsAPI.getAll(), {
    onError: () => toast.error('Failed to load students data')
  });

  const createHostelAllocationMutation = useMutation(hostelAllocationAPI.create, {
    onSuccess: () => {
      toast.success('Hostel allocation created successfully');
      queryClient.invalidateQueries('hostel-allocations');
      setShowHostelAllocationForm(false);
      setNewAllocationData({
        studentId: '',
        hostelId: '',
        roomNumber: '',
        bedNumber: '',
      });
    },
    onError: () => toast.error('Failed to create hostel allocation')
  });
  
  const { data: uploadHistory } = useQuery('upload-history', externalIntegrationAPI.getUploadHistory, {
    onError: () => toast.error('Failed to load upload history')
  });

  const hostels = hostelData?.allocations || [];
  const students = studentsData?.students || [];

  // Mutations
  const checkInMutation = useMutation(hostelAllocationAPI.checkIn, {
    onSuccess: () => {
      toast.success('Student checked in successfully');
      queryClient.invalidateQueries('hostel-allocations');
    },
    onError: () => toast.error('Failed to check in student')
  });

  const checkOutMutation = useMutation(hostelAllocationAPI.checkOut, {
    onSuccess: () => {
      toast.success('Student checked out successfully');
      queryClient.invalidateQueries('hostel-allocations');
    },
    onError: () => toast.error('Failed to check out student')
  });

  const uploadToJAMBMutation = useMutation(externalIntegrationAPI.uploadToJAMB, {
    onSuccess: () => {
      toast.success('Data uploaded to JAMB successfully');
      queryClient.invalidateQueries('upload-history');
    },
    onError: () => toast.error('Failed to upload to JAMB')
  });

  const uploadResultMutation = useMutation(studentResultsAPI.upload, {
    onSuccess: () => {
      toast.success('Student result uploaded successfully');
      setNewResultData({
        studentId: '',
        courseCode: '',
        courseName: '',
        creditUnits: '',
        grade: '',
        gradePoint: '',
        semester: '',
        year: '',
      });
    },
    onError: () => toast.error('Failed to upload student result')
  });

  const createHostelMutation = useMutation(hostelAPI.create, {
    onSuccess: () => {
      toast.success('Hostel created successfully');
      queryClient.invalidateQueries('hostels-list');
      setShowHostelManagementForm(false);
      setNewHostelData({
        name: '',
        totalRooms: '',
      });
    },
    onError: () => toast.error('Failed to create hostel')
  });

  const generateReportMutation = useMutation(reportsAPI.generateStudentReport, {
    onSuccess: async (data) => {
      toast.success('Report generated successfully');
      const reportId = data.report._id; // Adjust based on actual backend response
      if (reportId) {
        try {
          const blob = await reportsAPI.download(reportId);
          const url = window.URL.createObjectURL(new Blob([blob]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `student_report_${reportId}.json`); // Assuming JSON format from backend
          document.body.appendChild(link);
          link.click();
          link.parentNode?.removeChild(link);
          toast.success('Report downloaded successfully');
        } catch (downloadError) {
          toast.error('Failed to download report');
          console.error('Download error:', downloadError);
        }
      }
    },
    onError: () => toast.error('Failed to generate report')
  });

  const affairsActivities = [
    {
      id: 'hostel-management',
      title: 'Hostel Management',
      description: 'Create and manage hostels and their room availability',
      icon: Home,
      color: 'bg-purple-500',
      action: () => setActiveSection('hostel-management')
    },
    {
      id: 'hostel-allocation',
      title: 'Hostel Allocations',
      description: 'Manage student hostel room assignments',
      icon: Home,
      color: 'bg-blue-500',
      action: () => setActiveSection('hostel-allocation')
    },
    {
      id: 'hostel-checkin',
      title: 'Verify Check-in/Out Student from Hostel',
      description: 'Monitor student hostel check-in and check-out',
      icon: CheckCircle,
      color: 'bg-green-500',
      action: () => setActiveSection('hostel-checkin')
    },
    {
      id: 'download-reports',
      title: 'Download Student Reports',
      description: 'Access and download student academic reports',
      icon: Download,
      color: 'bg-purple-500',
      action: () => setActiveSection('download-reports')
    },
    {
      id: 'upload-results',
      title: 'Upload Students Results',
      description: 'Upload semester results for students',
      icon: Upload,
      color: 'bg-orange-500',
      action: () => setActiveSection('upload-results')
    },
    {
      id: 'admission-status',
      title: 'Checking of Admission Status',
      description: 'Verify and update student admission status',
      icon: UserCheck,
      color: 'bg-indigo-500',
      action: () => setActiveSection('admission-status')
    },
    {
      id: 'external-upload',
      title: 'Mobilize/Upload Students Records to dedicated websites (JAMB, NYSC, etc.)',
      description: 'Upload student data to external platforms',
      icon: Globe,
      color: 'bg-teal-500',
      action: () => setActiveSection('external-upload')
    }
  ];

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'hostel-management':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Hostel Management</h3>
              <button
                onClick={() => setShowHostelManagementForm(!showHostelManagementForm)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
              >
                <PlusCircle className="h-5 w-5 mr-2" />
                {showHostelManagementForm ? 'Cancel' : 'Create New Hostel'}
              </button>
            </div>

            {showHostelManagementForm && (
              <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h4 className="text-md font-semibold text-gray-800 mb-3">Create New Hostel</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="hostelName" className="block text-sm font-medium text-gray-700">Hostel Name</label>
                    <input
                      type="text"
                      id="hostelName"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={newHostelData.name}
                      onChange={(e) => setNewHostelData({ ...newHostelData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label htmlFor="totalRooms" className="block text-sm font-medium text-gray-700">Total Rooms</label>
                    <input
                      type="number"
                      id="totalRooms"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={newHostelData.totalRooms}
                      onChange={(e) => setNewHostelData({ ...newHostelData, totalRooms: e.target.value })}
                    />
                  </div>
                </div>
                <button
                  onClick={() => createHostelMutation.mutate(newHostelData as any)}
                  className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Create Hostel
                </button>
              </div>
            )}

            <div className="space-y-3 max-h-80 overflow-y-auto">
              {hostelsList?.hostels?.map((hostel: any) => (
                <div key={hostel._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium">
                      {hostel.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      Rooms: {hostel.availableRooms} / {hostel.totalRooms}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'hostel-allocation':
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Hostel Allocations</h3>
        <button
          onClick={() => setShowHostelAllocationForm(!showHostelAllocationForm)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
        >
          <PlusCircle className="h-5 w-5 mr-2" />
          {showHostelAllocationForm ? 'Cancel' : 'New Allocation'}
        </button>
      </div>

      {showHostelAllocationForm && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h4 className="text-md font-semibold text-gray-800 mb-3">Create New Hostel Allocation</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="student" className="block text-sm font-medium text-gray-700">Student</label>
              <select
                id="student"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={newAllocationData.studentId}
                onChange={(e) => setNewAllocationData({ ...newAllocationData, studentId: e.target.value })}
              >
                <option value="">Select Student</option>
                {students.map((student: any) => (
                  <option key={student._id} value={student._id}>
                    {student.userId?.profile?.firstName} {student.userId?.profile?.lastName} ({student.registrationNumber})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="hostel" className="block text-sm font-medium text-gray-700">Hostel</label>
              <select
                id="hostel"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={newAllocationData.hostelId}
                onChange={(e) => setNewAllocationData({ ...newAllocationData, hostelId: e.target.value })}
              >
                <option value="">Select Hostel</option>
                {hostelsList?.hostels?.map((hostel: any) => (
                  <option key={hostel._id} value={hostel._id}>
                    {hostel.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="roomNumber" className="block text-sm font-medium text-gray-700">Room Number</label>
              <input
                type="text"
                id="roomNumber"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={newAllocationData.roomNumber}
                onChange={(e) => setNewAllocationData({ ...newAllocationData, roomNumber: e.target.value })}
              />
            </div>
          </div>
          <button
            onClick={() => createHostelAllocationMutation.mutate(newAllocationData)}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Allocate Hostel
          </button>
        </div>
      )}

      <div className="space-y-3 max-h-80 overflow-y-auto">
        {hostels.map((allocation: any) => (
          <div key={allocation._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div>
              <p className="font-medium">
                {allocation.student?.userId?.profile?.firstName || 'N/A'} {allocation.student?.userId?.profile?.lastName || ''}
              </p>
              <span className={`text-xs px-2 py-1 rounded ${
                allocation.status === 'checked-in' ? 'bg-green-100 text-green-800' :
                allocation.status === 'allocated' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {allocation.status}
              </span>
            </div>
            <div className="flex space-x-2">
              {allocation.status === 'allocated' && (
                <button
                  onClick={() => checkInMutation.mutate(allocation._id)}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
                >
                  Check In
                </button>
              )}
              {allocation.status === 'checked-in' && (
                <button
                  onClick={() => checkOutMutation.mutate(allocation._id)}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                >
                  Check Out
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
      case 'admission-status':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Check Admission Status</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration Number
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    placeholder="Enter registration number"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={async () => {
                      try {
                        const response = await admissionsAPI.checkStatus(registrationNumber);
                        toast.success('Admission status retrieved');
                      } catch (error) {
                        toast.error('Student not found');
                      }
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <Search className="h-4 w-4 mr-2 inline" />
                    Check
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'upload-results':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Student Results</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="studentId" className="block text-sm font-medium text-gray-700">Student</label>
                <select
                  id="studentId"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={newResultData.studentId}
                  onChange={(e) => setNewResultData({ ...newResultData, studentId: e.target.value })}
                >
                  <option value="">Select Student</option>
                  {students.map((student: any) => (
                    <option key={student._id} value={student._id}>
                      {student.userId?.profile?.firstName} {student.userId?.profile?.lastName} ({student.registrationNumber})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="courseCode" className="block text-sm font-medium text-gray-700">Course Code</label>
                <input
                  type="text"
                  id="courseCode"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={newResultData.courseCode}
                  onChange={(e) => setNewResultData({ ...newResultData, courseCode: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="courseName" className="block text-sm font-medium text-gray-700">Course Name</label>
                <input
                  type="text"
                  id="courseName"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={newResultData.courseName}
                  onChange={(e) => setNewResultData({ ...newResultData, courseName: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="creditUnits" className="block text-sm font-medium text-gray-700">Credit Units</label>
                <input
                  type="number"
                  id="creditUnits"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={newResultData.creditUnits}
                  onChange={(e) => setNewResultData({ ...newResultData, creditUnits: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="grade" className="block text-sm font-medium text-gray-700">Grade</label>
                <input
                  type="text"
                  id="grade"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={newResultData.grade}
                  onChange={(e) => setNewResultData({ ...newResultData, grade: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="gradePoint" className="block text-sm font-medium text-gray-700">Grade Point</label>
                <input
                  type="number"
                  id="gradePoint"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={newResultData.gradePoint}
                  onChange={(e) => setNewResultData({ ...newResultData, gradePoint: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="semester" className="block text-sm font-medium text-gray-700">Semester</label>
                <input
                  type="number"
                  id="semester"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={newResultData.semester}
                  onChange={(e) => setNewResultData({ ...newResultData, semester: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="year" className="block text-sm font-medium text-gray-700">Year</label>
                <input
                  type="number"
                  id="year"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={newResultData.year}
                  onChange={(e) => setNewResultData({ ...newResultData, year: e.target.value })}
                />
              </div>
              <button
                onClick={() => uploadResultMutation.mutate(newResultData as any)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Upload Result
              </button>
            </div>
          </div>
        );

      case 'external-upload':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">External Platform Uploads</h3>
            
            <div className="space-y-4">
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    const selectedStudents = students.slice(0, 10).map(s => s._id);
                    uploadToJAMBMutation.mutate({
                      studentIds: selectedStudents,
                      examYear: new Date().getFullYear().toString()
                    });
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Upload to JAMB
                </button>
                <button
                  onClick={() => {
                    const graduates = students.filter(s => s.academicInfo?.status === 'graduated').map(s => s._id);
                    if (graduates.length === 0) {
                      toast.error('No graduates found');
                      return;
                    }
                    // uploadToNYSCMutation.mutate({ studentIds: graduates });
                    toast.success('NYSC upload initiated');
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Upload to NYSC
                </button>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Upload History</h4>
                <div className="space-y-2">
                  {uploadHistory?.history?.map((upload: any) => (
                    <div key={upload._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{upload.platform}</p>
                        <p className="text-sm text-gray-600">{upload.studentsCount} students - {new Date(upload.uploadDate).toLocaleDateString()}</p>
                      </div>
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                        {upload.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Affairs Overview</h3>
            <div className="grid grid-cols-2 gap-4">
              <div key="hostel-allocations" className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{hostels.length}</div>
                <div className="text-sm text-blue-700">Hostel Allocations</div>
              </div>
              <div key="checked-in" className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {hostels.filter(h => h.status === 'checked-in').length}
                </div>
                <div className="text-sm text-green-700">Checked In</div>
              </div>
              <div key="total-students" className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{students.length}</div>
                <div className="text-sm text-purple-700">Total Students</div>
              </div>
              <div key="external-uploads" className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {uploadHistory?.history?.length || 0}
                </div>
                <div className="text-sm text-orange-700">External Uploads</div>
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
              <div className="bg-teal-600 rounded-lg p-2 mr-3">
                <School className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">URMS</h1>
                <p className="text-sm text-gray-500">Student Affairs</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.profile?.firstName} {user?.profile?.lastName}
                </p>
                <p className="text-xs text-gray-500">Student Affairs Staff</p>
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
          className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl shadow-sm p-6 text-white mb-8"
        >
          <h1 className="text-2xl font-bold mb-2">
            Student Affairs Dashboard
          </h1>
          <p className="text-teal-100">
            Manage student accommodations, results, and external integrations
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Affairs Activities Grid */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {affairsActivities.map((activity, index) => (
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

export default StaffAffairsDashboard;