import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { studentsAPI } from '../../api/students';
import StudentForm from '../../components/Forms/StudentForm';

const Students: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const { data, isLoading, error } = useQuery('students', studentsAPI.getAll);

  const handleAdd = () => {
    setSelectedStudent(null);
    setIsFormOpen(true);
  };

  const handleEdit = (student: any) => {
    setSelectedStudent(student);
    setIsFormOpen(true);
  };

  import { useMutation, useQueryClient } from 'react-query';
import { studentsAPI } from '../../api/students';
import toast from 'react-hot-toast';

const Students: React.FC = () => {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const { data, isLoading, error } = useQuery('students', studentsAPI.getAll);

  const deleteMutation = useMutation(studentsAPI.delete, {
    onSuccess: () => {
      toast.success('Student deleted successfully');
      queryClient.invalidateQueries('students');
    },
    onError: () => toast.error('Failed to delete student')
  });

  const handleAdd = () => {
    setSelectedStudent(null);
    setIsFormOpen(true);
  };

  const handleEdit = (student: any) => {
    setSelectedStudent(student);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Student Records</h1>
        <button onClick={handleAdd} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Add New Student
        </button>
      </div>

      {isLoading && <p>Loading...</p>}
      {error && <p>Error fetching student data</p>}

      {data && (
        <div className="bg-white shadow-md rounded-lg p-4">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left">Name</th>
                <th className="text-left">Email</th>
                <th className="text-left">Major</th>
                <th className="text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.students.map((student: any) => (
                <tr key={student._id}>
                  <td>{student.firstName} {student.lastName}</td>
                  <td>{student.email}</td>
                  <td>{student.major}</td>
                  <td>
                    <button onClick={() => handleEdit(student)} className="text-blue-600 hover:underline mr-2">Edit</button>
                    <button onClick={() => handleDelete(student._id)} className="text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isFormOpen && (
        <StudentForm
          onClose={() => setIsFormOpen(false)}
          student={selectedStudent}
        />
      )}
    </div>
  );
};

export default Students;