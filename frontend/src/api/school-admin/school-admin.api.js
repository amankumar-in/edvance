import apiClient from "../apiClient";

/**
 * Get available tasks for a school to control
 */
export const getAvailableTasksForSchool = async (schoolId, params = {}) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, value);
    }
  });

  const response = await apiClient.get(`/task-management/schools/${schoolId}/available-tasks?${query.toString()}`);
  return response.data;
};

/**
 * Get tasks for school students
 */
export const getTasksForSchoolStudents = async (schoolId, params = {}) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, value);
    }
  });

  const response = await apiClient.get(`/task-management/schools/${schoolId}/students/tasks?${query.toString()}`);
  return response.data;
};

/**
 * Set task visibility control for school
 */
export const setSchoolTaskVisibilityControl = async (taskId, data) => {
  const response = await apiClient.post(`/task-management/tasks/${taskId}/visibility-control`, data);
  return response.data;
};

/**
 * Get school's visibility controls
 */
export const getSchoolVisibilityControls = async (schoolId, params = {}) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, value);
    }
  });

  const response = await apiClient.get(`/task-management/visibility-controls/school/${schoolId}?${query.toString()}`);
  return response.data;
}; 