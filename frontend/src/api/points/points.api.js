import apiClient from '../apiClient'

const getPointsDetailsById = async (studentId) => {
  const response = await apiClient.get(`/points/accounts/student/${studentId}`);

  return response.data;
}

const getAllLevels = async () => {
  const response = await apiClient.get(`/points/configuration/levels`);

  return response.data;
}

const getStudentTransactions = async ({ params = {}, studentId }) => {
  const response = await apiClient.get(`/points/transactions/student/${studentId}`, { params: params });

  return response.data;
}

const getStudentTransactionSummary = async (studentId) => {
  const response = await apiClient(`/points/transactions/student/${studentId}/summary`);

  return response.data;
}

export {
  getPointsDetailsById,
  getAllLevels,
  getStudentTransactions,
  getStudentTransactionSummary
}