import axios from "axios";
import { useAuthStore } from "@/stores/auth";

const API = import.meta.env.VITE_API_BASE;
const axiosInstance = axios.create({
  baseURL: `${API}api/v1`,
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const authStore = useAuthStore();

    if (error.response?.status === 401 && !originalRequest._retry) {
      console.warn("Access token expired, mencoba refresh token...");
      originalRequest._retry = true; // Supaya tidak infinite loop

      try {
        const refreshResponse = await authStore.refreshToken(); // Coba refresh token

        if (refreshResponse) {
          console.log("Refresh token berhasil, ulangi request...");
          return axiosInstance(originalRequest);
        } else {
          throw new Error("Refresh token gagal");
        }
      } catch (refreshError) {
        console.error("Refresh token gagal, user akan logout:", refreshError);
        authStore.logout();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
