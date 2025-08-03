import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useQuery, useMutation } from 'react-query';
import { 
  User, 
  CreditCard, 
  Award, 
  BookOpen, 
  AlertTriangle,
  FileText,
  Download,
  LogOut,
  School
} from 'lucide-react';
import { studentResultsAPI } from '../api/studentResults';
import { courseRegistrationAPI } from '../api/courseRegistration';
import { wrongCourseAPI } from '../api/wrongCourse';
import { statementOfResultAPI } from '../api/statementOfResult';
import { feePaymentAPI } from '../api/feePayment';
import CourseRegistration from './CourseRegistration';
import WrongCourse from './WrongCourse';
import StatementOfResult from './StatementOfResult';
import RequestTranscripts from './RequestTranscripts';
import StudentProfile from './StudentProfile';
import toast from 'react-hot-toast';

const StudentDashboard: React.FC = () => {
  console.log('StudentDashboard loaded');
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');
  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    description: '',
  });
  

  // Fetch semester results on load
  const { data: resultData, isLoading: isLoadingResults } = useQuery(
    ['studentResults', user?.registrationNumber],
    () => studentResultsAPI.getByRegistrationNumber(user?.registrationNumber || ''),
    { enabled: !!user?.registrationNumber }
  );

  const { data: registeredCoursesData, isLoading: isLoadingRegisteredCourses, error: registeredCoursesError } = useQuery<{ registeredCourses: Course[] }>(
    ['registeredCourses', user?.recordRef?._id],
    () => courseRegistrationAPI.fetchRegisteredCourses(user?.recordRef?._id || ''),
    { enabled: !!user?.recordRef?._id }
  );

  const { data: wrongCoursesData, isLoading: isLoadingWrongCourses, error: wrongCoursesError } = useQuery<{ wrongCourses: Course[] }>(
    ['wrongCourses', user?.recordRef?._id],
    () => wrongCourseAPI.getWrongCourses(user?.recordRef?._id || ''),
    { enabled: !!user?.recordRef?._id }
  );

  const { data: statementData, isLoading: isLoadingStatement, error: statementError } = useQuery<StatementData>(
    ['statementOfResult', user?.recordRef?._id],
    () => statementOfResultAPI.downloadStatement(user?.recordRef?._id || ''),
    { enabled: !!user?.recordRef?._id }
  );

  // Mutation for fee payment
  const makePaymentMutation = useMutation(feePaymentAPI.makePayment, {
    onSuccess: () => {
      toast.success('Payment successful!');
      setPaymentForm({ amount: 0, description: '' });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Payment failed.');
    },
  });

  const handleMakePayment = () => {
    if (!paymentForm.amount || !paymentForm.description) {
      toast.error('Please enter both amount and description.');
      return;
    }
    makePaymentMutation.mutate(paymentForm);
  };

  const studentActivities = [
    {
      id: 'profile',
      title: 'Update Student Profile',
      description: 'Update and manage your student profile',
      icon: User,
      color: 'bg-blue-500',
      status: 'completed',
      action: () => setActiveSection('profile')
    },
    {
      id: 'payment',
      title: 'Make Fee Payment',
      description: 'Pay tuition and other fees',
      icon: CreditCard,
      color: 'bg-purple-500',
      status: 'pending',
      action: () => setActiveSection('payment')
    },
    {
      id: 'results',
      title: 'Check Semester Result',
      description: 'View your academic results',
      icon: Award,
      color: 'bg-orange-500',
      status: 'available',
      action: () => setActiveSection('results')
    },
    {
      id: 'registration',
      title: 'Register Courses Per Semester',
      description: 'Register for courses each semester',
      icon: BookOpen,
      color: 'bg-indigo-500',
      status: 'available',
      action: () => setActiveSection('registration')
    },
    {
      id: 'course-check',
      title: 'Check Wrong Course',
      description: 'Verify course registrations',
      icon: AlertTriangle,
      color: 'bg-yellow-500',
      status: 'available',
      action: () => setActiveSection('course-check')
    },
    {
      id: 'statement',
      title: 'Download Statement of Result',
      description: 'Download official result statement',
      icon: Download,
      color: 'bg-red-500',
      status: 'available',
      action: () => setActiveSection('statement')
    },
    {
      id: 'transcript',
      title: 'Request for Transcripts',
      description: 'Request official transcripts',
      icon: FileText,
      color: 'bg-pink-500',
      status: 'available',
      action: () => setActiveSection('transcript')
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'available':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'not-available':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'results':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Check Semester Results</h3>
            <div className="space-y-4">
              {isLoadingResults && <p>Loading results...</p>}
              {resultData?.student && (
                <div className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {resultData.student.results?.length || 0}
                      </div>
                      <div className="text-sm text-blue-700">Semesters</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {resultData.student.results?.[resultData.student.results.length - 1]?.cgpa?.toFixed(2) || 'N/A'}
                      </div>
                      <div className="text-sm text-green-700">Current CGPA</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {resultData.student.academicInfo?.level || 'N/A'}
                      </div>
                      <div className="text-sm text-purple-700">Current Level</div>
                    </div>
                  </div>
                  
                  {resultData.student.results?.map((result: any, index: number) => (
                    <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-semibold">Semester {result.semester}, {result.year}</h4>
                        <div className="flex gap-4 text-sm">
                          <span>GPA: <strong>{result.gpa?.toFixed(2)}</strong></span>
                          <span>CGPA: <strong>{result.cgpa?.toFixed(2)}</strong></span>
                        </div>
                      </div>
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
                            {result.courses?.map((course: any, courseIndex: number) => (
                              <tr key={courseIndex} className="border-t">
                                <td className="px-3 py-2">{course.courseCode}</td>
                                <td className="px-3 py-2">{course.courseName}</td>
                                <td className="px-3 py-2">{course.creditUnits}</td>
                                <td className="px-3 py-2">
                                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                    {course.grade}
                                  </span>
                                </td>
                                <td className="px-3 py-2">{course.gradePoint?.toFixed(2)}</td>
                                
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'payment':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Make Fee Payment</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  id="amount"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value) })}
                  placeholder="Enter amount"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  id="description"
                  value={paymentForm.description}
                  onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })}
                  placeholder="e.g., Tuition Fee, Hostel Fee"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <button
                onClick={handleMakePayment}
                disabled={makePaymentMutation.isLoading}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {makePaymentMutation.isLoading ? 'Processing...' : 'Make Payment'}
              </button>
              {makePaymentMutation.isError && (
                <p className="text-red-500 text-sm mt-2">
                  Error: {makePaymentMutation.error?.response?.data?.message || 'Payment failed.'}
                </p>
              )}
              {makePaymentMutation.isSuccess && (
                <p className="text-green-500 text-sm mt-2">Payment successful!</p>
              )}
            </div>
          </div>
        );

      case 'registration':
        return <CourseRegistration />;
      case 'course-check':
        return <WrongCourse />;
      case 'statement':
        return <StatementOfResult />;
      case 'transcript':
        return <RequestTranscripts />;
      default:
        return <StudentProfile />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-green-600 rounded-lg p-2 mr-3">
                <School className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">URMS</h1>
                <p className="text-sm text-gray-500">Student Portal</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.profile?.firstName} {user?.profile?.lastName}
                </p>
                <p className="text-xs text-gray-500">Student</p>
                {user?.registrationNumber && (
                  <p className="text-xs text-gray-500">Reg No: {user.registrationNumber}</p>
                )}
              </div>
              <button
                onClick={logout}
                className="flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-sm p-6 text-white mb-8"
        >
          <h1 className="text-2xl font-bold mb-2">
            Welcome, {user?.profile?.firstName || 'Student'}!
          </h1>
          <p className="text-green-100">
            Access all your student services and manage your academic journey
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Student Activities Grid */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {studentActivities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={activity.action}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`${activity.color} rounded-lg p-3`}>
                      <activity.icon className="h-6 w-6 text-white" />
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                      {activity.status.replace('-', ' ')}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {activity.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {activity.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Active Section */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {renderActiveSection()}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;