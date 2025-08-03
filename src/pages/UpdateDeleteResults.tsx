import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { studentResultsAPI } from '../api/studentResults';
import toast from 'react-hot-toast';
import { Edit, Trash2 } from 'lucide-react';
import LoadingSpinner from '../components/UI/LoadingSpinner';

interface CourseResult {
  _id: string;
  courseCode: string;
  courseName: string;
  creditUnits: number;
  grade: string;
  gradePoint: number;
}

interface SemesterResult {
  semester: number;
  year: number;
  courses: CourseResult[];
  gpa: number;
  cgpa: number;
}

interface StudentResultsData {
  success: boolean;
  student: {
    _id: string;
    registrationNumber: string;
    results: SemesterResult[];
  };
}

interface UpdateDeleteResultsProps {
  studentId: string;
}

const UpdateDeleteResults: React.FC<UpdateDeleteResultsProps> = ({ studentId }) => {
  const queryClient = useQueryClient();
  const [editingResult, setEditingResult] = useState<CourseResult | null>(null);
  const [editForm, setEditForm] = useState({
    grade: '',
    gradePoint: 0,
  });

  const { data, isLoading, isError, error } = useQuery<StudentResultsData>(
    ['studentResults', studentId],
    () => studentResultsAPI.getById(studentId),
    { enabled: !!studentId }
  );

  const updateResultMutation = useMutation(
    (data: { studentId: string; resultId: string; updatedResult: Partial<CourseResult> }) =>
      studentResultsAPI.update(data.studentId, data.resultId, data.updatedResult),
    {
      onSuccess: () => {
        toast.success('Result updated successfully!');
        queryClient.invalidateQueries(['studentResults', studentId]);
        setEditingResult(null);
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || 'Failed to update result.');
      },
    }
  );

  const deleteResultMutation = useMutation(
    (data: { studentId: string; resultId: string }) =>
      studentResultsAPI.delete(data.studentId, data.resultId),
    {
      onSuccess: () => {
        toast.success('Result deleted successfully!');
        queryClient.invalidateQueries(['studentResults', studentId]);
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || 'Failed to delete result.');
      },
    }
  );

  const handleEditClick = (result: CourseResult) => {
    setEditingResult(result);
    setEditForm({ grade: result.grade, gradePoint: result.gradePoint });
  };

  const handleUpdateSubmit = (courseResultId: string) => {
    if (!editingResult) return;
    updateResultMutation.mutate({
      studentId,
      resultId: courseResultId,
      updatedResult: { ...editingResult, ...editForm },
    });
  };

  const handleDeleteClick = (semesterResultId: string, courseResultId: string) => {
    deleteResultMutation.mutate({ studentId, resultId: courseResultId });
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return <div className="text-red-500">Error: {error?.message}</div>;
  }

  const studentResults = data?.student?.results || [];

  return (
    <div className="space-y-4">
      {studentResults.length === 0 ? (
        <p className="text-gray-500">No results found for this student.</p>
      ) : (
        studentResults.map((semesterResult) => (
          <div key={semesterResult.semester + semesterResult.year} className="border p-4 rounded-lg shadow-sm">
            <h4 className="font-semibold mb-2">Semester {semesterResult.semester}, {semesterResult.year}</h4>
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-left">Course Code</th>
                  <th className="px-3 py-2 text-left">Course Name</th>
                  <th className="px-3 py-2 text-left">Grade</th>
                  <th className="px-3 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {semesterResult.courses.map((courseResult) => (
                  <tr key={courseResult._id} className="border-t">
                    <td className="px-3 py-2">{courseResult.courseCode}</td>
                    <td className="px-3 py-2">{courseResult.courseName}</td>
                    <td className="px-3 py-2">
                      {editingResult?._id === courseResult._id ? (
                        <input
                          type="text"
                          value={editForm.grade}
                          onChange={(e) => setEditForm({ ...editForm, grade: e.target.value })}
                          className="w-20 px-2 py-1 border rounded"
                        />
                      ) : (
                        courseResult.grade
                      )}
                    </td>
                    <td className="px-3 py-2 flex space-x-2">
                      {editingResult?._id === courseResult._id ? (
                        <button
                          onClick={() => handleUpdateSubmit(courseResult._id)}
                          className="px-3 py-1 bg-green-500 text-white rounded text-xs"
                        >
                          Save
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEditClick(courseResult)}
                          className="px-3 py-1 bg-blue-500 text-white rounded text-xs"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteClick(semesterResult._id, courseResult._id)} // Pass correct IDs
                        className="px-3 py-1 bg-red-500 text-white rounded text-xs"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
};

export default UpdateDeleteResults;