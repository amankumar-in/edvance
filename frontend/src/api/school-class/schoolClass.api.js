import apiClient from "../apiClient";

// Get specific class details
export const getClassDetails = async (classId) => {
  const response = await apiClient.get(`/classes/${classId}`);
  return response.data;
};

// Get class students
export const getClassStudents = async (classId) => {
  const response = await apiClient.get(`/classes/${classId}/students`);
  return response.data;
};

// Create new class
export const createClass = async (data) => {
  const response = await apiClient.post('/classes', data);
  return response.data;
};

// Update class
export const updateClass = async ({ classId, data }) => {
  const response = await apiClient.put(`/classes/${classId}`, data);
  return response.data;
};

// Delete class
export const deleteClass = async (classId) => {
  const response = await apiClient.delete(`/classes/${classId}`);
  return response.data;
};

// Generate new join code
export const generateJoinCode = async (classId) => {
  const response = await apiClient.post(`/classes/${classId}/join-code`);
  return response.data;
};

// Add student to class
export const addStudentToClass = async ({ classId, studentId }) => {
  const response = await apiClient.post(`/classes/${classId}/students`, { studentId });
  return response.data;
};

// Remove student from class
export const removeStudentFromClass = async ({ classId, studentId }) => {
  const response = await apiClient.delete(`/classes/${classId}/students/${studentId}`);
  return response.data;
};

// Get pending join requests for class
export const getPendingJoinRequests = async (classId) => {
  const response = await apiClient.get(`/classes/${classId}/join-requests`);
  return response.data;
};

// Respond to join request
export const respondToJoinRequest = async ({ classId, requestId, action }) => {
  const response = await apiClient.post(`/classes/${classId}/join-requests/${requestId}`, { action });
  return response.data;
};
