
import React from 'react';
import { useForm } from 'react-hook-form';

import { useMutation, useQuery, useQueryClient } from 'react-query';
import { courseAllocationAPI } from '../../api/courseAllocation';
import { staffAPI } from '../../api/staff';
import toast from 'react-hot-toast';

interface CourseAllocationFormProps {
  onClose: () => void;
  allocation?: any;
}

const CourseAllocationForm: React.FC<CourseAllocationFormProps> = ({ onClose, allocation }) => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: allocation ? {
      staff: allocation.staff._id,
      course: allocation.course,
      academicYear: allocation.academicYear,
    } : {}
  });

  const { data: staffData } = useQuery('staff', staffAPI.getAll);

  const createMutation = useMutation(courseAllocationAPI.create, {
    onSuccess: () => {
      toast.success('Course allocation created successfully');
      queryClient.invalidateQueries('courseAllocations');
      onClose();
    },
    onError: () => toast.error('Failed to create course allocation')
  });

  const updateMutation = useMutation(
    (data: any) => courseAllocationAPI.update(allocation.id, data),
    {
      onSuccess: () => {
        toast.success('Course allocation updated successfully');
        queryClient.invalidateQueries('courseAllocations');
        onClose();
      },
      onError: () => toast.error('Failed to update course allocation')
    }
  );

  const onSubmit = (data: any) => {
    if (allocation) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{allocation ? 'Update Course Allocation' : 'New Course Allocation'}</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Staff</label>
            <select {...register('staff', { required: 'Staff is required' })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              {/* Populate with staff data */}
            </select>
            {errors.staff && <p className="text-red-500 text-sm mt-1">{errors.staff.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
            <input {...register('course', { required: 'Course is required' })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            {errors.course && <p className="text-red-500 text-sm mt-1">{errors.course.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
            <input {...register('academicYear', { required: 'Academic year is required' })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            {errors.academicYear && <p className="text-red-500 text-sm mt-1">{errors.academicYear.message}</p>}
          </div>
          <div className="flex space-x-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              {allocation ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseAllocationForm;
