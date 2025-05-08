import apiClient from "../apiClient";

export const createStudentProfile = async (data) => {
  // data: { grade}
  const response = await apiClient.post("/students/profile", data);
  return response.data;
};
