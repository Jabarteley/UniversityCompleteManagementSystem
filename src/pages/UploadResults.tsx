
import React from 'react';
import { useQuery } from 'react-query';
import { studentsAPI } from '../api/students';
import { coursesAPI } from '../api/courses';
import UploadResultsForm from '../components/Forms/UploadResultsForm';

const UploadResults: React.FC = () => {
  const { data: studentsData, isLoading: studentsLoading } = useQuery('students', studentsAPI.getAll);
  const { data: coursesData, isLoading: coursesLoading } = useQuery('courses', coursesAPI.getAll);

  const students = studentsData?.students || [];
  const courses = coursesData?.courses || [];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Upload Results</h1>
      {studentsLoading || coursesLoading ? (
        <p>Loading...</p>
      ) : (
        <UploadResultsForm students={students} courses={courses} />
      )}
    </div>
  );
};

export default UploadResults;
