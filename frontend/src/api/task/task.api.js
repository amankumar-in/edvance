import apiClient from "../apiClient";

export const createTask = async (data) => { 
    const response = await apiClient.post(`/tasks`, data);
    return response.data;
}

export const getTask = async (id) => {
    const response = await apiClient.get(`/tasks/${id}`);
    return response.data;
}

export const getTasks = async (params = {}) => {
    const response = await apiClient.get('/tasks', { params });
    return response.data;
}

export const updateTask = async (id, data) => {
    const response = await apiClient.put(`/tasks/${id}`, data);
    return response.data;
}

export const toggleTaskVisibility = async (data) => {
    // data: taskId, studentId, isVisible
    const response = await apiClient.post('/tasks/visibility/toggle', data, {
        params: {
            role: 'parent'
        }
    });
    return response.data;
}

export default {
  createTask,
  getTask,
  getTasks,
  updateTask,
  toggleTaskVisibility,
};

