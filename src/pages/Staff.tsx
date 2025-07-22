import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { staffAPI } from '../../api/staff';
import StaffForm from '../../components/Forms/StaffForm';

const Staff: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

  const { data, isLoading, error } = useQuery('staff', staffAPI.getAll);

  const handleAdd = () => {
    setSelectedStaff(null);
    setIsFormOpen(true);
  };

  const handleEdit = (staff: any) => {
    setSelectedStaff(staff);
    setIsFormOpen(true);
  };

  import { useMutation, useQueryClient } from 'react-query';
import { staffAPI } from '../../api/staff';
import toast from 'react-hot-toast';

const Staff: React.FC = () => {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

  const { data, isLoading, error } = useQuery('staff', staffAPI.getAll);

  const deleteMutation = useMutation(staffAPI.delete, {
    onSuccess: () => {
      toast.success('Staff deleted successfully');
      queryClient.invalidateQueries('staff');
    },
    onError: () => toast.error('Failed to delete staff')
  });

  const handleAdd = () => {
    setSelectedStaff(null);
    setIsFormOpen(true);
  };

  const handleEdit = (staff: any) => {
    setSelectedStaff(staff);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Staff Records</h1>
        <button onClick={handleAdd} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Add New Staff
        </button>
      </div>

      {isLoading && <p>Loading...</p>}
      {error && <p>Error fetching staff data</p>}

      {data && (
        <div className="bg-white shadow-md rounded-lg p-4">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left">Name</th>
                <th className="text-left">Email</th>
                <th className="text-left">Department</th>
                <th className="text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.staff.map((staff: any) => (
                <tr key={staff._id}>
                  <td>{staff.firstName} {staff.lastName}</td>
                  <td>{staff.email}</td>
                  <td>{staff.department}</td>
                  <td>
                    <button onClick={() => handleEdit(staff)} className="text-blue-600 hover:underline mr-2">Edit</button>
                    <button onClick={() => handleDelete(staff._id)} className="text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isFormOpen && (
        <StaffForm
          onClose={() => setIsFormOpen(false)}
          staff={selectedStaff}
        />
      )}
    </div>
  );
};

export default Staff;