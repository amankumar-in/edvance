import apiClient from "../apiClient";

export const updateUserProfile = async (data) => {
  // data: { firstName, lastName, phoneNumber, dateOfBirth }
  const response = await apiClient.put("/users/me", data);
  return response.data;
};

export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await apiClient.post("/users/me/avatar", formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}; 