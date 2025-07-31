import React, { createContext, useContext, useEffect, useState } from 'react';
import { authAPI } from '../api/auth';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'student' | 'staff-registry' | 'staff-affairs' | 'academic-staff' | 'head-department' | 'admin';
  profile: {
    firstName: string;
    lastName: string;
    avatar?: string;
    phone?: string;
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
  };
  registrationNumber?: string;
  studentId?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await authAPI.getMe();
          if (userData.success && userData.user) {
            console.log('User data from getMe:', userData.user);
            setUser(userData.user);
          } else {
            localStorage.removeItem('token');
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authAPI.login(email, password);
    if (response.success && response.token && response.user) {
      localStorage.setItem('token', response.token);
      console.log('User data from login:', response.user);
      setUser(response.user);
    } else {
      throw new Error('Login failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext };