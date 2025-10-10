import apiClient from "../apiClient"

const getStudentClassAttendanceInfo = async ({classId, studentId}) => {
  const response = await apiClient.get(`/class-attendance/classes/${classId}/students/${studentId}?date=${new Date().toLocaleDateString('en-CA')}`);
  return response.data;
}

const getClassAttendanceInfo = async ({classId, date}) => {
  const dateString = date || new Date().toLocaleDateString('en-CA');
  const response = await apiClient.get(`/class-attendance/classes/${classId}?date=${dateString}`);
  return response.data;
}

const getMonthAttendance = async (classId, month, year) => {
  const today = new Date().toISOString().split('T')[0];
  const response = await apiClient.get(`/class-attendance/classes/${classId}/month?month=${month}&year=${year}&date=${today}`);
  return response.data;
}

const getDayAttendance = async (classId, date) => {
  const response = await apiClient.get(`/class-attendance/classes/${classId}/day?date=${date}`);
  return response.data;
}

const getWeekAttendance = async (classId, startDate) => {
  const today = new Date().toISOString().split('T')[0];
  const response = await apiClient.get(`/class-attendance/classes/${classId}/week?startDate=${startDate}&today=${today}`);
  return response.data;
}

const recordClassAttendance = async ({ classId, studentId, attendanceDate, status, comments, activeRole }) => {
  const response = await apiClient.put(`/class-attendance/classes/${classId}/students/${studentId}`, { attendanceDate, status, comments, activeRole });
  return response.data;
}

export {
  getStudentClassAttendanceInfo,
  getClassAttendanceInfo,
  getMonthAttendance,
  recordClassAttendance,
  getDayAttendance,
  getWeekAttendance,
}