import apiClient from "../apiClient";

// ==================== TASK CRUD OPERATIONS ====================

export const createTask = async (data) => {
  const response = await apiClient.post('/task-management/tasks', data);
  return response.data;
};

export const getTasks = async (params = {}) => {
  const response = await apiClient.get('/task-management/tasks', { params });
  return response.data;
};

export const getTaskById = async (id) => {
  const response = await apiClient.get(`/task-management/tasks/${id}`);
  return response.data;
};

export const updateTask = async (id, data) => {
  const response = await apiClient.put(`/task-management/tasks/${id}`, data);
  return response.data;
};

export const deleteTask = async (id) => {
  const response = await apiClient.delete(`/task-management/tasks/${id}`);
  return response.data;
};

// ==================== ASSIGNMENT MANAGEMENT ====================

export const getTaskAssignments = async (taskId, params = {}) => {
  const response = await apiClient.get(`/task-management/tasks/${taskId}/assignments`, { params });
  return response.data;
};

export const assignTaskToStudents = async (taskId, data) => {
  const response = await apiClient.post(`/task-management/tasks/${taskId}/assign`, data);
  return response.data;
};

export const unassignTaskFromStudents = async (taskId, data) => {
  const response = await apiClient.post(`/task-management/tasks/${taskId}/unassign`, data);
  return response.data;
};

// ==================== VISIBILITY CONTROL ====================

export const setTaskVisibility = async (taskId, data) => {
  const response = await apiClient.post(`/task-management/tasks/${taskId}/visibility`, data);
  return response.data;
};

export const getTaskVisibilityControls = async (taskId, params = {}) => {
  const response = await apiClient.get(`/task-management/tasks/${taskId}/visibility`, { params });
  return response.data;
};

export const checkStudentTaskVisibility = async (taskId, studentId, params = {}) => {
  const response = await apiClient.get(`/task-management/tasks/${taskId}/visibility/${studentId}`, { params });
  return response.data;
};

// ==================== STUDENT TASK RETRIEVAL ====================

export const getStudentTasks = async (studentId, params = {}) => {
  const response = await apiClient.get(`/task-management/students/${studentId}/tasks`, { params });
  return response.data;
};

// ==================== BULK OPERATIONS ====================

export const bulkAssignTasks = async (data) => {
  const response = await apiClient.post('/task-management/bulk/assign', data);
  return response.data;
};

export const bulkSetVisibility = async (data) => {
  const response = await apiClient.post('/task-management/bulk/visibility', data);
  return response.data;
};

// ==================== ANALYTICS & REPORTING ====================

export const getAssignmentAnalytics = async (params = {}) => {
  const response = await apiClient.get('/task-management/analytics/assignments', { params });
  return response.data;
};

export const getVisibilityAnalytics = async (params = {}) => {
  const response = await apiClient.get('/task-management/analytics/visibility', { params });
  return response.data;
};

// ==================== PARENT-SPECIFIC FUNCTIONS ====================

export const getChildrenTasks = async (parentId, params = {}) => {
  // This would need to be implemented based on parent-child relationships
  const response = await apiClient.get(`/task-management/parent/${parentId}/children-tasks`, { params });
  return response.data;
};

export const setParentVisibilityControl = async (taskId, parentId, childrenIds, isVisible, reason) => {
  return setTaskVisibility(taskId, {
    controllerType: 'parent',
    controllerId: parentId,
    studentIds: childrenIds,
    isVisible,
    reason
  });
};

// ==================== SCHOOL-SPECIFIC FUNCTIONS ====================

export const setSchoolVisibilityControl = async (taskId, schoolId, studentIds, isVisible, reason) => {
  return setTaskVisibility(taskId, {
    controllerType: 'school',
    controllerId: schoolId,
    studentIds,
    isVisible,
    reason
  });
};

export const setClassVisibilityControl = async (taskId, classId, studentIds, isVisible, reason) => {
  return setTaskVisibility(taskId, {
    controllerType: 'class',
    controllerId: classId,
    studentIds,
    isVisible,
    reason
  });
}; 