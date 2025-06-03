import apiClient from "../apiClient";

// Create a task
export const createTask = async (data) => {
    const response = await apiClient.post(`/tasks`, data);
    return response.data;
}

// Get all tasks(for platform admin, school admin, teacher)
export const getTasks = async (params = {}) => {
    const response = await apiClient.get('/tasks', { params });
    return response.data;
}

// Get all tasks assigned to a student
export const getStudentTasks = async (params = {}) => {
    const response = await apiClient.get('/tasks/by-role/student', { params });
    return response.data;
}

// Get a task by id for a student
export const getStudentTaskById = async (id) => {
    const response = await apiClient.get(`/tasks/by-role/student/${id}?role=student`);
    return response.data;
}

// Submit a task for a student
export const submitTask = async ({ id, data }) => {
    // data: note, evidence
    const response = await apiClient.post(`/tasks/by-role/student/${id}/submit`, data);
    return response.data;
}

// Get all tasks assigned to a parent
export const getParentTasks = async (params = {}) => {
    const response = await apiClient.get('/tasks/by-role/parent', { params });
    return response.data;
}

export const updateTask = async (id, data) => {
    const response = await apiClient.put(`/tasks/${id}`, data);
    return response.data;
}

// Toggle the visibility of a task
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
    getTasks,
    getStudentTasks,
    updateTask,
    toggleTaskVisibility,
};

