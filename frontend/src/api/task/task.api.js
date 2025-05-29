import apiClient from "../apiClient";

export const createTask = async (data) => { 
    const response = await apiClient.post(`/task-management/tasks`, data);
    return response.data;
}

