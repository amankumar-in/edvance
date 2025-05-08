import apiClient from "../apiClient";

export const updateUserProfile = async (data) => {
  // data: { firstName, lastName, phoneNumber, dateOfBirth }
  const response = await apiClient.put("/users/me", data);
  return response.data;
}; 