import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from 'react-query';
import { studentResultsAPI } from '../../api/studentResults';
import toast from 'react-hot-toast';
import { Upload } from 'lucide-react';

import { courseRegistrationAPI } from '../../api/courseRegistration';

const UploadResultsForm = ({ students }) => {
  const [formData, setFormData] = useState({
    studentId: '',
    courseCode: '',
    courseName: '',
    creditUnits: 3,
    grade: 'A',
    gradePoint: 5.0, // Default for 'A'
    semester: 1,
    year: new Date().getFullYear(),
  });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const queryClient = useQueryClient();

  const { data: registeredCoursesData, isLoading: isLoadingRegisteredCourses } = useQuery(
    ['registeredCourses', selectedStudent?._id],
    () => courseRegistrationAPI.fetchRegisteredCourses(selectedStudent?._id || ''),
    { enabled: !!selectedStudent?._id }
  );

  useEffect(() => {
    if (registeredCoursesData?.registeredCourses) {
      setFilteredCourses(registeredCoursesData.registeredCourses);
    } else {
      setFilteredCourses([]);
    }
  }, [registeredCoursesData]);

  const getGradePoint = (grade: string) => {
    switch (grade.toUpperCase()) {
      case 'A': return 5.0;
      case 'B': return 4.0;
      case 'C': return 3.0;
      case 'D': return 2.0;
      case 'E': return 1.0;
      case 'F': return 0.0;
      default: return 0.0;
    }
  };

  const uploadMutation = useMutation(studentResultsAPI.upload, {
    onSuccess: () => {
      toast.success('Results uploaded successfully');
      queryClient.invalidateQueries('student-results');
      setFormData({
        studentId: '',
        courseCode: '',
        courseName: '',
        creditUnits: 3,
        grade: 'A',
        semester: 1,
        year: new Date().getFullYear(),
      });
      setSelectedStudent(null);
    },
    onError: () => {
      toast.error('Failed to upload results');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    uploadMutation.mutate(formData);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Results</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Student</label>
          <select
            onChange={(e) => {
              const student = students.find(s => s._id === e.target.value);
              setSelectedStudent(student);
              setFormData({ ...formData, studentId: e.target.value });
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select a student</option>
            {students.map(student => (
              <option key={student._id} value={student._id}>
                {student.userId.profile.firstName} {student.userId.profile.lastName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Course</label>
          <select
            onChange={(e) => {
              const course = filteredCourses.find(c => c.code === e.target.value);
              if (course) {
                setFormData({ ...formData, courseCode: course.code, courseName: course.title, creditUnits: course.creditUnits });
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={!selectedStudent}
          >
            <option value="">Select a course</option>
            {filteredCourses.map(course => (
              <option key={course._id} value={course.code}>
                {course.title}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
            <select
              value={formData.grade}
              onChange={(e) => {
                const newGrade = e.target.value;
                setFormData({ ...formData, grade: newGrade, gradePoint: getGradePoint(newGrade) });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
              <option value="F">F</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
            <input
              type="number"
              value={formData.semester}
              onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <input
              type="number"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={uploadMutation.isLoading}
          className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploadMutation.isLoading ? 'Uploading...' : 'Upload Results'}
        </button>
      </form>
    </div>
  );
};

export default UploadResultsForm;
