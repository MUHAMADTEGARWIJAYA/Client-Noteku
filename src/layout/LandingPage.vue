<template>
  <div class="flex bg-gradient-to-r from-rose-50 to-violet-300  flex-row w-full min-h-screen">
    <!-- Button toggle sidebar -->
    <button @click="toggleSidebar" :class="[
      'fixed top-4 right-4 z-50 p-2 bg-gray-100 rounded-lg transform transition-transform duration-300 ease-in-out',
      isSidebarOpen ? '-translate-x-52' : '-translate-x-1 lg:translate-x-0'
    ]">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
      </svg>
    </button>

    <!-- Sidebar -->
    <HomePage />

    <!-- Main Content -->
    <div class="xl:px-20 w-full xl:ml-20 overflow-y-auto">
      <div class="mt-16 xl:mt-0">
        <router-view :key="route.params.id" />
      </div>
    </div>

    <!-- Button Logout -->
    <div class="fixed bottom-5 right-5">
      <button @click="handleLogout" class="bg-zinc-900 text-white rounded-xl py-2 px-2 hover:bg-opacity-60">
        Logout
      </button>
    </div>

    <!-- Create Group Sidebar -->
    <div :class="[
      'transform transition-transform fixed h-screen w-96 top-0 -right-40 duration-300 ease-in-out',
      !isSidebarOpen ? 'translate-x-full' : '-translate-x-30'
    ]">
      <CreateGrup />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router'; // 🔥 benar
import { useQueryClient } from '@tanstack/vue-query';
import { useAuthStore } from '@/stores/auth';
import HomePage from '@/views/HomePage.vue';
import CreateGrup from '@/components/Create/CreateGrup.vue';

const isSidebarOpen = ref(false);

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

const route = useRoute(); // 🔥 untuk ambil route params.id
const router = useRouter(); // 🔥 untuk navigasi push

const queryClient = useQueryClient();
const authStore = useAuthStore();

const handleLogout = async () => {
  try {
    await authStore.logout();
    queryClient.clear();
    router.push('/login'); // 🔥 pakai router, bukan route
  } catch (err) {
    console.error('Logout gagal:', err);
  }
};
</script>
