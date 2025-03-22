import { defineStore } from "pinia";
import axiosInstance from "@/utils/axiosInstance";
import axios from "axios";

const API = import.meta.env.VITE_API_BASE;

export const useAuthStore = defineStore("auth", {
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
          "/auth/login",
          { email, password },
          { withCredentials: true }
        );

        // Simpan access token di localStorage
        localStorage.setItem("accessToken", response.data.accessToken);

        this.user = response.data.user;
        this.isAuthenticated = true;

        console.log("Login sukses:", response.data);
      } catch (error) {
        this.error = error.response?.data?.message || "Invalid email or password";
        this.isAuthenticated = false;
        console.error("Gagal login:", this.error);
      } finally {
        this.loading = false;
      }
    },

    async refreshToken() {
      try {
        console.log("Mencoba refresh token...");
        this.loading = true;
        this.error = null;

        const response = await axios.post(`${API}auth/refresh`, {}, { withCredentials: true });

        // Simpan access token baru di localStorage
        localStorage.setItem("accessToken", response.data.accessToken);

        console.log("Token berhasil diperbarui:", response.data);

        await this.checkAuth(); // Pastikan user diperbarui
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || "Gagal memperbarui token";
        this.isAuthenticated = false;
        console.error("Gagal refresh token:", error);
        throw new Error("Harus login ulang");
      } finally {
        this.loading = false;
      }
    },

    async logout() {
      try {
        await axiosInstance.post("/auth/logout", {}, { withCredentials: true });

        // Hapus access token dari localStorage
        localStorage.removeItem("accessToken");

        // Reset state user
        this.user = null;
        this.isAuthenticated = false;
        this.error = null;

        console.log("Logout sukses");
      } catch (error) {
        console.error("Gagal logout:", error.response?.data?.message || error);
      }
    },

    async register(username, email, password) {
      try {
        const response = await axiosInstance.post("/auth/register", {
          username,
          email,
          password,
        });

        console.log("Register sukses:", response.data);
        return response;
      } catch (error) {
        const message = error.response?.data?.message || "Terjadi kesalahan saat registrasi";
        console.error("Register gagal:", message);
        throw new Error(message);
      }
    },

    async checkAuth() {
      try {
        this.loading = true;
        this.error = null;

        // Ambil access token dari localStorage
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) throw new Error("Token tidak tersedia");

        const response = await axiosInstance.get("/auth/name", {
          headers: { Authorization: `Bearer ${accessToken}` },
          withCredentials: true,
        });

        this.user = { name: response.data.name };
        this.isAuthenticated = true;
      } catch (error) {
        console.warn("Token mungkin expired, mencoba refresh token...");

        try {
          // Jika gagal, coba refresh token
          await this.refreshToken();

          // Coba ulangi permintaan setelah token diperbarui
          const retryResponse = await axiosInstance.get("/auth/name", {
            headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
            withCredentials: true,
          });

          this.user = { name: retryResponse.data.name };
          this.isAuthenticated = true;
        } catch (refreshError) {
          console.error("Refresh token gagal, user akan logout:", refreshError);
          this.user = null;
          this.isAuthenticated = false;
          localStorage.removeItem("accessToken"); // Bersihkan token
        }
      } finally {
        this.loading = false;
      }
    },
  },
});
