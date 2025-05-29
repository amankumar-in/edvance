import apiClient from "../apiClient";

export const createStudentProfile = async (data) => {
  // data: { grade}
  const response = await apiClient.post("/students/profile", data);
  return response.data;
};

export const getStudentProfile = async () => {
  const response = await apiClient.get("/students/me");
  return response.data;
};

export const getStudentByUserId = async (userId) => {
  const response = await apiClient.get(`/students/user/${userId}`);
  return response.data;
};

export const updateStudentProfile = async ({ data, id }) => {
  // data: { grade, level}
  const response = await apiClient.put(`/students/${id}`, data);
  return response.data;
};

export const linkWithParent = async (parentLinkCode) => {
  const response = await apiClient.post("/students/link/parent", { parentLinkCode });
  return response.data;
};

export const unlinkFromParent = async ({ id, parentId }) => {
  const response = await apiClient.delete(`/students/${id}/parent/${parentId}`);
  return response.data;
};

export const requestParentLink = async (parentEmail) => {
  const response = await apiClient.post("/link-requests/parent", { parentEmail });
  return response.data;
};

export const linkWithSchool = async (schoolCode) => {
  const response = await apiClient.post("/students/link/school", { schoolCode });
  return response.data;
};

export const requestSchoolLink = async (schoolCode) => {
  const response = await apiClient.post("/link-requests/school", { schoolCode });
  return response.data;
};

export const unlinkFromSchool = async ({ id }) => {
  const response = await apiClient.delete(`/students/${id}/school`);
  return response.data;
};

export const getPendingLinkRequests = async () => {
  const response = await apiClient.get('/link-requests/pending');
  return response.data;
}

export const cancelLinkRequest = async (requestId) => {
  const response = await apiClient.delete(`/link-requests/${requestId}`);
  return response.data;
}

export const getParentLinkRequests = async () => {
  const response = await apiClient.get('/students/requests/parent');
  return response.data;
}

export const respondToParentLinkRequest = async ({ requestId, action }) => {
  // action: { accept, reject }
  const response = await apiClient.post(`/students/requests/parent/${requestId}`, { action });
  return response.data;
}

export const getStudentTasks = async (studentId, params = {}) => {
  const query = new URLSearchParams();

  // Only include defined, non-null parameters
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, value);
    }
  });

  const response = await apiClient.get(`/task-management/students/${studentId}/tasks?${query.toString()}`);
  return response.data;
};