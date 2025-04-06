<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">Anggota Grup</h2>
        <button @click="closeDialog" class="text-gray-500 hover:text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              <div class="relative">
                <img class="h-10 w-10 rounded-full"
                  :src="`https://ui-avatars.com/api/?name=${member.username || 'U'}&background=random`"
                  :alt="member.username">

                <!-- Indikator Status -->
                <span class="absolute bottom-0 right-0 block h-3 w-3 rounded-full"
                  :class="isOnline(member._id) ? 'bg-green-500' : 'bg-gray-400'" title="Status Online">
                </span>
              </div>

              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">
                  {{ member.username || 'Tanpa nama' }}
                </p>
                <p class="text-sm text-gray-500 truncate">
                  {{ member.email }}
                </p>
                <!-- Teks Status Online/Offline -->
                <p class="text-xs font-semibold" :class="isOnline(member._id) ? 'text-green-500' : 'text-gray-400'">
                  {{ isOnline(member._id) ? 'Online' : 'Offline' }}
                </p>
              </div>
            </div>
          </li>
        </ul>

      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { useGroups } from '@/composables/useNotes';
import { defineProps, defineEmits } from 'vue';
import { io } from "socket.io-client";
import { jwtDecode } from "jwt-decode";
const socket = io(import.meta.env.VITE_API_BASE, {
  withCredentials: true,

  transports: ['websocket', 'polling'],
});
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
    socket.emit("join-group", { groupId: props.groupId, userId: userId.value });
    socket.on("update-online-users", (users) => {
      console.log("👥 Daftar user online yang diterima di FE:", users);
      onlineUsers.value = users;
    });
  }

  socket.on("disconnect", (disconnectedUserId) => {
    console.log(`🔴 User ${disconnectedUserId} disconnected`);
    onlineUsers.value = onlineUsers.value.filter(id => id !== disconnectedUserId);
  });
});

const props = defineProps({
  show: Boolean, // Prop untuk kontrol dialog
  groupId: { type: String, default: null }, // Pastikan ada default untuk menghindari undefined
})
const onlineUsers = ref([]);
const userId = ref(null); // Menyimpan userId dari token
const isOnline = (userId) => onlineUsers.value.includes(userId);



const { data: groups, error: groupsError } = useGroups();

const currentGroupMembers = computed(() => {
  if (!groups.value) return [];
  const group = groups.value.find(g => g._id === props.groupId);
  return group ? group.members : [];
});


const emits = defineEmits(['update:show']);
const closeDialog = () => {
  emits("update:show", false);
};
</script>
