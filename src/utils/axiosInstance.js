import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
const API = import.meta.env.VITE_API_BASE;
const axiosInstance = axios.create({
  baseURL: `${API}api/v1`,
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Tandai agar tidak loop
      const authStore = useAuthStore();

      try {
        await authStore.refreshToken(); // Perbarui accessToken di cookie
        return axiosInstance(originalRequest); // Ulangi request asli
      } catch (refreshError) {
        authStore.logout(); // Logout jika refresh gagal
        window.location.href = '/login'; // Redirect ke login
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
