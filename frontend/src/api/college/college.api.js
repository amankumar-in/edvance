import apiClient from "../apiClient";

// Get all colleges with pagination and filters
export const getAllColleges = async (params = {}) => {
  const response = await apiClient.get('/colleges', { params });
  return response.data;
};

// Get single college by ID
export const getCollegeById = async (id) => {
  const response = await apiClient.get(`/colleges/${id}`);
  return response.data;
};

// Get featured colleges
export const getFeaturedColleges = async (params = {}) => {
  const response = await apiClient.get('/colleges/featured', { params });
  return response.data;
};

// Create new college
export const createCollege = async (data) => {
  // Check if data contains files (logo or bannerImage)
  const hasFiles = data.logo instanceof File || data.bannerImage instanceof File;
  
  if (hasFiles) {
    const formData = new FormData();
    
    // Append all form fields
    Object.keys(data).forEach(key => {
      if (key === 'courses' && Array.isArray(data[key])) {
        // Handle courses array
        data[key].forEach((course, index) => {
          formData.append(`courses[${index}]`, course);
        });
      } else if (data[key] instanceof File) {
        // Handle file uploads
        formData.append(key, data[key]);
      } else if (data[key] !== null && data[key] !== undefined) {
        // Handle regular form fields
        formData.append(key, data[key]);
      }
    });
    
    const response = await apiClient.post('/colleges', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } else {
    const response = await apiClient.post('/colleges', data);
    return response.data;
  }
};

// Update college
export const updateCollege = async ({ id, data }) => {
  // Check if data contains files (logo or bannerImage)
  const hasFiles = data.logo instanceof File || data.bannerImage instanceof File;
  
  if (hasFiles) {
    const formData = new FormData();
    
    // Append all form fields
    Object.keys(data).forEach(key => {
      if (key === 'courses' && Array.isArray(data[key])) {
        // Handle courses array
        data[key].forEach((course, index) => {
          formData.append(`courses[${index}]`, course);
        });
      } else if (data[key] instanceof File) {
        // Handle file uploads
        formData.append(key, data[key]);
      } else if (data[key] !== null && data[key] !== undefined) {
        // Handle regular form fields
        formData.append(key, data[key]);
      }
    });
    
    const response = await apiClient.put(`/colleges/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } else {
    const response = await apiClient.put(`/colleges/${id}`, data);
    return response.data;
  }
};

// Delete college
export const deleteCollege = async (id) => {
  const response = await apiClient.delete(`/colleges/${id}`);
  return response.data;
};

// Toggle featured status
export const toggleCollegeFeaturedStatus = async (id) => {
  const response = await apiClient.patch(`/colleges/${id}/featured`);
  return response.data;
};

// Update college status
export const updateCollegeStatus = async ({ id, status }) => {
  const response = await apiClient.patch(`/colleges/${id}/status`, { status });
  return response.data;
};