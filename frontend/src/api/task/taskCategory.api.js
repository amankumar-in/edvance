import apiClient from "../apiClient";

// Get all task categories with optional filtering
export const getTaskCategories = async (params = {}) => {
    const response = await apiClient.get('/tasks/categories', { params });
    return response.data;
};

// Get a specific task category by ID
export const getTaskCategoryById = async (id) => {
    const response = await apiClient.get(`/tasks/categories/${id}`);
    return response.data;
};

// Create a new task category
export const createTaskCategory = async (data) => {
    const response = await apiClient.post('/tasks/categories', data);
    return response.data;
};

// Update a task category
export const updateTaskCategory = async (id, data) => {
    const response = await apiClient.put(`/tasks/categories/${id}`, data);
    return response.data;
};

// Delete a task category (soft delete)
export const deleteTaskCategory = async (id) => {
    const response = await apiClient.delete(`/tasks/categories/${id}`);
    return response.data;
};

// Get categories for a specific context
export const getTaskCategoriesByContext = async (context) => {
    const response = await apiClient.get(`/tasks/categories/context/${context}`);
    return response.data;
};

// Create default system categories
export const createDefaultTaskCategories = async () => {
    const response = await apiClient.post('/tasks/categories/defaults');
    return response.data;
};

// Migrate category icons from strings to emojis
export const migrateTaskCategoryIcons = async () => {
    const response = await apiClient.post('/tasks/categories/migrate/icons');
    return response.data;
}; 