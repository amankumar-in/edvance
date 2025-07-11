import apiClient from '../apiClient';

// Student check-in endpoint - POST /attendance/{id}/check-in
export const checkInAttendance = async (studentId) => {
  return apiClient.post(`/attendance/${studentId}/check-in`);
};

// Get student attendance records - GET /attendance/{id}
export const getStudentAttendance = async (studentId, params = {}) => {
  const response = await apiClient.get(`/attendance/${studentId}`, { params });
  return response.data;
};

// Get attendance summary with points - GET /attendance/{id}/summary
export const getAttendanceSummary = async (studentId, params = {}) => {
  const response = await apiClient.get(`/attendance/${studentId}/summary`, { params });
  return response.data;
};

// Get all attendance records with filters - GET /attendance
export const getAllAttendance = async (params = {}) => {
  return apiClient.get('/attendance', { params });
};

// Record attendance (for teachers/admins) - POST /attendance
export const recordAttendance = async (data) => {
  return apiClient.post('/attendance', data);
};

// Record bulk attendance - POST /attendance/bulk
export const recordBulkAttendance = async (data) => {
  return apiClient.post('/attendance/bulk', data);
};

// Get today's attendance for a class - GET /attendance/today
export const getTodayAttendance = async (classId) => {
  return apiClient.get('/attendance/today', { params: { classId } });
};

// Generate attendance report - GET /attendance/report
export const generateAttendanceReport = async (params = {}) => {
  return apiClient.get('/attendance/report', { params });
}; 