import apiClient from "../apiClient";

export const getBalance = async (studentId) => {
  const response = await apiClient.get(`/points/accounts/student/${studentId}/balance`);
  return response.data;
};

