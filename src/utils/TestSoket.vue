<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { io } from "socket.io-client";

import debounce from "lodash.debounce";
import { useQuery } from '@tanstack/vue-query';
import axiosInstance from "./axiosInstance";

const route = useRoute();
const groupId = ref(route.params.id);
const notes = ref([]);
const selectedNote = ref(null);
const socket = io('server-noteku-production.up.railway.app/', {
  withCredentials: true,

  transports: ['websocket', 'polling'],
});

// Add User Dialog State
const emailInput = ref("");
const addUserDialog = ref(false);
const addUserLoading = ref(false);
const addUserError = ref("");

// Members Dialog State
const membersDialog = ref(false);

// Fetch groups data using Vue Query
const {
  data: groups,
  isLoading: groupsLoading,
  error: groupsError
} = useQuery({
  queryKey: ['groups'],
  queryFn: async () => {
    const token = localStorage.getItem('accessToken');
    const response = await axiosInstance.get(
      '/groups/dapat',
      {
        headers: { Authorization: `Bearer ${token}` }
        , withCredentials: true
      });
    return response.data.groups;
  },
  retry: 1,
  staleTime: 1000 * 60 * 5,
});

const currentGroup = computed(() => {
  if (!groups.value) return null;
  return groups.value.find(g => g._id === groupId.value);
});

// Computed property untuk nama grup
const groupName = computed(() => {
  return currentGroup.value?.name || `Grup ${groupId.value}`;
});
// Computed property for current group members
const currentGroupMembers = computed(() => {
  if (!groups.value) return [];
  const group = groups.value.find(g => g._id === groupId.value);
  return group?.members || [];
});


const openMembersDialog = () => {
  membersDialog.value = true;
};

onMounted(() => {
  fetchNotes();
  socket.emit("join-group", groupId.value);

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

const openAddUserDialog = () => {
  addUserDialog.value = true;
  emailInput.value = "";
  addUserError.value = "";
};
const isSidebarOpen = ref(false);

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};


const addUserToGroup = async () => {
  if (!emailInput.value) {
    addUserError.value = "Email tidak boleh kosong";
    return;
  }

  addUserLoading.value = true;
  addUserError.value = "";

  try {
    const token = localStorage.getItem("accessToken");
    await axiosInstance.post(
      `/groups/add-user`,
      { groupId: groupId.value, email: emailInput.value },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    addUserDialog.value = false;
    alert("User berhasil ditambahkan ke grup!");
  } catch (err) {
    console.error("Gagal menambahkan user:", err);
    addUserError.value = err.response?.data?.message || "Gagal menambahkan user";
  } finally {
    addUserLoading.value = false;
  }
};

const addNoteDialog = ref(false);
const newNoteTitle = ref("");
const newNoteContent = ref("");
const addNoteLoading = ref(false);
const addNoteError = ref("");

const openAddNoteDialog = () => {
  addNoteDialog.value = true;
  newNoteTitle.value = "";
  newNoteContent.value = "";
  addNoteError.value = "";
};

const addNoteToGroup = async () => {
  if (!newNoteTitle.value.trim()) {
    addNoteError.value = "Judul catatan tidak boleh kosong";
    return;
  }

  addNoteLoading.value = true;
  addNoteError.value = "";

  try {
    const token = localStorage.getItem("accessToken");
    const response = await axiosInstance.post(
      `/groups/add-note`,
      {
        groupId: groupId.value,
        title: newNoteTitle.value,
        content: newNoteContent.value
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Add the new note to local state
    notes.value.push(response.data.note);
    selectedNote.value = response.data.note;

    addNoteDialog.value = false;
  } catch (err) {
    console.error("Gagal menambahkan catatan:", err);
    addNoteError.value = err.response?.data?.message || "Gagal menambahkan catatan";
  } finally {
    addNoteLoading.value = false;
  }
};
</script>

<template>
  <div class="flex h-screen bg-secondary">
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

    <!-- Add User Dialog -->
    <div v-if="addUserDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-96">
        <h2 class="text-xl font-bold mb-4">Tambahkan User ke Grup</h2>
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="email">
            Email User
          </label>
          <input id="email" v-model="emailInput" type="email"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="user@example.com" />
        </div>
        <div v-if="addUserError" class="text-red-500 text-sm mb-4">{{ addUserError }}</div>
        <div class="flex justify-end space-x-2">
          <button @click="addUserDialog = false" class="px-4 py-2 text-gray-600 hover:text-gray-800"
            :disabled="addUserLoading">
            Batal
          </button>
          <button @click="addUserToGroup" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            :disabled="addUserLoading">
            <span v-if="addUserLoading">Memproses...</span>
            <span v-else>Tambahkan</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Add Note Dialog -->
    <div v-if="addNoteDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-96 max-h-[90vh] overflow-y-auto">
        <h2 class="text-xl font-bold mb-4">Tambah Catatan Baru</h2>

        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="note-title">
            Judul Catatan
          </label>
          <input id="note-title" v-model="newNoteTitle" type="text"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Judul catatan" />
        </div>

        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="note-content">
            Isi Catatan
          </label>
          <textarea id="note-content" v-model="newNoteContent"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline min-h-[200px]"
            placeholder="Isi catatan"></textarea>
        </div>

        <div v-if="addNoteError" class="text-red-500 text-sm mb-4">{{ addNoteError }}</div>

        <div class="flex justify-end space-x-2">
          <button @click="addNoteDialog = false" class="px-4 py-2 text-gray-600 hover:text-gray-800"
            :disabled="addNoteLoading">
            Batal
          </button>
          <button @click="addNoteToGroup" class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            :disabled="addNoteLoading">
            <span v-if="addNoteLoading">Memproses...</span>
            <span v-else>Simpan</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Members Dialog -->
    <div v-if="membersDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold">Anggota Grup</h2>
          <button @click="membersDialog = false" class="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div v-if="groupsLoading" class="flex justify-center py-4">
          <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>

        <div v-else-if="groupsError" class="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                fill="currentColor">
                <path fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-red-700">Gagal memuat daftar anggota: {{ groupsError.message }}</p>
            </div>
          </div>
        </div>

        <div v-else>
          <div v-if="currentGroupMembers.length === 0" class="text-center py-4 text-gray-500">
            Tidak ada anggota dalam grup ini
          </div>

          <ul v-else class="divide-y divide-gray-200">
            <li v-for="member in currentGroupMembers" :key="member._id" class="py-3">
              <div class="flex items-center space-x-3">
                <div class="flex-shrink-0">
                  <img class="h-10 w-10 rounded-full"
                    :src="`https://ui-avatars.com/api/?name=${member.username || 'U'}&background=random`"
                    :alt="member.username">
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">
                    {{ member.username || 'Tanpa nama' }}
                  </p>
                  <p class="text-sm text-gray-500 truncate">
                    {{ member.email }}
                  </p>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
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
