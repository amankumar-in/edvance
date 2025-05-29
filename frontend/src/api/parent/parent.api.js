import apiClient from "../apiClient";

export const createParentProfile = async (data) => {
  // data: {}
  const response = await apiClient.post("/parents/profile", data);
  return response.data;
};

export const getParentByUserId = async (userId) => {
  const response = await apiClient.get(`/parents/by-user/${userId}`);
  return response.data;
};

export const updateParentProfile = async ({ id, data }) => {
  const response = await apiClient.put(`/parents/${id}`, data);
  return response.data;
};

export const getParentProfile = async () => {
  const response = await apiClient.get("/parents/me");
  return response.data;
};

export const getChildren = async () => {
  const response = await apiClient.get("/parents/me/children");
  return response.data;
};

export const generateLinkCode = async () => {
  const response = await apiClient.post("/parents/link-code");
  return response.data;
};

export const unlinkChild = async ({ childId }) => {
  const response = await apiClient.delete(`/parents/children/${childId}`);
  return response.data;
};

export const addChild = async (data) => {
  // data: { childEmail, childName, childAge, grade }
  const response = await apiClient.post("/parents/children", data);
  return response.data;
};

export const getPendingLinkRequests = async () => {
  const response = await apiClient.get("/parents/link-requests");
  return response.data;
};

export const respondToLinkRequest = async ({ requestId, action }) => {
  // action: "approve" or "reject"
  const response = await apiClient.post(`/parents/link-requests/${requestId}`, { action });
  return response.data;
};

export const getOutgoingLinkRequests = async () => {
  const response = await apiClient.get("/parents/outgoing-requests");
  return response.data;
};

export const cancelOutgoingRequest = async (requestId) => {
  const response = await apiClient.delete(`/parents/outgoing-requests/${requestId}`);
  return response.data;
};

/**
 * Get available tasks for a parent to control
 */
export const getAvailableTasksForParent = async (parentId, params = {}) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, value);
    }
  });

  const response = await apiClient.get(`/task-management/parents/${parentId}/available-tasks?${query.toString()}`);
  return response.data;
};

/**
 * Get tasks for parent's children
 */
export const getTasksForParentChildren = async (parentId, params = {}) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, value);
    }
  });

  const response = await apiClient.get(`/task-management/parents/${parentId}/children/tasks?${query.toString()}`);
  return response.data;
};

/**
 * Set task visibility control for parent
 */
export const setTaskVisibilityControl = async (taskId, data) => {
  const response = await apiClient.post(`/task-management/tasks/${taskId}/visibility-control`, data);
  return response.data;
};

/**
 * Get parent's visibility controls
 */
export const getParentVisibilityControls = async (parentId, params = {}) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, value);
    }
  });

  const response = await apiClient.get(`/task-management/visibility-controls/parent/${parentId}?${query.toString()}`);
  return response.data;
};
