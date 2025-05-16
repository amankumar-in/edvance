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

