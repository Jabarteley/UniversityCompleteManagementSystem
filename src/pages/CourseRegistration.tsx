import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { courseRegistrationAPI } from '../api/courseRegistration';
import toast from 'react-hot-toast';
import { BookOpen, CheckCircle, XCircle } from 'lucide-react';

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

interface CourseRegistrationData {
  studentId: string;
  courseIds: string[];
}

const CourseRegistration: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

  const { data: availableCourses, isLoading: isLoadingCourses, error: coursesError } = useQuery<{ courses: Course[] }>(
    'availableCourses',
    courseRegistrationAPI.fetchAvailableCourses
  );

  const { data: registeredCoursesData, isLoading: isLoadingRegisteredCourses, error: registeredCoursesError } = useQuery<{ registeredCourses: Course[] }>(
    ['registeredCourses', user?.recordRef?._id],
    () => courseRegistrationAPI.fetchRegisteredCourses(user?.recordRef?._id || ''),
    { enabled: !!user?.recordRef?._id }
  );

  useEffect(() => {
    if (registeredCoursesData?.registeredCourses) {
      setSelectedCourses(registeredCoursesData.registeredCourses.map(course => course._id));
    }
  }, [registeredCoursesData]);

  const registerCoursesMutation = useMutation(
    (data: CourseRegistrationData) => courseRegistrationAPI.registerCourses(data),
    {
      onSuccess: () => {
        toast.success('Courses registered successfully!');
        queryClient.invalidateQueries(['registeredCourses', user?.id]);
        queryClient.invalidateQueries('availableCourses');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to register courses.');
      },
    }
  );

  const unregisterCourseMutation = useMutation(
    (data: { userId: string; courseId: string }) => courseRegistrationAPI.unregisterCourse(data.userId, data.courseId),
    {
      onSuccess: () => {
        toast.success('Course unregistered successfully!');
        queryClient.invalidateQueries(['registeredCourses', user?.id]);
        queryClient.invalidateQueries('availableCourses');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to unregister course.');
      },
    }
  );

  const handleCourseSelection = (courseId: string) => {
    setSelectedCourses((prevSelected) =>
      prevSelected.includes(courseId)
        ? prevSelected.filter((id) => id !== courseId)
        : [...prevSelected, courseId]
    );
  };

  const handleUnregister = (courseId: string) => {
    if (!user?.recordRef?._id) {
      toast.error('User not authenticated.');
      return;
    }
    unregisterCourseMutation.mutate({ userId: user.recordRef._id, courseId });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.recordRef?._id) {
      toast.error('Student profile not found.');
      return;
    }
    if (selectedCourses.length === 0) {
      toast.error('Please select at least one course.');
      return;
    }

    registerCoursesMutation.mutate({
      studentId: user.recordRef._id,
      courseIds: selectedCourses,
    });
  };

  const registeredCourseIds = registeredCoursesData?.registeredCourses?.map(c => c._id) || [];
  const coursesToRegister = availableCourses?.courses?.filter(course => !registeredCourseIds.includes(course._id)) || [];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center mb-6">
          <div className="bg-indigo-500 rounded-lg p-3 mr-4">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Course Registration</h1>
        </div>

        {/* Registered Courses Section */}
        <h2 className="text-xl font-bold text-gray-800 mb-4">Your Registered Courses</h2>
        {isLoadingRegisteredCourses && <p className="text-center text-gray-500">Loading registered courses...</p>}
        {registeredCoursesError && <p className="text-center text-red-500">Error loading registered courses: {registeredCoursesError.message}</p>}

        {registeredCoursesData?.registeredCourses && registeredCoursesData.registeredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {registeredCoursesData.registeredCourses.map((course) => (
              <div
                key={course._id}
                className="flex items-center justify-between p-4 border border-green-300 bg-green-50 rounded-lg shadow-sm"
              >
                <div className="flex flex-col min-w-0">
                  <p className="text-lg font-semibold text-gray-800 whitespace-normal break-words">{course.code}: {course.title}</p>
                  <p className="text-sm text-gray-500 whitespace-normal break-words">{course.creditUnits} Credit Units</p>
                </div>
                <button
                  onClick={() => handleUnregister(course._id)}
                  disabled={unregisterCourseMutation.isLoading}
                  className="text-red-600 hover:text-red-800 transition-colors"
                  title="Unregister Course"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          !isLoadingRegisteredCourses && !registeredCoursesError && (
            <p className="text-center text-gray-500 mb-8">No courses currently registered.</p>
          )
        )}

        {/* Available Courses Section */}
        <h2 className="text-xl font-bold text-gray-800 mb-4">Available Courses for Registration</h2>
        <p className="text-gray-600 mb-6">
          Select the courses you wish to register for this semester.
        </p>

        {isLoadingCourses && <p className="text-center text-gray-500">Loading available courses...</p>}
        {coursesError && <p className="text-center text-red-500">Error loading courses: {coursesError.message}</p>}

        {coursesToRegister.length > 0 ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {coursesToRegister.map((course) => (
                <div
                  key={course._id}
                  className={`flex items-center p-4 border rounded-lg transition-all duration-200 ${
                    selectedCourses.includes(course._id)
                      ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500'
                      : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}
                >
                  <input
                    type="checkbox"
                    id={`course-${course._id}`}
                    checked={selectedCourses.includes(course._id)}
                    onChange={() => handleCourseSelection(course._id)}
                    className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                  />
                  <label htmlFor={`course-${course._id}`} className="ml-3 flex-1 cursor-pointer flex flex-col min-w-0">
                    <p className="text-lg font-semibold text-gray-800 whitespace-normal break-words">{course.code}: {course.title}</p>
                    <p className="text-sm text-gray-500 whitespace-normal break-words">{course.creditUnits} Credit Units</p>
                  </label>
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={registerCoursesMutation.isLoading || selectedCourses.length === 0}
              className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {registerCoursesMutation.isLoading ? (
                'Registering...'
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Register Selected Courses
                </>
              )}
            </button>
          </form>
        ) : (
          !isLoadingCourses && !coursesError && coursesToRegister.length === 0 && (
            <p className="text-center text-gray-500">No new courses available for registration at this time.</p>
          )
        )}
      </div>
    </div>
  );
};

export default CourseRegistration;