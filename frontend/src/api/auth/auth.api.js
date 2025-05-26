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

  const { accessToken, refreshToken } = response.data.data;

  // Store tokens in localStorage for future authenticated requests
  localStorage.setItem("token", accessToken);
  localStorage.setItem("refreshToken", refreshToken);

  return response.data;
};

const logout = async () => {
  const response = await apiClient.post("/auth/logout");

  return response.data;
}

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

const getProfile = async () => {
  const response = await apiClient.get('/users/me/profiles');
  return response.data;
};

// Send OTP to phone number
async function sendOtp({ phoneNumber, purpose = "login" }) {
  return apiClient.post('/auth/send-otp', { phoneNumber, purpose });
}

// Login with phone number and OTP
async function loginWithPhone({ phoneNumber, otp }) {
  const response = await apiClient.post('/auth/login', { phoneNumber, otp });
  const { accessToken, refreshToken } = response.data.data;
  localStorage.setItem("token", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
  return response.data;
}

// Verify phone number with OTP
async function verifyPhone({ phoneNumber, otp }) {
  const response = await apiClient.post('/auth/verify-phone', { phoneNumber, otp });
  return response.data;
}

export {
  register,
  verifyEmail,
  login,
  forgotPassword,
  verifyResetToken,
  resetPassword,
  getProfile,
  logout,
  sendOtp,
  loginWithPhone,
  verifyPhone,
};
