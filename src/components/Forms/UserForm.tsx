import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';
import { usersAPI } from '../../api/users';
import { staffAPI } from '../../api/staff';
import { studentsAPI } from '../../api/students';
import toast from 'react-hot-toast';

interface UserFormProps {
  onClose: () => void;
  user?: any;
  isAddingStudent?: boolean; // New prop to indicate adding a student
}

interface UserFormData {
  username: string;
  email: string;
  password?: string; // Make optional for updates
  role: string;
  firstName: string;
  lastName: string;
  phone?: string;
  // Student-specific fields
  major?: string;
  department?: string;
  faculty?: string;
  level?: number;
  entryYear?: number;
  currentSemester?: string;
  status?: string;
  program?: string;
  yearOfAdmission?: number;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

const UserForm: React.FC<UserFormProps> = ({ onClose, user, isAddingStudent }) => {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<UserFormData>({
    defaultValues: user ? {
      username: user.username,
      email: user.email,
      role: user.role,
      firstName: user.profile?.firstName,
      lastName: user.profile?.lastName,
      phone: user.profile?.phone,
      // Populate student-specific fields if user is a student
      major: user.recordRef?.academicInfo?.major,
      department: user.recordRef?.academicInfo?.department,
      faculty: user.recordRef?.academicInfo?.faculty,
      level: user.recordRef?.academicInfo?.level,
      entryYear: user.recordRef?.academicInfo?.entryYear,
      currentSemester: user.recordRef?.academicInfo?.currentSemester,
      status: user.recordRef?.academicInfo?.status,
      program: user.recordRef?.academicInfo?.program,
      yearOfAdmission: user.recordRef?.academicInfo?.yearOfAdmission,
      address: user.recordRef?.contactInfo?.address,
      city: user.recordRef?.contactInfo?.city,
      state: user.recordRef?.contactInfo?.state,
      zipCode: user.recordRef?.contactInfo?.zipCode,
      country: user.recordRef?.contactInfo?.country,
    } : isAddingStudent ? { role: 'student' } : {}
  });

  const selectedRole = watch('role');

  const createMutation = useMutation(usersAPI.create, {
    onSuccess: () => {
      toast.success('User created successfully');
      queryClient.invalidateQueries('users');
      // onClose(); // Removed, will be called after all operations
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Failed to create user';
      toast.error(errorMessage);
    }
  });

  const createStaffMutation = useMutation(staffAPI.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('staff');
    },
    onError: () => toast.error('Failed to create staff record')
  });

  

  const updateMutation = useMutation(
    ({ id, data }: { id: string; data: any }) => usersAPI.update(id, data),
    {
      onSuccess: () => {
        toast.success('User updated successfully');
        queryClient.invalidateQueries('users');
        // onClose(); // Removed, will be called after all operations
      },
      onError: (error: any) => toast.error(error.response?.data?.message || 'Failed to update user'),
    }
  );

  const onSubmit = async (data: UserFormData) => {
    const userData: any = {
      username: data.username,
      email: data.email,
      ...(data.password && { password: data.password }),
      role: data.role,
      profile: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone
      }
    };

    if (data.role === 'student') {
      userData.academicInfo = {
        major: data.major,
        department: data.department,
        faculty: data.faculty,
        level: data.level,
        entryYear: data.entryYear,
        currentSemester: data.currentSemester,
        status: data.status,
        program: data.program,
        yearOfAdmission: data.yearOfAdmission,
      };
      userData.contactInfo = {
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        country: data.country,
      };
    }

    if (user) {
      try {
        await updateMutation.mutateAsync({ id: user._id, data: userData });
        onClose(); // Close only on successful update
      } catch (error) {
        // Error handled by updateMutation's onError
      }
    } else {
      try {
        const newUser = await createMutation.mutateAsync(userData);

        if (newUser.user) {
          if (data.role.includes('staff')) {
            await createStaffMutation.mutateAsync({ userId: newUser.user.id });
          } 
          // Student record is now handled by the backend's user creation route
          // No need to call createStudentMutation here
        }
        onClose(); // Close only on successful creation of user and associated record
      } catch (error) {
        // Errors are handled by individual mutation's onError callbacks.
        // No need to re-throw or handle here, as toast messages are already shown.
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl overflow-y-auto max-h-[90vh]">
        <h2 className="text-xl font-bold mb-4">
          {user ? 'Update User' : 'Add New User'}
        </h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              {...register('username', { required: 'Username is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              {...register('email', { required: 'Email is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          {!user && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                {...register('password', { required: 'Password is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              {...register('role', { required: 'Role is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Role</option>
              <option value="admin">Admin (Registrar)</option>
              <option value="staff-registry">Staff (Administrative Registry)</option>
              <option value="staff-affairs">Staff (Student Affairs)</option>
              <option value="academic-staff">Academic Staff (Lecturer)</option>
              <option value="head-department">Head Department</option>
              <option value="student">Student</option>
            </select>
            {errors.role && (
              <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                {...register('firstName', { required: 'First name is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.firstName && (
                <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                {...register('lastName', { required: 'Last name is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.lastName && (
                <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              {...register('phone')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {selectedRole === 'student' && (
            <>
              <h3 className="text-lg font-semibold mt-6 mb-2">Academic Information</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Major</label>
                <input {...register('major')} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input {...register('department')} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Faculty</label>
                <input {...register('faculty')} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                <input type="number" {...register('level', { valueAsNumber: true })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Entry Year</label>
                <input type="number" {...register('entryYear', { valueAsNumber: true })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Semester</label>
                <input {...register('currentSemester')} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <input {...register('status')} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
                <input {...register('program')} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year of Admission</label>
                <input type="number" {...register('yearOfAdmission', { valueAsNumber: true })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <h3 className="text-lg font-semibold mt-6 mb-2">Contact Information</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input {...register('address')} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input {...register('city')} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input {...register('state')} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                <input {...register('zipCode')} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input {...register('country')} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isLoading || updateMutation.isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {createMutation.isLoading || updateMutation.isLoading
                ? 'Saving...'
                : user ? 'Update' : 'Create'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;