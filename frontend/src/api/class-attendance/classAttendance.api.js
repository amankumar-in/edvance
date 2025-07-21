import apiClient from "../apiClient"

const getMonthAttendance = async (classId, month, year) => {
  const response = await apiClient.get(`/class-attendance/classes/${classId}/month?month=${month}&year=${year}`);
  return response.data;
}

const getDayAttendance = async (classId, date) => {
  const response = await apiClient.get(`/class-attendance/classes/${classId}/day?date=${date}`);
  return response.data;
}

const getWeekAttendance = async (classId, startDate) => {
  const response = await apiClient.get(`/class-attendance/classes/${classId}/week?startDate=${startDate}`);
  return response.data;
}

const recordAttendance = async ({ classId, studentId, attendanceDate, status, comments, activeRole }) => {
  const response = await apiClient.put(`/class-attendance/classes/${classId}/students/${studentId}`, { attendanceDate, status, comments, activeRole });
  return response.data;
}

export {
  getMonthAttendance,
  recordAttendance,
  getDayAttendance,
  getWeekAttendance,
}