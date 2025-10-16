import apiClient from "../apiClient";

const getDashboardOverview = async () => {
  const response = await apiClient.get('/analytics/dashboard');
  return response.data;
}

const getSystemHealth = async () => {
  const response = await apiClient.get('/analytics/health');
  return response.data;
}

export {
  getDashboardOverview,
  getSystemHealth
};