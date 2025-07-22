
import React from 'react';
import { useForm } from 'react-hook-form';

import { useMutation, useQuery, useQueryClient } from 'react-query';
import { hostelAllocationAPI } from '../../api/hostelAllocation';
import { studentsAPI } from '../../api/students';
import { hostelAPI } from '../../api/hostel';
import toast from 'react-hot-toast';

interface HostelAllocationFormProps {
  onClose: () => void;
  allocation?: any;
}

const HostelAllocationForm: React.FC<HostelAllocationFormProps> = ({ onClose, allocation }) => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: allocation ? {
      student: allocation.student._id,
      hostel: allocation.hostel._id,
      roomNumber: allocation.roomNumber,
    } : {}
  });

  const { data: studentsData } = useQuery('students', studentsAPI.getAll);
  const { data: hostelsData } = useQuery('hostels', hostelAPI.getAll);

  const createMutation = useMutation(hostelAllocationAPI.create, {
    onSuccess: () => {
      toast.success('Allocation created successfully');
      queryClient.invalidateQueries('hostelAllocations');
      onClose();
    },
    onError: () => toast.error('Failed to create allocation')
  });

  const updateMutation = useMutation(
    (data: any) => hostelAllocationAPI.update(allocation.id, data),
    {
      onSuccess: () => {
        toast.success('Allocation updated successfully');
        queryClient.invalidateQueries('hostelAllocations');
        onClose();
      },
      onError: () => toast.error('Failed to update allocation')
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
        <h2 className="text-xl font-bold mb-4">{allocation ? 'Update Allocation' : 'New Allocation'}</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
            <select {...register('student', { required: 'Student is required' })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              {/* Populate with student data */}
            </select>
            {errors.student && <p className="text-red-500 text-sm mt-1">{errors.student.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hostel</label>
            <select {...register('hostel', { required: 'Hostel is required' })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              {/* Populate with hostel data */}
            </select>
            {errors.hostel && <p className="text-red-500 text-sm mt-1">{errors.hostel.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
            <input {...register('roomNumber', { required: 'Room number is required' })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            {errors.roomNumber && <p className="text-red-500 text-sm mt-1">{errors.roomNumber.message}</p>}
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

export default HostelAllocationForm;
