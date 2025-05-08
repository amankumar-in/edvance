import apiClient from "../apiClient";

export const createSocialWorkerProfile = async (data) => {
  // data: { organization, caseloadLimit }
  const response = await apiClient.post("/social-workers/profile", data);
  return response.data;
}; 