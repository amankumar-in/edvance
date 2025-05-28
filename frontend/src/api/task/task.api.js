import apiClient from "../apiClient";

export const createTask = async (data) => { 
    const response = await apiClient.post(`/tasks`, data);
    return response.data;
}

