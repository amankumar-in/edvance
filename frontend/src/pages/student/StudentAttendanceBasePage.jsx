import React from 'react';
import { useAuth } from '../../Context/AuthContext';
import StudentAttendance from './StudentAttendance';
import StudentClasses from './StudentClasses';

function StudentAttendanceBasePage() {
  const { profiles } = useAuth();
  const isEnrolledInClass = profiles?.['student']?.schoolId && profiles?.['student']?.teacherIds?.length > 0;

  if (isEnrolledInClass) return <StudentClasses />;
  return <StudentAttendance />;
}

export default StudentAttendanceBasePage

