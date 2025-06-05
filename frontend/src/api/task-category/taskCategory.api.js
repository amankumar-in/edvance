import apiClient from "../apiClient";

// Get all task categories
export const getTaskCategories = async (params = {}) => {
  const response = await apiClient.get(`/tasks/categories`, { params });
  return response.data;
};

// Create default task categories
export const createDefaultTaskCategories = async (role) => {
  const response = await apiClient.post(`/tasks/categories/defaults`, { role });
  return response.data;
};

// Create a new task category
export const createTaskCategory = async (data) => {
  const response = await apiClient.post(`/tasks/categories`, data);
  return response.data;
};

// Update a task category
export const updateTaskCategory = async ({id, data}) => {
  const response = await apiClient.put(`/tasks/categories/${id}`, data);
  return response.data;
};

// Delete a task category
export const deleteTaskCategory = async (id) => {
  const response = await apiClient.delete(`/tasks/categories/${id}`);
  return response.data;
};

// Get a task category by id
export const getTaskCategoryById = async (id) => {
  const response = await apiClient.get(`/tasks/categories/${id}`);
  return response.data;
};
