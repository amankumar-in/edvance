import apiClient from "../apiClient";

export const createParentProfile = async (data) => {
  // data: {}
  const response = await apiClient.post("/parents/profile", data);
  return response.data;
}; 