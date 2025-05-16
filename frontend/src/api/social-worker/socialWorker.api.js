import apiClient from "../apiClient";

export const createSocialWorkerProfile = async (data) => {
  // data: { organization, caseloadLimit }
  const response = await apiClient.post("/social-workers/profile", data);
  return response.data;
};

export const getSocialWorkerProfileById = async (id) => {
  const response = await apiClient.get(`/social-workers/user/${id}`);
  return response.data;
};

export const updateSocialWorkerProfile = async ({id, data}) => {
  const response = await apiClient.put(`/social-workers/${id}`, data);
  return response.data;
};
