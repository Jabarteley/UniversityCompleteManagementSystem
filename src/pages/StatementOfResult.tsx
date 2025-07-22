import React from 'react';
import { useQuery } from 'react-query';
import { useAuth } from '../hooks/useAuth';
import { statementOfResultAPI } from '../api/statementOfResult';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { Download } from 'lucide-react';

interface CourseResult {
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

interface AcademicInfo {
  major?: string;
  department?: string;
  faculty?: string;
  level?: string;
  entryYear?: number;
  currentSemester?: string;
  status?: string;
  program?: string;
  yearOfAdmission?: number;
}

interface StatementData {
  success: boolean;
  message: string;
  studentName: string;
  registrationNumber: string;
  academicInfo: AcademicInfo;
  results: SemesterResult[];
}

const StatementOfResult: React.FC = () => {
  const { user } = useAuth();

  const { data, isLoading, isError, error } = useQuery<StatementData>(
    ['statementOfResult', user?.id],
    () => statementOfResultAPI.downloadStatement(user?.id || ''),
    { enabled: !!user?.id }
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return <div className="text-red-500 text-center">Error loading statement of result: {(error as any).message}</div>;
  }

  const statement = data;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center mb-6">
          <div className="bg-red-500 rounded-lg p-3 mr-4">
            <Download className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Statement of Result</h1>
        </div>

        {statement ? (
          <div className="space-y-6">
            <div className="border-b pb-4 mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Student Information</h2>
              <p><strong>Name:</strong> {statement.studentName}</p>
              <p><strong>Registration Number:</strong> {statement.registrationNumber}</p>
              <p><strong>Department:</strong> {statement.academicInfo?.department || 'N/A'}</p>
              <p><strong>Faculty:</strong> {statement.academicInfo?.faculty || 'N/A'}</p>
              <p><strong>Program:</strong> {statement.academicInfo?.program || 'N/A'}</p>
              <p><strong>Level:</strong> {statement.academicInfo?.level || 'N/A'}</p>
              <p><strong>Entry Year:</strong> {statement.academicInfo?.entryYear || 'N/A'}</p>
            </div>

            <h2 className="text-xl font-semibold text-gray-800">Academic Results</h2>
            {statement.results && statement.results.length > 0 ? (
              statement.results.map((semesterResult, index) => (
                <div key={index} className="border p-4 rounded-lg shadow-sm mb-4">
                  <h3 className="text-lg font-semibold mb-2">Semester {semesterResult.semester}, {semesterResult.year}</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left">Course Code</th>
                          <th className="px-3 py-2 text-left">Course Name</th>
                          <th className="px-3 py-2 text-left">Credit Units</th>
                          <th className="px-3 py-2 text-left">Grade</th>
                          <th className="px-3 py-2 text-left">Grade Point</th>
                        </tr>
                      </thead>
                      <tbody>
                        {semesterResult.courses.map((course, courseIndex) => (
                          <tr key={courseIndex} className="border-t">
                            <td className="px-3 py-2">{course.courseCode}</td>
                            <td className="px-3 py-2">{course.courseName}</td>
                            <td className="px-3 py-2">{course.creditUnits}</td>
                            <td className="px-3 py-2">{course.grade}</td>
                            <td className="px-3 py-2">{course.gradePoint?.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-3 text-right">
                    <p><strong>GPA:</strong> {semesterResult.gpa?.toFixed(2)}</p>
                    <p><strong>CGPA:</strong> {semesterResult.cgpa?.toFixed(2)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">No academic results found.</p>
            )}
          </div>
        ) : (
          <p className="text-center text-gray-500">No statement of result available.</p>
        )}
      </div>
    </div>
  );
};

export default StatementOfResult;