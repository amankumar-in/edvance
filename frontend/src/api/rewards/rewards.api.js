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

/**
 * Get all rewards
 */
const getRewards = async (params = {}) => {
  const response = await apiClient.get(`/rewards`, { params });
  return response.data;
};

/**
 * Get reward by ID
 */
const getRewardById = async (id) => {
  const response = await apiClient.get(`/rewards/${id}`);
  return response.data;
};

/**
 * Create a new reward
 */
const createReward = async (formData) => {
  const response = await apiClient.post(`/rewards`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Update an existing reward
 */
const updateReward = async ({ id, formData }) => {
  const response = await apiClient.put(`/rewards/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Delete a reward (soft delete)
 */
const deleteReward = async (id) => {
  const response = await apiClient.delete(`/rewards/${id}`);
  return response.data;
};

/**
 * Redeem a reward
 */
const redeemReward = async ({ id, studentId }) => {
  const response = await apiClient.post(`/rewards/redemptions/${id}/redeem`, { studentId });
  return response.data;
};

/**
 * Get redemption history
 */
const getRedemptionHistory = async (params = {}) => {
  const response = await apiClient.get(`/rewards/redemptions`, { params });
  return response.data;
};

/**
 * Get redemption by ID
 */
const getRedemptionById = async (id) => {
  const response = await apiClient.get(`/rewards/redemptions/${id}`);
  return response.data;
};

/**
 * Cancel a redemption
 */
const cancelRedemption = async ({ id, reason, role }) => {
  const response = await apiClient.post(`/rewards/redemptions/${id}/cancel`, { reason, role });
  return response.data;
};

/**
 * Fulfill a redemption
 */
const fulfillRedemption = async ({ id, feedback, role }) => {
  const response = await apiClient.put(`/rewards/redemptions/${id}/fulfill`, { feedback, role });
  return response.data;
};

/**
 * Add reward to wishlist
 */
const addToWishlist = async ({ rewardId, studentId }) => {
  const response = await apiClient.post(`/rewards/${rewardId}/wishlist`, { studentId });
  return response.data;
};

/**
 * Remove reward from wishlist
 */
const removeFromWishlist = async ({ rewardId, studentId }) => {
  const response = await apiClient.delete(`/rewards/${rewardId}/wishlist`, {
    data: { studentId }
  });
  return response.data;
};

/**
 * Get rewards for parent
 */
const getParentRewards = async (params = {}) => {
  const response = await apiClient.get(`/rewards/parent`, { params });
  return response.data;
};

/**
 * Get rewards for student
 */
const getStudentRewards = async (params = {}) => {
  const response = await apiClient.get(`/rewards/student`, { params });
  return response.data;
};

/**
 * Toggle reward visibility for parent's children
 */
const toggleRewardVisibility = async ({ id, isVisible }) => {
  const response = await apiClient.put(`/rewards/${id}/toggle-visibility`, { isVisible });
  return response.data;
};

/**
 * Get pending redemptions for fulfillment
 */
const getPendingRedemptions = async (params = {}) => {
  const response = await apiClient.get(`/rewards/redemptions/pending`, { params });
  return response.data;
};

export {
  createDefaultRewardCategories,
  createRewardCategory,
  deleteRewardCategory,
  getRewardCategories,
  getRewardCategoryById,
  getRewardCategoryHierarchy,
  updateRewardCategory,
  getRewards,
  getRewardById,
  createReward,
  updateReward,
  deleteReward,
  redeemReward,
  getRedemptionHistory,
  getRedemptionById,
  cancelRedemption,
  fulfillRedemption,
  addToWishlist,
  removeFromWishlist,
  getParentRewards,
  getStudentRewards,
  toggleRewardVisibility,
  getPendingRedemptions,
};
