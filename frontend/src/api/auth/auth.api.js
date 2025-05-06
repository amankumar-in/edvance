import apiClient from "../apiClient";

const register = async (userData) => {
  const response = await apiClient.post("/auth/register", userData);
  return response.data;
};

const verifyEmail = async ({ email, token }) => {
  const response = await apiClient.get(
    `/auth/verify-email?email=${encodeURIComponent(
      email
    )}&token=${encodeURIComponent(token)}`
  );
  return response.data;
};

const login = async (loginData) => {
  const response = await apiClient.post("/auth/login", loginData);

  const { accessToken, refreshToken, user } = response.data.data;

  // Store tokens in localStorage for future authenticated requests
  localStorage.setItem("token", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("isAuthenticated", "true");

  return response.data;
};

const forgotPassword = async ({ email }) => {
  const response = await apiClient.post("/auth/forgot-password", { email });
  return response.data;
};

const verifyResetToken = async ({ email, token }) => {
  const response = await apiClient.get(
    `/auth/reset-password?email=${encodeURIComponent(
      email
    )}&token=${encodeURIComponent(token)}`
  );
  return response.data;
};

const resetPassword = async ({ email, token, newPassword }) => {
  const response = await apiClient.post("/auth/reset-password", {
    email,
    token,
    newPassword,
  });
  return response.data;
};

export {
  register,
  verifyEmail,
  login,
  forgotPassword,
  verifyResetToken,
  resetPassword,
};
