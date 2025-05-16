import apiClient from "../apiClient";

export const createTeacherProfile = async (data) => {
  // data: {}
  const response = await apiClient.post("/teachers/profile", data);
  return response.data;
}; 

export const getTeacherById = async (id) => {
  const response = await apiClient.get(`/teachers/${id}`);
  return response.data;
}; 

export const updateTeacherProfile = async ({id, data}) => {
  const response = await apiClient.put(`/teachers/${id}`, data);
  return response.data;
};