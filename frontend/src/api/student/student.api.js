import apiClient from "../apiClient";

export const createStudentProfile = async (data) => {
  // data: { grade}
  const response = await apiClient.post("/students/profile", data);
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

