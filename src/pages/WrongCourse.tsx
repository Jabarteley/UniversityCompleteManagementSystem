import React from 'react';
import { useQuery } from 'react-query';
import { useAuth } from '../hooks/useAuth';
import { wrongCourseAPI } from '../api/wrongCourse';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { AlertTriangle } from 'lucide-react';

interface Course {
  _id: string;
  code: string;
  title: string;
  creditUnits: number;
  semester: 'first' | 'second' | 'summer';
  level: number;
  department: string;
  faculty: string;
  isCompulsory: boolean;
}

const WrongCourse: React.FC = () => {
  const { user } = useAuth();

  const { data, isLoading, isError, error } = useQuery<{ wrongCourses: Course[] }>(
    ['wrongCourses', user?.recordRef?._id],
    () => wrongCourseAPI.getWrongCourses(user?.recordRef?._id || ''),
    { enabled: !!user?.id }
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return <div className="text-red-500 text-center">Error loading wrong courses: {(error as any).message}</div>;
  }

  const wrongCourses = data?.wrongCourses || [];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center mb-6">
          <div className="bg-yellow-500 rounded-lg p-3 mr-4">
            <AlertTriangle className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Wrong Courses</h1>
        </div>

        <p className="text-gray-600 mb-6">
          Here are the courses that do not align with your registered department or faculty.
        </p>

        {wrongCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {wrongCourses.map((course) => (
              <div
                key={course._id}
                className="flex items-center p-4 border border-yellow-300 bg-yellow-50 rounded-lg shadow-sm"
              >
                <div>
                  <p className="text-lg font-semibold text-gray-800">{course.code}: {course.title}</p>
                  <p className="text-sm text-gray-500">{course.creditUnits} Credit Units</p>
                  <p className="text-xs text-gray-500">Expected: {user?.academicInfo?.department} / {user?.academicInfo?.faculty}</p>
                  <p className="text-xs text-gray-500">Course: {course.department} / {course.faculty}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No wrong courses found for your profile.</p>
        )}
      </div>
    </div>
  );
};

export default WrongCourse;