<script setup>
import { useGroups } from '@/composables/useNotes';
import axiosInstance from '@/utils/axiosInstance';
import { ref } from 'vue';
import { useNotifyStore } from '@/stores/Notify';

// Group creation state

const notifyStore = useNotifyStore();
const newGroupName = ref('');
const createGroupDialog = ref(false);
const createGroupLoading = ref(false);
const createGroupError = ref('');

const { data: groups, mutate: refreshGroups } = useGroups();


const showSuccess = () => {
  notifyStore.notify("success", "Group created successfully");
}

const showError = () => {
  notifyStore.notify("error", "Failed to create group");
}
const openCreateGroupDialog = () => {
  createGroupDialog.value = true;
  newGroupName.value = '';
  createGroupError.value = '';
};

const createGroup = async () => {
  if (!newGroupName.value.trim()) {
    createGroupError.value = 'Nama grup tidak boleh kosong';
    return;
  }

  createGroupLoading.value = true;
  createGroupError.value = '';

  try {
    const token = localStorage.getItem('accessToken');
    const response = await axiosInstance.post(
      '/groups/create',
      { name: newGroupName.value },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    showSuccess()
    groups.value.push(response.data.group);
    await refreshGroups();
    createGroupDialog.value = false;
  } catch (err) {
    showError()
    console.error('Gagal membuat grup:', err);
    createGroupError.value = err.response?.data?.message || 'Gagal membuat grup';
  } finally {
    createGroupLoading.value = false;
  }
};
</script>

<template>
  <div class="group-management-container">
    <!-- Header Section -->
    <div class="group-header">
      <div class="flex items-center">

        <h3 class="text-lg font-semibold text-black">Daftar Grup</h3>
      </div>
      <button @click="openCreateGroupDialog" class="create-group-button">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Grup Baru
      </button>
    </div>

    <!-- Groups List -->
    <div class="group-list-container">
      <ul v-if="groups && groups.length > 0" class="group-list">
        <li v-for="group in groups" :key="group._id" class="group-item">
          <router-link :to="`/test/${group._id}`" class="group-link">
            <div class="group-avatar">
              {{ group.name.charAt(0).toUpperCase() }}
            </div>
            <div class="group-info">
              <span class="group-name">{{ group.name }}</span>
              <span class="group-meta">{{ group.members?.length || 0 }} anggota</span>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </router-link>
        </li>
      </ul>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-500" fill="none" viewBox="0 0 24 24"
          stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <p class="empty-text">Belum ada grup</p>
        <button @click="openCreateGroupDialog" class="empty-action-button">
          Buat Grup Pertama
        </button>
      </div>
    </div>

    <!-- Create Group Dialog -->
    <div v-if="createGroupDialog" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">Buat Grup Baru</h3>
          <button @click="createGroupDialog = false" class="modal-close-button">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Nama Grup</label>
            <input v-model="newGroupName" type="text" class="form-input" placeholder="Contoh: Tim Proyek" autofocus />
          </div>

          <div v-if="createGroupError" class="form-error">
            {{ createGroupError }}
          </div>
        </div>

        <div class="modal-footer">
          <button @click="createGroupDialog = false" class="secondary-button">
            Batal
          </button>
          <button @click="createGroup" class="primary-button" :disabled="createGroupLoading">
            <span v-if="createGroupLoading" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                </path>
              </svg>
              Membuat...
            </span>
            <span v-else>Buat</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.group-management-container {
  @apply bg-white/50 rounded-xl w-56 p-4;
}

.group-header {
  @apply flex items-center justify-between mb-4;
}

.create-group-button {
  @apply flex items-center gap-2 px-3 py-2 bg-white hover:bg-black text-black hover:text-white text-sm rounded-lg transition-all;
}

.group-list-container {
  @apply space-y-2;
}

.group-list {
  @apply space-y-2;
}

.group-item {
  @apply rounded-lg overflow-hidden;
}

.group-link {
  @apply flex items-center justify-between p-3 bg-gradient-to-r from-rose-50 to-violet-300 hover:bg-gray-700 transition-colors rounded-lg;
}

.group-avatar {
  @apply flex-shrink-0 h-10 w-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-lg;
}

.group-info {
  @apply ml-3 flex-1;
}

.group-name {
  @apply block text-black font-medium;
}

.group-meta {
  @apply block text-xs text-gray-400;
}

.empty-state {
  @apply p-6 text-center;
}

.empty-text {
  @apply mt-2 text-gray-400;
}

.empty-action-button {
  @apply mt-4 px-4 py-2 bg-white hover:bg-black text-black hover:text-white rounded-lg text-sm transition-colors;
}

/* Modal styles */
.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50;
}

.modal-content {
  @apply bg-secondary rounded-xl overflow-hidden w-full max-w-md;
}

.modal-header {
  @apply px-6 py-4 border-b border-secondary flex justify-between items-center;
}

.modal-title {
  @apply text-lg font-semibold text-white;
}

.modal-close-button {
  @apply text-gray-400 hover:text-white;
}

.modal-body {
  @apply px-6 py-4;
}

.form-group {
  @apply mb-4;
}

.form-label {
  @apply block text-sm font-medium text-gray-300 mb-2;
}

.form-input {
  @apply w-full px-4 py-2 bg-secondary border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent;
}

.form-error {
  @apply text-sm text-red-400 mt-2;
}

.modal-footer {
  @apply px-6 py-4 bg-secondary flex justify-end gap-3;
}

.primary-button {
  @apply px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg disabled:opacity-50 flex items-center;
}

.secondary-button {
  @apply px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg;
}

/* Animation */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
