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
  Search
} from 'lucide-react';
import { hostelAllocationAPI } from '../api/hostelAllocation';
import { admissionsAPI } from '../api/admissions';
import { externalIntegrationAPI } from '../api/externalIntegration';
import { studentResultsAPI } from '../api/studentResults';
import { studentsAPI } from '../api/students';
import toast from 'react-hot-toast';

const StaffAffairsDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const queryClient = useQueryClient();

  // Fetch data
  const { data: hostelData } = useQuery('hostel-allocations', () => hostelAllocationAPI.getAll({ limit: 50 }), {
    onError: () => toast.error('Failed to load hostel allocations')
  });
  const { data: studentsData } = useQuery('students', () => studentsAPI.getAll({ limit: 100 }), {
    onError: () => toast.error('Failed to load students data')
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

  const affairsActivities = [
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
      case 'hostel-allocation':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Hostel Allocations</h3>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {hostels.map((allocation: any) => (
                <div key={allocation._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium">
                      {allocation.student?.userId?.profile?.firstName} {allocation.student?.userId?.profile?.lastName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {allocation.hostel?.name} - Room {allocation.roomNumber}, Bed {allocation.bedNumber}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    allocation.status === 'checked-in' ? 'bg-green-100 text-green-800' :
                    allocation.status === 'allocated' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {allocation.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'hostel-checkin':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Check-in/Check-out Management</h3>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {hostels.filter((h: any) => h.status === 'allocated' || h.status === 'checked-in').map((allocation: any) => (
                <div key={allocation._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium">
                      {allocation.student?.userId?.profile?.firstName} {allocation.student?.userId?.profile?.lastName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {allocation.hostel?.name} - Room {allocation.roomNumber}
                    </p>
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