<template>
  <div class="flex flex-row xl:w-96 min-h-screen bg-secondary">
    <!-- Hamburger Menu Button (Mobile Only) -->
    <button @click="toggleSidebar"
      :class="['fixed top-4 left-4 z-50 p-2 bg-gray-100 rounded-lg lg:hidden transform transition-transform duration-300 ease-in-out', isSidebarOpen ? 'translate-x-72' : '-translate-x-1 lg:translate-x-0']">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
      </svg>
    </button>

    <!-- Sidebar -->
    <div
      :class="['flex bg-secondary flex-col gap-4 border-white border-r p-8 min-h-screen overflow-y-auto w-96 fixed transform transition-transform duration-300 ease-in-out', isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0']">


      <div class="w-full h-14 gap-4 flex justify-start rounded-xl  items-center">
        <img :src="data?.role === 'male' ? '/avatar-cowo.svg' : '/avatar-cewe.svg'" alt="User Avatar"
          class="w-10 h-10 object-cover bg-white rounded-full" />
        <div class="flex justify-between w-full items-center">
          <div>
            <p class="font-extrabold  text-center text-primary text-[10px]">Halo Good Day 👋🏻</p>

            <h1 class=" font-extrabold text-xl  text-white">
              {{ data?.name }}
            </h1>
          </div>



        </div>


      </div>
      <div class="border border-white w-full"></div>

      <div class="flex flex-col gap-2 h-72 overflow-y-auto scrollbar-hidden">
        <div class="flex justify-between items-center">
          <p class="text-white text-[14px] ">Mynotes : </p>
          <div>
            <router-link :to='`/home/create`'>
              <button
                class="flex justify-center items-center text-center h-10 w-10 bg-gray-100 hover:bg-gray-400 text-white rounded">
                <AddIcon />
              </button>
            </router-link>
          </div>

        </div>

        <div v-if="isLoading">
          Loading....
        </div>
        <div v-else-if="error">Error: {{ error.message }}</div>
        <div v-else-if="sortedNotes.length" class="flex flex-col gap-4">
          <div v-for="note in sortedNotes" :key="note._id" @click="selectNote(note)">
            <router-link v-if="note._id" :to="`/home/detail/${note._id}`"
              class=" cursor-pointer w-72 h-24 bg-primary rounded-lg px-2  flex flex-col justify-around shadow-md">
              <p class="text-lg text-white font-bold font-sans">{{ note.title }}</p>
              <p class="text-white text-md line-clamp-1">{{ note.content }}</p>
              <div class="flex justify-between ">
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
          <p class="text-white font-bold">Belum ada catatan nihhh </p>
          <NotFoundIcon />
        </div>
      </div>
      <div class="border border-white w-full"></div>

      <CreateGrup />


      <!-- <NavbarUtama /> -->



      <button @click="handleLogout" class="bg-primary text-white rounded-xl py-2 px-2 hover:bg-opacity-60 ">
        Logout
      </button>

    </div>

    <!--
    <div class="lg:ml-96 w-full xl:p-10 p-5 mt-20 h-screen overflow-y-auto">


      <div class="w-full h-min-screen flex flex-col">

        <CreateNote v-if="showCreateForm" @close="showCreateForm = false" />


        <NoteDetail v-else-if="selectedNote" :note="selectedNote" @update="handleUpdateNote" />
        <p v-else class="text-center text-white mt-10">NoteKu adalah aplikasi catatan sederhana jadi mari buat catatan
        </p>
      </div>
    </div> -->
  </div>
</template>

<script setup>
import CreateGrup from '@/components/Create/CreateGrup.vue';
// import NavbarUtama from '@/components/Navbar/NavbarUtama.vue';
import { useQueryClient } from '@tanstack/vue-query';

import { ref, computed } from 'vue';
import { useNotes } from '@/composables/useNotes';
import EditIcon from '@/components/icons/EditIcon.vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { useName } from '@/composables/useNotes';
// import NoteDetail from '@/views/NoteDetail.vue';
// import CreateNote from '@/views/CreateNote.vue';
import AddIcon from '@/components/icons/AddIcon.vue';
import NotFoundIcon from '@/components/icons/NotFoundIcon.vue';
















const queryClient = useQueryClient();
const router = useRouter();
const authStore = useAuthStore();

const { data: notes, isLoading, error, } = useNotes();
const { data } = useName();
const selectedNote = ref(null);
const showCreateForm = ref(false);
const isSidebarOpen = ref(false); // State untuk toggle sidebar

// Fungsi untuk toggle sidebar
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};



const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
};

const sortedNotes = computed(() => {
  return notes.value
    ? [...notes.value].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    : [];
});

const selectNote = (note) => {
  selectedNote.value = { ...note };
  showCreateForm.value = false;
  isSidebarOpen.value = false; // Tutup sidebar saat memilih catatan di mobile
};

// const handleUpdateNote = async (updatedNote) => {
//   updatedNote.updatedAt = new Date().toISOString();
//   selectedNote.value = { ...updatedNote };
//   await refreshNotes();
// };

const handleLogout = async () => {
  try {

    await authStore.logout();


    queryClient.clear();
    router.push('/login');
  } catch (err) {
    console.error('Logout gagal:', err);
  }
};
</script>

<style scoped>
/* Sembunyikan scrollbar di WebKit (Chrome, Safari) */
.scrollbar-hidden::-webkit-scrollbar {
  display: none;
}

/* Sembunyikan scrollbar di Firefox */
.scrollbar-hidden {
  scrollbar-width: none;
}

/* Sidebar Animation */
.transform {
  transition: transform 0.3s ease-in-out;
}

/* Hamburger Menu Button */
.lg\:hidden {
  display: none;
}

@media (max-width: 1023px) {
  .lg\:hidden {
    display: block;
  }
}
</style>
