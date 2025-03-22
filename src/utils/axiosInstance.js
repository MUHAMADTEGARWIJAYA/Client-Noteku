import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const API = import.meta.env.VITE_API_BASE;

const axiosInstance = axios.create({
  baseURL: `${API}api/v1`,
  withCredentials: true, // Kirim cookies untuk refresh token
});

// Interceptor request: Tambahkan access token dari local storage
axiosInstance.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Interceptor response: Handle 401 Unauthorized
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Hindari infinite loop
      const authStore = useAuthStore();

      try {
        const newAccessToken = await authStore.refreshToken(); // Refresh token
        localStorage.setItem('accessToken', newAccessToken); // Simpan token baru
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`; // Update request
        return axiosInstance(originalRequest); // Ulangi request
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
