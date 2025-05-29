import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor
apiClient.interceptors.request.use(
  function (config) {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("🔑 Token being sent:", token.substring(0, 20) + "...");
    } else {
      console.log("❌ No token found in localStorage");
    }

    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

export default apiClient;
