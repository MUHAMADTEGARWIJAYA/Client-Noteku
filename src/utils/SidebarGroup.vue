<template>
  <div class="flex flex-row xl:w-96 min-h-screen bg-secondary">
    <button @click="toggleSidebar"
      :class="['fixed top-4 left-4 z-50 p-2 bg-gray-100 rounded-lg lg:hidden transform transition-transform duration-300 ease-in-out', isSidebarOpen ? 'translate-x-72' : '-translate-x-1 lg:translate-x-0']">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
      </svg>
    </button>
    <!-- Sidebar -->
    <div
      :class="['flex bg-secondary flex-col gap-4 border-white border-r p-8 min-h-screen overflow-y-auto w-96 fixed transform transition-transform duration-300 ease-in-out', isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0']">

      <div class="w-full h-14 gap-4 flex justify-start rounded-xl items-center">
        <img :src="data?.role === 'male' ? '/avatar-cowo.svg' : '/avatar-cewe.svg'" alt="User Avatar"
          class="w-10 h-10 object-cover bg-white rounded-full" />
        <div>
          <p class="font-extrabold text-center text-primary text-[10px]">Halo Good Day 👋🏻</p>
          <h1 class="font-extrabold text-xl text-white">
            {{ data?.name }}
          </h1>
        </div>
      </div>

      <div class="border border-white w-full"></div>

      <div class="flex flex-col gap-2 h-72 overflow-y-auto scrollbar-hidden">
        <p class="text-white text-[14px] ">Mynotes:</p>
        <div v-if="isLoading">Loading....</div>
        <div v-else-if="error">Error: {{ error.message }}</div>
        <div v-else-if="sortedNotes.length" class="flex flex-col gap-4">
          <div v-for="note in sortedNotes" :key="note._id">
            <router-link :to="`/group/${groupId}/notes/${note._id}`"
              class="cursor-pointer w-72 h-24 bg-primary rounded-lg px-2 flex flex-col justify-around shadow-md">
              <p class="text-lg text-white font-bold font-sans">{{ note.title }}</p>
              <p class="text-white text-md line-clamp-1">{{ note.content }}</p>
              <div class="flex justify-between">
                <p class="text-[8px] text-white">Tanggal: {{ formatDate(note.createdAt) }}</p>
                <p class="text-[8px] text-white">Diedit: {{ formatDate(note.updatedAt) }}</p>
                <div class="text-sm flex gap-2">
                  <button class="bg-slate-200 p-2 rounded-xl hover:bg-slate-400 transition-colors ease-in-out">
                    <EditIcon />
                  </button>
                </div>
              </div>
            </router-link>

          </div>
        </div>
        <div v-else class="flex justify-center items-center flex-col">
          <p class="text-white font-bold">Belum ada catatan nihhh</p>
          <NotFoundIcon />
        </div>
      </div>

      <div class="border border-white w-full"></div>

      <!-- List Groups -->


      <button @click="handleLogout" class="bg-primary text-white rounded-xl py-2 px-2 hover:bg-opacity-60">
        Logout
      </button>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { io } from "socket.io-client";
import { useRoute } from "vue-router";
import axios from "axios";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";
import EditIcon from "@/components/icons/EditIcon.vue";
import NotFoundIcon from "@/components/icons/NotFoundIcon.vue";

const socket = io("http://localhost:4000");
const router = useRouter();
const authStore = useAuthStore();
const isSidebarOpen = ref(false);
const route = useRoute();
const groupId = ref(route.params.id);
const groups = ref([]);
const notes = ref([]);
const isLoading = ref(true);
const error = ref(null);
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};


// Fetch data grup saat komponen di-mount
onMounted(() => {
  fetchGroups();
  fetchNotes();

  socket.emit("join-group", groupId.value); // Gabung ke grup

  socket.on("note-updated", ({ noteId, content }) => {
    const note = notes.value.find((n) => n._id === noteId);
    if (note) {
      note.content = content;
    }
  });
});

// Fetch daftar grup
const fetchGroups = async () => {
  try {
    const token = localStorage.getItem("accessToken");
    const response = await axios.get("http://localhost:4000/api/v1/groups/dapat", {
      headers: { Authorization: `Bearer ${token}` },
    });
    groups.value = response.data.groups;
  } catch (err) {
    console.error("Gagal mengambil daftar grup:", err);
  }
};

// Fetch catatan dalam grup
const fetchNotes = async () => {
  try {
    const token = localStorage.getItem("accessToken");
    const response = await axios.get(`http://localhost:4000/api/v1/groups/group/notes/${groupId.value}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    notes.value = response.data.notes;
    isLoading.value = false;
  } catch (err) {
    error.value = err;
    isLoading.value = false;
  }
};

// Fungsi format tanggal
const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
};

// Fungsi untuk sorting notes berdasarkan waktu update
const sortedNotes = computed(() => {
  return notes.value
    ? [...notes.value].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    : [];
});

// Fungsi logout
const handleLogout = async () => {
  try {
    await authStore.logout();
    router.push("/login");
  } catch (err) {
    console.error("Logout gagal:", err);
  }
};
</script>

<style scoped>
/* Sembunyikan scrollbar */
.scrollbar-hidden::-webkit-scrollbar {
  display: none;
}

.scrollbar-hidden {
  scrollbar-width: none;
}

/* Animasi Sidebar */
.transform {
  transition: transform 0.3s ease-in-out;
}
</style>
