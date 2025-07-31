import React from 'react';
import { useAuth } from '../../Context/AuthContext';
import StudentAttendance from './StudentAttendance';
import StudentClasses from './StudentClasses';
import { useGetStudentClasses } from '../../api/student/student.queries';
import { ErrorCallout, Loader } from '../../components';
import { Flex } from '@radix-ui/themes';

function StudentAttendanceBasePage() {
  const { profiles } = useAuth();
  const studentId = profiles?.['student']?._id;
  const { data: classes, isLoading: isClassesLoading, isError: isClassesError, error: classesError } = useGetStudentClasses(studentId);
  const classesData = classes?.data ?? [];
  const isEnrolledInClass = classesData?.length > 0;

  if (isClassesLoading) return (
    <Flex justify='center' align='center' className='h-full'>
      <Loader />
    </Flex>
  )

  if (isClassesError) return (
    <div>
      <ErrorCallout
        className={'mx-auto max-w-2xl'}
        errorMessage={classesError?.response?.data?.message || 'Something went wrong while fetching classes'}
      />
    </div>
  )

  if (isEnrolledInClass) return <StudentClasses />;
  return <StudentAttendance />;
}

export default StudentAttendanceBasePage

