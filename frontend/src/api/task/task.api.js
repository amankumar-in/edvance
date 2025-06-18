import apiClient from "../apiClient";

// Create a task
const createTask = async (formData) => {
    const response = await apiClient.post(`/tasks`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
}

// Get all tasks(for platform admin, school admin, teacher)
const getTasks = async (params = {}) => {
    const response = await apiClient.get('/tasks', { params });
    return response.data;
}

// Get all tasks assigned to a student
const getStudentTasks = async (params = {}) => {
    const response = await apiClient.get('/tasks/by-role/student', { params });
    return response.data;
}

// Get a task by id for a student
const getStudentTaskById = async (id) => {
    const response = await apiClient.get(`/tasks/by-role/student/${id}?role=student`);
    return response.data;
}

// Get a task by id (for admin roles)
const getTaskById = async (id) => {
    const response = await apiClient.get(`/tasks/${id}`);
    return response.data;
}

// Submit a task for a student
const submitTask = async ({ id, data }) => {
    // Check if data is FormData (for file uploads) or regular object
    const isFormData = data instanceof FormData;

    const response = await apiClient.post(`/tasks/by-role/student/${id}/submit`, data, {
        headers: isFormData ? {
            'Content-Type': 'multipart/form-data',
        } : {
            'Content-Type': 'application/json',
        }
    });
    return response.data;
}

// Get all tasks assigned to a parent
const getParentTasks = async (params = {}) => {
    const response = await apiClient.get('/tasks/by-role/parent', { params });
    return response.data;
}

// Update a task
const updateTask = async (id, formData) => {
    const response = await apiClient.put(`/tasks/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
}

// Delete a task
const deleteTask = async (id) => {
    const response = await apiClient.delete(`/tasks/${id}`);
    return response.data;
}

// Toggle the visibility of a task
const toggleTaskVisibility = async (data) => {
    // data: taskId, studentId, isVisible
    const response = await apiClient.post('/tasks/visibility/toggle', data, {
        params: {
            role: 'parent'
        }
    });
    return response.data;
}

// Get list of tasks for approval
const getTasksForApproval = async (params = {}) => {
    // role param is necessary to include
    const response = await apiClient.get(`/tasks/approval`, { params })
    return response.data;
}

// Review Task for approval (Approve or Reject)
const reviewTask = async ({ id, data }) => {
    const response = await apiClient.post(`/tasks/${id}/review`, data);

    return response.data;
}

export {
    createTask,
    getTasks,
    getStudentTasks,
    getStudentTaskById,
    getTaskById,
    submitTask,
    getParentTasks,
    updateTask,
    deleteTask,
    toggleTaskVisibility,
    getTasksForApproval,
    reviewTask,
};

