import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';
import { studentProfileAPI } from '../../api/studentProfile';
import { usersAPI } from '../../api/users';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

interface StudentFormProps {
  onClose: () => void;
  student?: any;
}

const StudentForm: React.FC<StudentFormProps> = ({ onClose, student }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: student ? {
      firstName: student.firstName,
      lastName: student.lastName,
      email: user?.email,
      phone: student.phone,
      major: student.major,
      department: student.department,
      faculty: student.faculty,
      level: student.level,
      entryYear: student.entryYear,
      currentSemester: student.currentSemester,
      status: student.status,
      program: student.program,
      yearOfAdmission: student.yearOfAdmission,
      address: student.address,
      city: student.city,
      state: student.state,
      zipCode: student.zipCode,
    } : {}
  });

  const createUserMutation = useMutation(usersAPI.create, {
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Failed to create user';
      toast.error(errorMessage);
    }
  });

  const updateMutation = useMutation(
    (data: any) => studentProfileAPI.updateProfile(user?._id as string, data),
    {
      onSuccess: () => {
        toast.success('Student updated successfully');
        queryClient.invalidateQueries(['studentProfile', user?._id]);
        onClose();
      },
      onError: () => toast.error('Failed to update student')
    }
  );

  const onSubmit = async (data: any) => {
    if (student) {
      updateMutation.mutate(data);
    } else {
      await createStudentMutation.mutateAsync({
          userId: newUser.user.id,
          academicInfo: {
            major: data.major,
            department: data.department,
            faculty: data.faculty,
            level: data.level,
            entryYear: data.entryYear,
            currentSemester: data.currentSemester,
            status: data.status,
            program: data.program,
            yearOfAdmission: data.yearOfAdmission,
          }
        });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{student ? 'Update Student' : 'Add New Student'}</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input {...register('firstName', { required: 'First name is required' })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input {...register('lastName', { required: 'Last name is required' })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" {...register('email', { required: 'Email is required' })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input {...register('phone')} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          
          {/* Academic Info */}
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

          {/* Contact Info */}
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

          <div className="flex space-x-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              {student ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentForm;