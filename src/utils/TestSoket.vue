<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { io } from "socket.io-client";
import { useGroups } from "@/composables/useNotes";

import { jwtDecode } from "jwt-decode";
import AddUserDialog from "@/components/Dialog/AddUserDialog.vue";
import debounce from "lodash.debounce";
import axiosInstance from "./axiosInstance";
import AddNoteDialog from "@/components/Dialog/AddNoteDialog.vue";
import LoadingUI from "@/ui/LoadingUI.vue";
import MemberDialog from "@/components/Dialog/MemberDialog.vue";
const route = useRoute();
const groupId = ref(route.params.id);
const notes = ref([]);
const selectedNote = ref(null);
const socket = io(import.meta.env.VITE_API_BASE, {
  withCredentials: true,

  transports: ['websocket', 'polling'],
});
// const socket = io("http://localhost:4000", {
//   withCredentials: true,

//   transports: ['websocket', 'polling'],
// });

// add note to grup
const addNOteDialog = ref(false);
const openAddNoteDialog = () => {
  addNOteDialog.value = true;
};
const handleNoteAdd = () => {
  addNOteDialog.value = false;
  alert('berhasil')
}

// AddUserDialog
const addUserDialog = ref(false);
const openAddUserDialog = () => {
  addUserDialog.value = true;
};
const handleUserAdded = () => {
  addUserDialog.value = false;
  alert("User berhasil ditambahkan ke grup!"); // Bisa ganti dengan aksi lain
};


// Members Dialog State
const membersDialog = ref(false);
const openMembersDialog = () => {
  membersDialog.value = true;
};



// Fetch groups data using Vue Query
const { data: groups, isLoading, } = useGroups();

const currentGroup = computed(() => {
  if (!groups.value) return null;
  return groups.value.find(g => g._id === groupId.value);
});

// Computed property untuk nama grup
const groupName = computed(() => {
  return currentGroup.value?.name || `Grup ${groupId.value}`;
});
// Computed property for current group members




const onlineUsers = ref([]);
const userId = ref(null); // Menyimpan userId dari token

// ✅ Fungsi untuk mengambil userId dari token
const getUserIdFromToken = () => {
  const token = localStorage.getItem("accessToken"); // Atau dari cookies
  if (token) {
    const decoded = jwtDecode(token);
    return decoded.id; // Sesuaikan dengan key di token JWT
  }
  return null;
};

onMounted(() => {
  userId.value = getUserIdFromToken();
  if (userId.value) {
    fetchNotes();
    socket.emit("join-group", { groupId: groupId.value, userId: userId.value });

    socket.on("update-online-users", (users) => {
      console.log("👥 Daftar user online yang diterima di FE:", users);
      onlineUsers.value = users;
    });
  }
  socket.on("note-updated", ({ noteId, content, userId }) => {
    console.log(`🔄 Menerima update dari server untuk Note ${noteId} oleh ${userId}`);

    const note = notes.value.find((n) => n._id === noteId);
    if (note) {
      note.content = content;
      if (selectedNote.value && selectedNote.value._id === noteId) {
        selectedNote.value.content = content;
      }
    }
  });

  socket.on("note-added", (newNote) => {
    console.log(`➕ Menerima catatan baru dari server: ${newNote._id}`);
    if (!notes.value.some(n => n._id === newNote._id)) {
      notes.value.push(newNote);
    }
  });
  socket.on("disconnect", (disconnectedUserId) => {
    console.log(`🔴 User ${disconnectedUserId} disconnected`);
    onlineUsers.value = onlineUsers.value.filter(id => id !== disconnectedUserId);
  });
});

const fetchNotes = async () => {
  try {
    const token = localStorage.getItem("accessToken");
    const response = await axiosInstance.get(
      `/groups/group/notes/${groupId.value}`,
      {
        headers: { Authorization: `Bearer ${token}` }
        ,
      });
    notes.value = response.data.notes;
    if (notes.value.length > 0 && !selectedNote.value) {
      selectedNote.value = notes.value[0];
    }
  } catch (err) {
    console.error("Gagal mengambil catatan:", err);
  }
};

const editNote = debounce(async (note) => {
  try {
    const token = localStorage.getItem("accessToken");
    await axiosInstance.put(
      `/note/update/${note._id}`,
      { content: note.content, title: note.title },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    socket.emit("edit-note", {
      groupId: groupId.value,
      noteId: note._id,
      content: note.content,
      title: note.title,
      userId: "12345"
    });
  } catch (err) {
    console.error("Gagal mengedit catatan:", err);
  }
}, 1000);

const selectNote = (note) => {
  selectedNote.value = note;
  isSidebarOpen.value = false;
};

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('id-ID', options);
};

const isSidebarOpen = ref(false);

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};


</script>

<template>
  <div v-if="isLoading" class="w-full h-screen ">

    <LoadingUI />

  </div>
  <div v-else class="flex h-screen bg-secondary">
    <button @click="toggleSidebar"
      :class="['fixed top-4 left-4 z-50 p-2 bg-groupquaternary  rounded-lg lg:hidden transform transition-transform duration-300 ease-in-out', isSidebarOpen ? 'translate-x-72' : '-translate-x-1 lg:translate-x-0']">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
      </svg>
    </button>
    <!-- Sidebar with notes list -->
    <div
      :class="['flex bg-secondary flex-col gap-4 border-white border-r p-8 min-h-screen overflow-y-auto w-96 absolute transform transition-transform duration-300 ease-in-out', isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0']">
      <router-link to="/home" class="cursor-pointer text-start duration-200 hover:text-primary text-white"
        title="Go Back">
        ⋘ Back
      </router-link>
      <div class="p-4 border-b border-gray-200 flex flex-col justify-between gap-3">
        <div>
          <h1 class="text-xl font-bold text-groupquaternary">Catatan Grup</h1>
          <p class="text-sm text-groupquaternary">{{ groupName }}</p>
        </div>
        <div class="flex space-x-2">
          <button @click="openMembersDialog"
            class="px-3 py-1 bg-groupquaternary text-black text-sm rounded hover:bg-black hover:text-white"
            title="Lihat anggota grup">
            View members
          </button>
          <button @click="openAddUserDialog"
            class="px-3 py-1 bg-groupquaternary text-black text-sm rounded hover:bg-black hover:text-white"
            title=" Tambahkan user ke grup">
            + User
          </button>

          <button @click="openAddNoteDialog"
            class="px-3 py-1 bg-purple-500 text-white text-sm rounded hover:bg-white hover:text-black"
            title="Tambah catatan baru">
            + Catatan
          </button>
        </div>
      </div>
      <ul class="flex flex-col gap-2">
        <li v-for="note in notes" :key="note._id" @click="selectNote(note)" :class="{
          'bg-primary border-l-4 border-groupquaternary': selectedNote && selectedNote._id === note._id,
          'hover:bg-opacity-80': true
        }" class="p-4 cursor-pointer transition-colors duration-150 bg-primary rounded-xl">
          <h3 class="font-medium text-groupquaternary truncate">{{ note.title || 'Catatan Tanpa Judul' }}</h3>
          <p class="text-sm text-groupquaternary truncate">{{ note.content.substring(0, 60) }}...</p>
          <p class="text-xs text-groupquaternary mt-1">{{ formatDate(note.updatedAt) }}</p>
        </li>
        <li v-if="notes.length === 0" class="p-4 text-center text-gray-500">
          Tidak ada catatan dalam grup ini
        </li>
      </ul>
    </div>

    <!-- Main content area for editing -->
    <div class="flex-auto flex flex-col xl:ml-96 justify-center mt-10 xl:mt-0 items-center bg-secondary">
      <div v-if="selectedNote" class="flex-1 p-6 w-full max-w-6xl bg-secondary overflow-y-auto flex justify-center">
        <div class="w-full max-w-4xl mx-auto"> <!-- Container dengan lebar maksimum lebih lebar -->
          <input v-model="selectedNote.title" @input="editNote(selectedNote)" placeholder="Judul Catatan"
            class="w-full text-2xl font-bold border-none focus:outline-none focus:ring-0 mb-4 px-2 py-1 rounded  text-white bg-secondary" />
          <textarea v-model="selectedNote.content" @input="editNote(selectedNote)"
            placeholder="Tulis catatan Anda di sini..."
            class="w-full min-h-[80vh] p-6  rounded-lg focus:outline-none border resize-none text-white bg-secondary text-lg"
            style="line-height: 1.6;"></textarea>
          <div class="mt-4 text-sm text-gray-400">
            Terakhir diperbarui: {{ formatDate(selectedNote.updatedAt) }}
          </div>
        </div>
      </div>
      <div v-else class="flex-1 flex items-center justify-center w-full">
        <div class="text-center p-6 max-w-md">
          <div class="text-gray-400 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-300">Pilih catatan</h3>
          <p class="text-gray-500 mt-1">Pilih catatan dari daftar di sebelah kiri untuk mulai mengedit</p>
        </div>
      </div>
    </div>


    <!-- Komponen AddUserDialog -->
    <AddUserDialog v-model:show="addUserDialog" @userAdded="handleUserAdded" :groupId="groupId" />

    <!-- Add Note Dialog -->

    <AddNoteDialog v-model:show="addNOteDialog" :groupId="groupId" @noteAdded="handleNoteAdd" />

    <!-- Members Dialog -->
    <MemberDialog v-model:show="membersDialog" :groupId="groupId" />


  </div>
</template>

<style>
/* Smooth transitions */
* {
  transition: background-color 0.2s ease;
}

/* Better scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Dialog styles */
.fixed {
  position: fixed;
}

.inset-0 {
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

.z-50 {
  z-index: 50;
}

/* Animation for loading spinner */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
