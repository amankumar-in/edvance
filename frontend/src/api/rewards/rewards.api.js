import apiClient from "../apiClient";

/**
 * Get all reward categories
 */
const getRewardCategories = async (params = {}) => {
  const response = await apiClient.get(`/rewards/categories`, { params });
  return response.data;
};

/**
 * Get reward category by ID
 */
const getRewardCategoryById = async (id) => {
  const response = await apiClient.get(`/rewards/categories/${id}`);
  return response.data;
};

/**
 * Create a new reward category
 */
const createRewardCategory = async (data) => {
  const response = await apiClient.post(`/rewards/categories`, data);
  return response.data;
};

/**
 * Update an existing reward category
 */
const updateRewardCategory = async ({ id, data }) => {
  const response = await apiClient.put(`/rewards/categories/${id}`, data);
  return response.data;
};

/**
 * Delete a reward category (soft delete)
 */
const deleteRewardCategory = async (id) => {
  const response = await apiClient.delete(`/rewards/categories/${id}`);
  return response.data;
};

/**
 * Create default reward categories
 */
const createDefaultRewardCategories = async () => {
  const response = await apiClient.post(`/rewards/categories/defaults`);
  return response.data;
};

/**
 * Get reward category hierarchy
 */
const getRewardCategoryHierarchy = async (params = {}) => {
  const response = await apiClient.get(`/rewards/categories/hierarchy`, { params });
  return response.data;
};

export {
  createDefaultRewardCategories, createRewardCategory, deleteRewardCategory, getRewardCategories,
  getRewardCategoryById, getRewardCategoryHierarchy, updateRewardCategory
};
