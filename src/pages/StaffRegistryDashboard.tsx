import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  Plus, 
  Eye, 
  Download, 
  Edit, 
  FileText, 
  Users, 
  Award,
  Trash2,
  LogOut,
  School,
  Search,
  UserPlus
} from 'lucide-react';
import { studentsAPI } from '../api/students';
import { staffAPI } from '../api/staff';
import { usersAPI } from '../api/users';
import { reportsAPI } from '../api/reports';
import StudentForm from '../components/Forms/StudentForm';
import UserForm from '../components/Forms/UserForm';
import toast from 'react-hot-toast';

const StaffRegistryDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUserForm, setShowUserForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [reportType, setReportType] = useState('');
  const [reportTitle, setReportTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const queryClient = useQueryClient();

  // Fetch data
  const { data: studentsData, isLoading: studentsLoading } = useQuery('students', () => studentsAPI.getAll({ limit: 100 }));
  const { data: staffData, isLoading: staffLoading } = useQuery('staff', () => staffAPI.getAll({ limit: 100 }));
  const { data: usersData, isLoading: usersLoading } = useQuery('users', () => usersAPI.getAll({ limit: 100 }));
  const { data: reportsData, isLoading: reportsLoading } = useQuery('reports', () => reportsAPI.getAll({ limit: 20 }));

  const students = studentsData?.students || [];
  const staff = staffData?.staff || [];
  const users = usersData?.users || [];
  const reports = reportsData?.reports || [];

  // Mutations
  const deleteStudentMutation = useMutation(studentsAPI.delete, {
    onSuccess: () => {
      toast.success('Student record deleted successfully');
      queryClient.invalidateQueries('students');
    },
    onError: () => toast.error('Failed to delete student record')
  });

  const deleteStaffMutation = useMutation(staffAPI.delete, {
    onSuccess: () => {
      toast.success('Staff record deleted successfully');
      queryClient.invalidateQueries('staff');
    },
    onError: () => toast.error('Failed to delete staff record')
  });

  const promoteStaffMutation = useMutation(
    ({ id, data }: { id: string; data: any }) => staffAPI.promote(id, data),
    {
      onSuccess: () => {
        toast.success('Staff promoted successfully');
        queryClient.invalidateQueries('staff');
      },
      onError: () => toast.error('Failed to promote staff')
    }
  );

  const grantLeaveMutation = useMutation(
    ({ id, data }: { id: string; data: any }) => staffAPI.grantLeave(id, data),
    {
      onSuccess: () => {
        toast.success('Leave granted successfully');
        queryClient.invalidateQueries('staff');
      },
      onError: () => toast.error('Failed to grant leave')
    }
  );

  const generateReportMutation = useMutation(
    ({ type, data }: { type: string; data: any }) => {
      if (type === 'student-academic') {
        return reportsAPI.generateStudentReport(data);
      } else if (type === 'staff-administrative') {
        return reportsAPI.generateStaffReport(data);
      }
      return Promise.reject('Invalid report type');
    },
    {
      onSuccess: () => {
        toast.success('Report generated successfully');
        queryClient.invalidateQueries('reports');
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.message || 'Failed to generate report';
        toast.error(errorMessage);
      }
    }
  );

  const registryActivities = [
    {
      id: 'add-records',
      title: 'Add Records',
      description: 'Create new student and staff records',
      icon: Plus,
      color: 'bg-blue-500',
      action: () => setActiveSection('add-records')
    },
    {
      id: 'view-records',
      title: 'View Records',
      description: 'Browse and search existing records',
      icon: Eye,
      color: 'bg-green-500',
      action: () => setActiveSection('view-records')
    },
    {
      id: 'retrieve-records',
      title: 'Retrieve Records',
      description: 'Access and download specific records',
      icon: Download,
      color: 'bg-purple-500',
      action: () => setActiveSection('retrieve-records')
    },
    {
      id: 'update-records',
      title: 'Update Records (Staff and Students)',
      description: 'Modify existing staff and student information',
      icon: Edit,
      color: 'bg-orange-500',
      action: () => setActiveSection('update-records')
    },
    {
      id: 'nominal-roll',
      title: 'Create/Update Nominal Roll, Promotions, Leave Grants, Employment',
      description: 'Manage staff administrative processes',
      icon: Users,
      color: 'bg-indigo-500',
      action: () => setActiveSection('nominal-roll')
    },
    {
      id: 'write-reports',
      title: 'Write Reports',
      description: 'Generate administrative reports',
      icon: FileText,
      color: 'bg-teal-500',
      action: () => setActiveSection('write-reports')
    },
    {
      id: 'delete-records',
      title: 'Delete Records',
      description: 'Remove records from the system',
      icon: Trash2,
      color: 'bg-red-500',
      action: () => setActiveSection('delete-records')
    }
  ];

  const handlePromoteStaff = (staffId: string) => {
    const toRank = prompt('Enter new rank:');
    const reason = prompt('Enter promotion reason:');
    
    if (toRank && reason) {
      promoteStaffMutation.mutate({
        id: staffId,
        data: { toRank, reason }
      });
    }
  };

  const handleGrantLeave = (staffId: string) => {
    const type = prompt('Enter leave type (annual/sick/casual):');
    const days = prompt('Enter number of days:');
    const reason = prompt('Enter leave reason:');
    
    if (type && days && reason) {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + parseInt(days));
      
      grantLeaveMutation.mutate({
        id: staffId,
        data: {
          type,
          startDate,
          endDate,
          days: parseInt(days),
          reason,
          status: 'approved'
        }
      });
    }
  };

  const handleGenerateReport = () => {
    if (!reportType || !reportTitle || !startDate || !endDate) {
      toast.error('Please fill all report parameters');
      return;
    }

    const reportParameters = {
      title: reportTitle,
      parameters: {
        dateRange: {
          startDate,
          endDate
        }
      }
    };

    generateReportMutation.mutate({
      type: reportType,
      data: reportParameters
    });
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'add-records':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Records</h3>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setSelectedUser(null);
                  setIsAddingStudent(true);
                  setShowUserForm(true);
                }}
                className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add New Student
              </button>
              <button
                onClick={() => {
                  setSelectedUser(null);
                  setShowUserForm(true);
                }}
                className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add New User
              </button>
            </div>
          </div>
        );

      case 'view-records':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">View Records</h3>
            
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-6">
              {/* Students */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Students ({students.length})</h4>
                {studentsLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {students.filter((s: any) => 
                      s.userId?.profile?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      s.userId?.profile?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      s.registrationNumber?.toLowerCase().includes(searchTerm.toLowerCase())
                    ).map((student: any) => (
                      <div key={student._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{student.userId?.profile?.firstName} {student.userId?.profile?.lastName}</p>
                          <p className="text-sm text-gray-600">{student.registrationNumber} - {student.academicInfo?.department}</p>
                        </div>
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                          {student.academicInfo?.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Staff */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Staff ({staff.length})</h4>
                {staffLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {staff.filter((s: any) => 
                      s.userId?.profile?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      s.userId?.profile?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      s.staffId?.toLowerCase().includes(searchTerm.toLowerCase())
                    ).map((member: any) => (
                      <div key={member._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{member.userId?.profile?.firstName} {member.userId?.profile?.lastName}</p>
                          <p className="text-sm text-gray-600">{member.staffId} - {member.employmentInfo?.department}</p>
                        </div>
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                          {member.employmentInfo?.currentStatus}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'retrieve-records':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Retrieve Records</h3>
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 mb-2">Available Reports</h4>
              {reportsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {reports.length === 0 ? (
                    <p className="text-gray-500">No reports available.</p>
                  ) : (
                    reports.map((report: any) => (
                      <div key={report._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div>
                          <p className="font-medium">{report.title}</p>
                          <p className="text-sm text-gray-600">{report.type} - {new Date(report.createdAt).toLocaleDateString()}</p>
                        </div>
                        <button
                          onClick={() => window.open(report.fileUrl, '_blank')}
                          className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm hover:bg-purple-200"
                        >
                          <Download className="h-3 w-3 mr-1 inline" />
                          Download
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        );

      case 'update-records':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Records</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Students</h4>
                {studentsLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {students.map((student: any) => (
                      <div key={student._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{student.userId?.profile?.firstName} {student.userId?.profile?.lastName}</p>
                          <p className="text-sm text-gray-600">{student.registrationNumber}</p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedUser(student.userId);
                            setIsAddingStudent(true); // Indicate it's a student for UserForm
                            setShowUserForm(true);
                          }}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                        >
                          Edit
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Staff</h4>
                {staffLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {staff.map((member: any) => (
                      <div key={member._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{member.userId?.profile?.firstName} {member.userId?.profile?.lastName}</p>
                          <p className="text-sm text-gray-600">{member.staffId}</p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedUser(member.userId);
                            setShowUserForm(true);
                          }}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                        >
                          Edit
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'nominal-roll':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Staff Management</h3>
            
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Staff Actions</h4>
              {staffLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : (
                staff.map((member: any) => (
                  <div key={member._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium">{member.userId?.profile?.firstName} {member.userId?.profile?.lastName}</p>
                      <p className="text-sm text-gray-600">{member.employmentInfo?.position} - {member.employmentInfo?.rank}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handlePromoteStaff(member._id)}
                        className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm hover:bg-purple-200"
                      >
                        Promote
                      </button>
                      <button
                        onClick={() => handleGrantLeave(member._id)}
                        className="px-3 py-1 bg-orange-100 text-orange-700 rounded text-sm hover:bg-orange-200"
                      >
                        Grant Leave
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );

      case 'write-reports':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Reports</h3>
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 mb-2">Report Type</h4>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                onChange={(e) => setReportType(e.target.value)}
                value={reportType}
              >
                <option value="">Select Report Type</option>
                <option value="student-academic">Student Academic Report</option>
                <option value="staff-administrative">Staff Administrative Report</option>
              </select>

              {reportType && (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 mb-2">Report Parameters</h4>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Report Title</label>
                <input
                  type="text"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., Student Performance Q1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              {/* Add more specific parameters based on reportType if needed */}
              <button
                    onClick={handleGenerateReport}
                    disabled={generateReportMutation.isLoading}
                    className="w-full flex items-center justify-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    {generateReportMutation.isLoading ? 'Generating...' : 'Generate Report'}
                  </button>
                </div>
              )}

              <h3 className="text-lg font-semibold text-gray-900 mb-4">Generated Reports</h3>
            
            {reportsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {reports.map((report: any) => (
                  <div key={report._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium">{report.title}</p>
                      <p className="text-sm text-gray-600">{report.type} - {new Date(report.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                        {report.status}
                      </span>
                      <button className="text-blue-600 hover:text-blue-700">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            </div>
          </div>
        );

      case 'delete-records':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Records</h3>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800 text-sm">⚠️ Warning: Deleting records is permanent and cannot be undone.</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Students</h4>
                {students.slice(0, 5).map((student: any) => (
                  <div key={student._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg mb-2">
                    <div>
                      <p className="font-medium">{student.userId?.profile?.firstName} {student.userId?.profile?.lastName}</p>
                      <p className="text-sm text-gray-600">{student.registrationNumber}</p>
                    </div>
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this student record?')) {
                          deleteStudentMutation.mutate(student._id);
                        }
                      }}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Staff</h4>
                {staff.slice(0, 5).map((member: any) => (
                  <div key={member._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg mb-2">
                    <div>
                      <p className="font-medium">{member.userId?.profile?.firstName} {member.userId?.profile?.lastName}</p>
                      <p className="text-sm text-gray-600">{member.staffId}</p>
                    </div>
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this staff record?')) {
                          deleteStaffMutation.mutate(member._id);
                        }
                      }}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Registry Overview</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{students.length}</div>
                <div className="text-sm text-blue-700">Total Students</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{staff.length}</div>
                <div className="text-sm text-green-700">Total Staff</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{users.length}</div>
                <div className="text-sm text-purple-700">Total Users</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{reports.length}</div>
                <div className="text-sm text-orange-700">Reports Generated</div>
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
              <div className="bg-blue-600 rounded-lg p-2 mr-3">
                <School className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">URMS</h1>
                <p className="text-sm text-gray-500">Administrative Registry</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.profile?.firstName} {user?.profile?.lastName}
                </p>
                <p className="text-xs text-gray-500">Registry Staff</p>
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
          className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-sm p-6 text-white mb-8"
        >
          <h1 className="text-2xl font-bold mb-2">
            Administrative Registry Dashboard
          </h1>
          <p className="text-blue-100">
            Manage student and staff records, promotions, and administrative processes
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Registry Activities Grid */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {registryActivities.map((activity, index) => (
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

      {/* Forms */}
      {showUserForm && (
        <UserForm
          user={selectedUser}
          isAddingStudent={isAddingStudent} // Pass this prop to UserForm
          onClose={() => {
            setShowUserForm(false);
            setSelectedUser(null);
            setIsAddingStudent(false);
          }}
        />
      )}
    </div>
  );
};

export default StaffRegistryDashboard;