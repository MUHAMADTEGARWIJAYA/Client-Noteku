<template>
  <div class="flex flex-row xl:w-96 min-h-screen bg-transparent">
    <!-- Hamburger Menu Button (Mobile Only) -->
    <button @click="toggleSidebar"
      :class="['fixed top-4 left-4 z-50 p-2 z-50 bg-gray-100 rounded-lg lg:hidden transform transition-transform duration-300 ease-in-out', isSidebarOpen ? 'translate-x-2' : '-translate-x-1 lg:translate-x-0']">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
      </svg>
    </button>

    <!-- Sidebar -->
    <div
      :class="['flex backdrop-blur-[2px] z-30 bg-white/20 flex-col gap-4 border  min-h-screen overflow-y-auto w-96 fixed transform transition-transform duration-300 ease-in-out', isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0']">
      <div class="flex flex-col gap-2 h-screen overflow-y-auto scrollbar-hidden">
        <div class="flex justify-between w-full items-center  p-3">
          <div></div>
          <p class="text-black font-bold text-[14px] ">ALL NOTE </p>
          <div>
            <router-link :to='`/home/create`'>
              <button class="flex justify-center items-center text-center h-10 w-10 text-white rounded">
                <AddIcon />
              </button>
            </router-link>
          </div>

        </div>

        <div v-if="isLoading">
          Loading....
        </div>
        <div v-else-if="error">Error: {{ error.message }}</div>
        <div v-else-if="sortedNotes.length" class="flex p-3 flex-col gap-4">
          <div v-for="note in sortedNotes" :key="note._id" @click="selectNote(note)">
            <router-link v-if="note._id" :to="`/home/detail/${note._id}`" :class="[
              'cursor-pointer w-full h-24 rounded-lg px-2 py-3 flex flex-col shadow-sm transition-all',
              routee.params.id === note._id ? 'backdrop-blur-[2px] bg-gradient-to-r from-rose-50 to-violet-300' : 'backdrop-blur-[2px] bg-transparent'
            ]">


              <p class="text-[12px] text-black font-bold font-sans">{{ note.title }}</p>
              <p class="text-black text-[12px] line-clamp-2">{{ note.content }}</p>
              <div class="flex justify-between ">
                <!-- <p class="text-[8px] text-white">Tanggal: {{ formatDate(note.createdAt) }}</p>
                <p class="text-[8px] text-white">Diedit: {{ formatDate(note.updatedAt) }}</p> -->
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
      <!-- <NavbarUtama /> -->
    </div>

  </div>
</template>

<script setup>

// import NavbarUtama from '@/components/Navbar/NavbarUtama.vue';


import { ref, computed } from 'vue';
import { useNotes } from '@/composables/useNotes';
import { useRoute } from 'vue-router';

import { useRouter } from 'vue-router';
import { useName } from '@/composables/useNotes';
// import NoteDetail from '@/views/NoteDetail.vue';
// import CreateNote from '@/views/CreateNote.vue';
import AddIcon from '@/components/icons/AddIcon.vue';
import NotFoundIcon from '@/components/icons/NotFoundIcon.vue';


const route = useRouter();


const routee = useRoute(); // ini yang penting
const { data: notes, isLoading, error, } = useNotes();
const { data } = useName();
const selectedNote = ref(null);
const showCreateForm = ref(false);
const isSidebarOpen = ref(false); // State untuk toggle sidebar

// Fungsi untuk toggle sidebar
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

console.log("Route params:", route.params)


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
