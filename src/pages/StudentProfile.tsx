import React from 'react';
import StudentForm from '../components/Forms/StudentForm';
import { useAuth } from '../hooks/useAuth';
import { useQuery } from 'react-query';
import { studentProfileAPI } from '../api/studentProfile';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const StudentProfile: React.FC = () => {
  const { user } = useAuth();

  const { data: studentData, isLoading, isError } = useQuery(
    ['studentProfile', user?._id],
    () => studentProfileAPI.getProfile(user?._id as string),
    { enabled: !!user?._id }
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return <div className="text-red-500">Error loading student profile.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Update Student Profile</h1>
      {studentData && (
        <StudentForm
          onClose={() => { /* Handle close, maybe navigate back or show a success message */ }}
          student={studentData.profile} // Assuming the API returns { profile: {...} }
        />
      )}
    </div>
  );
};

export default StudentProfile;