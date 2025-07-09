import apiClient from "../apiClient";

export const getSchoolById = async (id) => {
  const response = await apiClient.get(`/schools/${id}`);
  return response.data;
};

export const getSchoolProfile = async () => {
  const response = await apiClient.get('/schools/me');
  return response.data;
};

export const updateSchoolProfile = async (data) => {
  const response = await apiClient.put('/schools/me', data);
  return response.data;
};

export const getAllPendingJoinRequests = async () => {
  const response = await apiClient.get('/schools/join-requests');
  return response.data;
};

export const respondToJoinRequest = async ({ requestId, action }) => {
  // action is either "approve" or "reject"
  const response = await apiClient.post(`/schools/join-requests/${requestId}`, { action });
  return response.data;
};

// Students API
export const getStudents = async (params = {}) => {
  const response = await apiClient.get('/schools/me/students', { params });
  return response.data;
};

// Teachers API
export const getTeachers = async (params = {}) => {
  const response = await apiClient.get('/schools/me/teachers', { params });
  return response.data;
};

export const addTeacher = async (data) => {
  const response = await apiClient.post('/schools/teachers', data);
  return response.data;
};

export const removeTeacher = async (teacherId) => {
  const response = await apiClient.delete(`/schools/teachers/${teacherId}`);
  return response.data;
};

// Classes API
export const getClasses = async (params = {}) => {
  const { page = 1, limit = 10, sort = 'name', order = 'asc' } = params;
  const response = await apiClient.get('/schools/me/classes', {
    params: { page, limit, sort, order }
  });
  return response.data;
};

// Administrators API
export const getAdministrators = async (id, params = {}) => {
  const response = await apiClient.get(`/schools/${id}/administrators`, { params });
  return response.data;
};

export const addAdministrator = async ({ schoolId, userEmail }) => {
  const response = await apiClient.post(`/schools/${schoolId}/administrators`, { userEmail });
  return response.data;
};

export const removeAdministrator = async ({ schoolId, adminId }) => {
  const response = await apiClient.delete(`/schools/${schoolId}/administrators/${adminId}`);
  return response.data;
};

// Bulk import students
export const importStudents = async (data) => {
  const response = await apiClient.post('/schools/import-students', data);
  return response.data;
};
