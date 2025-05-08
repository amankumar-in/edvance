import apiClient from "../apiClient";

export const createTeacherProfile = async (data) => {
  // data: {}
  const response = await apiClient.post("/teachers/profile", data);
  return response.data;
}; 