import apiClient from "../apiClient";

export const searchStudents = async (params = {}) => {
  const query = new URLSearchParams();

  // Only include defined, non-null parameters
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, value);
    }
  });

  const response = await apiClient.get(`/search/students?${query.toString()}`);
  return response.data;
};


export const searchParents = async (params = {}) => {
  const query = new URLSearchParams();

  // Only include defined, non-null parameters
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, value);
    }
  });

  const response = await apiClient.get(`/search/parents?${query.toString()}`);
  return response.data;
};

export const searchSchools = async (params = {}) => {
  const query = new URLSearchParams();

  // Only include defined, non-null parameters
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, value);
    }
  });

  const response = await apiClient.get(`/search/schools?${query.toString()}`);
  return response.data;
};