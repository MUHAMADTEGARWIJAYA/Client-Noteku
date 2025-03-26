<template>
  <div class="h-96 w-full flex flex-col text-gray-200">
    <!-- Header dengan Tombol Simpan & Hapus -->
    <div class="flex justify-between items-center p-4">
      <h1 class="text-xl font-semibold text-gray-200">My Notes</h1>
      <div class="flex gap-5">
        <button @click="saveNote"
          class="px-4 py-2 bg-gray-100 text-white rounded hover:bg-gray-500 transition duration-200 text-sm font-medium">
          <SaveIcon />
        </button>
        <button @click="handleDelete"
          class="px-4 py-2 bg-gray-100 text-white rounded hover:bg-gray-500 transition duration-200 text-sm font-medium">
          <DeleteIcon />
        </button>
      </div>
    </div>

    <!-- Bagian Input Catatan -->
    <div v-if="isLoading" class="flex justify-center items-center"> Loadingg</div>
    <div v-else-if="isError"> Error"></div>

    <div v-else class="flex flex-col bg-secondary flex-grow p-6">
      <!-- Input Judul -->
      <input v-model="title" placeholder="Judul"
        class="w-full p-3 mb-4 text-lg font-semibold text-gray-200 bg-secondary rounded-lg border-none focus:outline-none placeholder-gray-500" />

      <div class="flex flex-grow rounded-lg overflow-hidden">
        <div ref="lineNumbers"
          class="w-12 p-3 text-right text-gray-500 bg-secondary font-mono select-none overflow-hidden scrollbar-hidden"
          style="line-height: 1.5;">
          <div v-for="line in lineCount" :key="line" class="text-sm">{{ line }}</div>
        </div>

        <!-- Textarea -->
        <textarea ref="textarea" v-model="content" @input="updateLineNumbers" @scroll="syncScroll"
          placeholder="Mulai menulis catatan..."
          class="w-full p-3 flex-grow text-gray-200 bg-secondary border-none focus:outline-none resize-none font-mono placeholder-gray-500 scrollbar-hidden"
          style="line-height: 1.5;"></textarea>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watchEffect, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getNoteId, useUpdateNote, useDeleteNote } from '@/composables/useNotes';
import DeleteIcon from '@/components/icons/DeleteIcon.vue';
import { useNotifyStore } from '@/stores/Notify';
import SaveIcon from '@/components/icons/SaveIcon.vue';
import Swal from 'sweetalert2';

// Inisialisasi Route & Router
const route = useRoute();
const router = useRouter();
const noteId = ref(route.params.id);
const notifyStore = useNotifyStore();
// State Title & Content
const title = ref('');
const content = ref('');

// Fetch Data dari Backend
const { data: noteData, isLoading, isError } = getNoteId(noteId.value);

// Update Data ketika Data dari Query Berubah
watchEffect(() => {
  if (noteData.value) {
    title.value = noteData.value.title;
    content.value = noteData.value.content;
  }
});

// Update Catatan
const updateNote = useUpdateNote();
const saveNote = async () => {
  if (!title.value || !content.value) {
    notifyStore.notify("error", "Failed to create note Judul and Content cannot be empty");
    return;
  }
  if (!noteId.value) {
    console.error('Note ID tidak ditemukan, tidak dapat memperbarui.');
    return;
  }

  await updateNote.mutateAsync({
    id: noteId.value,
    title: title.value,
    content: content.value,
  });

};

// Hapus Catatan
const { mutateAsync: deleteNote } = useDeleteNote();
const handleDelete = async () => {
  Swal.fire({
    title: 'Apakah kamu yakin?',
    text: 'Data ini akan dihapus secara permanen!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ya, hapus!',
    cancelButtonText: 'Batal',
  }).then(async (result) => {
    if (result.isConfirmed) {
      await deleteNote(noteId.value);
      router.push('/home');
    }
  });
};

// Nomor Baris untuk Textarea
const textarea = ref(null);
const lineNumbers = ref(null);
const lineCount = ref(1);

const updateLineNumbers = () => {
  const lines = content.value.split('\n').length;
  lineCount.value = lines < 1 ? 1 : lines;
};

const syncScroll = () => {
  if (textarea.value && lineNumbers.value) {
    lineNumbers.value.scrollTop = textarea.value.scrollTop;
  }
};

// Inisialisasi
onMounted(() => {
  updateLineNumbers();
});
</script>

<style>
/* Custom Scrollbar */
textarea::-webkit-scrollbar {
  width: 8px;
}

textarea::-webkit-scrollbar-track {
  background: #252526;
}

textarea::-webkit-scrollbar-thumb {
  background: #3e3e42;
  border-radius: 4px;
}

textarea::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Hide Scrollbar */
.scrollbar-hidden::-webkit-scrollbar {
  display: none;
}

.scrollbar-hidden {
  scrollbar-width: none;
}
</style>
