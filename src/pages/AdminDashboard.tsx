import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { UserPlus, Users, Edit, LogOut, School, Trash2 } from 'lucide-react';
import { usersAPI } from '../api/users';
import UserForm from '../components/Forms/UserForm';
import toast from 'react-hot-toast';

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');
  const [showUserForm, setShowUserForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const queryClient = useQueryClient();

  // Fetch users
  const { data: usersData, isLoading } = useQuery('users', () => usersAPI.getAll({ limit: 100 }));
  const users = usersData?.users || [];

  // Delete user mutation
  const deleteUserMutation = useMutation(usersAPI.delete, {
    onSuccess: () => {
      toast.success('User deleted successfully');
      queryClient.invalidateQueries('users');
    },
    onError: () => toast.error('Failed to delete user')
  });

  const adminActivities = [
    {
      id: 'add-user',
      title: 'Add New User',
      description: 'Create new user accounts for the system',
      icon: UserPlus,
      color: 'bg-blue-500',
      action: () => {
        setSelectedUser(null);
        setShowUserForm(true);
      }
    },
    {
      id: 'manage-users',
      title: 'Update/Delete Users',
      description: 'Manage existing user accounts',
      icon: Edit,
      color: 'bg-green-500',
      action: () => setActiveSection('manage-users')
    }
  ];

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setShowUserForm(true);
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUserMutation.mutate(userId);
    }
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'manage-users':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Manage Users</h3>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading users...</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {users.map((user: any) => (
                  <div key={user._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium">
                        {user.profile?.firstName} {user.profile?.lastName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {user.email} - {user.role.replace('-', ' ')}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                      >
                        <Edit className="h-3 w-3 mr-1 inline" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                      >
                        <Trash2 className="h-3 w-3 mr-1 inline" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Overview</h3>
            <div className="grid grid-cols-2 gap-4">
              <div key="total-users" className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{users.length}</div>
                <div className="text-sm text-blue-700">Total Users</div>
              </div>
              <div key="students" className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {users.filter((u: any) => u.role === 'student').length}
                </div>
                <div className="text-sm text-green-700">Students</div>
              </div>
              <div key="staff" className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {users.filter((u: any) => u.role.includes('staff')).length}
                </div>
                <div className="text-sm text-purple-700">Staff Members</div>
              </div>
              <div key="academic-staff" className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {users.filter((u: any) => u.role === 'academic-staff').length}
                </div>
                <div className="text-sm text-orange-700">Academic Staff</div>
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
              <div className="bg-purple-600 rounded-lg p-2 mr-3">
                <School className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">URMS</h1>
                <p className="text-sm text-gray-500">Admin Portal (Registrar)</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.profile?.firstName} {user?.profile?.lastName}
                </p>
                <p className="text-xs text-gray-500">Registrar</p>
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
          className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-sm p-6 text-white mb-8"
        >
          <h1 className="text-2xl font-bold mb-2">
            Admin Dashboard - Registrar
          </h1>
          <p className="text-purple-100">
            Manage user accounts and system administration
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Admin Activities Grid */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {adminActivities.map((activity, index) => (
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

      {/* User Form Modal */}
      {showUserForm && (
        <UserForm
          user={selectedUser}
          onClose={() => {
            setShowUserForm(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminDashboard;