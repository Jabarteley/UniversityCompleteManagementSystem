import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { hostelAllocationAPI } from '../../api/hostelAllocation';
import HostelAllocationForm from '../../components/Forms/HostelAllocationForm';

const HostelAllocations: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState(null);

  const { data, isLoading, error } = useQuery('hostelAllocations', hostelAllocationAPI.getAll);

  const handleAdd = () => {
    setSelectedAllocation(null);
    setIsFormOpen(true);
  };

  const handleEdit = (allocation: any) => {
    setSelectedAllocation(allocation);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    // Add your delete logic here
    console.log('Delete allocation with id:', id);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Hostel Allocations</h1>
        <button onClick={handleAdd} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          New Allocation
        </button>
      </div>

      {isLoading && <p>Loading...</p>}
      {error && <p>Error fetching hostel allocation data</p>}

      {data && (
        <div className="bg-white shadow-md rounded-lg p-4">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left">Student</th>
                <th className="text-left">Hostel</th>
                <th className="text-left">Room Number</th>
                <th className="text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.allocations.map((allocation: any) => (
                <tr key={allocation._id}>
                  <td>{allocation.student.firstName} {allocation.student.lastName}</td>
                  <td>{allocation.hostel.name}</td>
                  <td>{allocation.roomNumber}</td>
                  <td>
                    <button onClick={() => handleEdit(allocation)} className="text-blue-600 hover:underline mr-2">Edit</button>
                    <button onClick={() => handleDelete(allocation._id)} className="text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isFormOpen && (
        <HostelAllocationForm
          onClose={() => setIsFormOpen(false)}
          allocation={selectedAllocation}
        />
      )}
    </div>
  );
};

export default HostelAllocations;