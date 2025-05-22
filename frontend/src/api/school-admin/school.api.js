import apiClient from "../apiClient";

export const getSchoolById = async (id) => {
  const response = await apiClient.get(`/schools/${id}`);
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
