import { defineStore } from 'pinia';
import axiosInstance from '@/utils/axiosInstance';
import axios from 'axios';
const API = import.meta.env.VITE_API_BASE;
export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    error: null,
    loading: false,
    isAuthenticated: false,
  }),

  actions: {
    async login(email, password) {
      try {
        this.loading = true;
        this.error = null;

        const response = await axiosInstance.post(
          '/auth/login',
          { email, password }
        );

        this.user = response.data.user;
        this.isAuthenticated = true;


        console.log('Login sukses:', response.data);
      } catch (error) {
        this.error = error.response?.data?.message || 'Invalid email or password';
        this.isAuthenticated = false;
        console.error('Gagal login:', this.error);
      } finally {
        this.loading = false;
      }
    },

    async refreshToken() {
  try {
    this.loading = true;
    this.error = null;

    console.log("Mencoba refresh token...");
    const response = await axiosInstance.post('/auth/refresh', {});

    console.log("Token berhasil diperbarui:", response.data);

    await this.checkAuth(); // Pastikan user diperbarui
    return response.data;
  } catch (error) {
    this.error = error.response?.data?.message || 'Gagal memperbarui token';
    this.isAuthenticated = false;
    console.error('Gagal refresh token:', error);
    throw new Error('Harus login ulang');
  } finally {
    this.loading = false;
  }
},


    async logout() {
      try {
        const response = await axiosInstance.post(
          '/auth/logout',
          {},
          { withCredentials: true }
        );

        // Hapus state di Pinia

        this.user = null;
        this.isAuthenticated = false;
        this.error = null;


        console.log('Logout sukses:', response.data.message);
      } catch (error) {
        console.error('Gagal logout:', error.response?.data?.message || error);

      }
    },

    async register(username, email, password) {
      try {
        const response = await axiosInstance.post(
          '/auth/register',
          { username, email, password }
        );
        console.log('Register sukses:', response.data);
        return response;
      } catch (error) {
        const message = error.response?.data?.message || 'Terjadi kesalahan saat registrasi';
        console.error('Register gagal:', message);
        throw new Error(message);
      }
    },

    async checkAuth() {
      try {
        this.loading = true;
        const response = await axiosInstance.get(
          '/auth/name',
          { withCredentials: true }
        );

        this.user = { name: response.data.name };
        this.isAuthenticated = true;
      } catch (error) {
        this.user = null;
        this.isAuthenticated = false;
        console.error('Cek autentikasi gagal:', error.response?.data?.message || error);
      } finally {
        this.loading = false;
      }
    },
  },
});
