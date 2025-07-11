import { useQuery } from '@tanstack/react-query';
import {
  getStudentAttendance,
  getAttendanceSummary,
  getAllAttendance,
  getTodayAttendance,
  generateAttendanceReport
} from './attendance.api';

// Query keys
export const attendanceKeys = {
  all: ['attendance'],
  student: (id) => [...attendanceKeys.all, 'student', id],
  studentAttendance: (id, params) => [...attendanceKeys.student(id), 'records', params],
  studentSummary: (id, params) => [...attendanceKeys.student(id), 'summary', params],
  allAttendance: (params) => [...attendanceKeys.all, 'all', params],
  todayAttendance: (classId) => [...attendanceKeys.all, 'today', classId],
  report: (params) => [...attendanceKeys.all, 'report', params],
};

// Get student attendance records
export const useStudentAttendance = (studentId, params = {}, options = {}) => {
  return useQuery({
    queryKey: attendanceKeys.studentAttendance(studentId, params),
    queryFn: () => getStudentAttendance(studentId, params),
    enabled: !!studentId,
    ...options,
  });
};

// Get attendance summary with points
export const useAttendanceSummary = (studentId, params = {}, options = {}) => {
  return useQuery({
    queryKey: attendanceKeys.studentSummary(studentId, params),
    queryFn: () => getAttendanceSummary(studentId, params),
    enabled: !!studentId,
    ...options,
  });
};

// Get all attendance records with filters
export const useAllAttendance = (params = {}, options = {}) => {
  return useQuery({
    queryKey: attendanceKeys.allAttendance(params),
    queryFn: () => getAllAttendance(params),
    ...options,
  });
};

// Get today's attendance for a class
export const useTodayAttendance = (classId, options = {}) => {
  return useQuery({
    queryKey: attendanceKeys.todayAttendance(classId),
    queryFn: () => getTodayAttendance(classId),
    enabled: !!classId,
    ...options,
  });
};

// Generate attendance report
export const useAttendanceReport = (params = {}, options = {}) => {
  return useQuery({
    queryKey: attendanceKeys.report(params),
    queryFn: () => generateAttendanceReport(params),
    enabled: !!params.startDate && !!params.endDate,
    ...options,
  });
}; 