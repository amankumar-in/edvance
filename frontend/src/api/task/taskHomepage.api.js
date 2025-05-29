import apiClient from "../apiClient";

/**
 * Task Homepage API
 * New API client for task homepage functionality using correct backend endpoints
 */

/**
 * Get visible tasks for a student
 * Uses the main backend endpoint: /api/task-management/students/:studentId/tasks
 */
export const getStudentTasks = async (studentId, options = {}) => {
  try {
    const { status, category, page = 1, limit = 20 } = options;
    
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (category) params.append('category', category);
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await apiClient.get(
      `/task-management/students/${studentId}/tasks?${params.toString()}`
    );
    
    return response.data;
  } catch (error) {
    console.error('Error fetching student tasks:', error);
    throw error;
  }
};

/**
 * Get task categories for filtering
 */
export const getTaskCategories = async () => {
  try {
    const response = await apiClient.get('/tasks/categories');
    return response.data;
  } catch (error) {
    console.error('Error fetching task categories:', error);
    throw error;
  }
};

/**
 * Helper function to get parent ID from user ID
 */
const getParentIdFromUserId = async (userId) => {
  try {
    const response = await apiClient.get(`/parents/by-user/${userId}`);
    if (response.data.success) {
      return response.data.data._id;
    }
    throw new Error('Parent not found');
  } catch (error) {
    console.error('Error getting parent by user ID:', error);
    throw error;
  }
};

/**
 * Get available tasks for a parent to control
 * Now accepts user ID and converts to parent ID internally
 */
export const getAvailableTasksForParent = async (userId, options = {}) => {
  try {
    // First get parent ID from user ID
    const parentId = await getParentIdFromUserId(userId);
    
    const { category, page = 1, limit = 50 } = options;
    
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await apiClient.get(
      `/task-management/parents/${parentId}/available-tasks?${params.toString()}`
    );
    
    return response.data;
  } catch (error) {
    console.error('Error fetching available tasks for parent:', error);
    throw error;
  }
};

/**
 * Get tasks for parent's children
 * Now accepts user ID and converts to parent ID internally
 */
export const getTasksForParentChildren = async (userId, options = {}) => {
  try {
    // First get parent ID from user ID
    const parentId = await getParentIdFromUserId(userId);
    
    const { childId, category, status, page = 1, limit = 50 } = options;
    
    const params = new URLSearchParams();
    if (childId) params.append('childId', childId);
    if (category) params.append('category', category);
    if (status) params.append('status', status);
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await apiClient.get(
      `/task-management/parents/${parentId}/children/tasks?${params.toString()}`
    );
    
    return response.data;
  } catch (error) {
    console.error('Error fetching tasks for parent children:', error);
    throw error;
  }
};

/**
 * Set task visibility control for a parent
 * Now accepts user ID and converts to parent ID internally
 */
export const setParentTaskVisibility = async (taskId, userId, studentIds, isVisible, reason = '') => {
  try {
    // First get parent ID from user ID
    const parentId = await getParentIdFromUserId(userId);
    
    const response = await apiClient.post(
      `/task-management/tasks/${taskId}/visibility-control`,
      {
        controllerType: 'parent',
        controllerId: parentId,
        studentIds,
        isVisible,
        reason
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error setting parent task visibility:', error);
    throw error;
  }
};

/**
 * Get visibility controls for a parent
 * Now accepts user ID and converts to parent ID internally
 */
export const getParentVisibilityControls = async (userId, options = {}) => {
  try {
    // First get parent ID from user ID
    const parentId = await getParentIdFromUserId(userId);
    
    const { includeTaskDetails = true } = options;
    
    const params = new URLSearchParams();
    if (includeTaskDetails) params.append('includeTaskDetails', 'true');

    const response = await apiClient.get(
      `/task-management/visibility-controls/parent/${parentId}?${params.toString()}`
    );
    
    return response.data;
  } catch (error) {
    console.error('Error fetching parent visibility controls:', error);
    throw error;
  }
}; 