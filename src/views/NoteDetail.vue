<template>
  <div class="h-96 w-full flex flex-col text-gray-200">
    <!-- Header dengan Tombol Simpan & Hapus -->
    <div class="flex justify-between items-center p-4">
      <h1 class="text-xl font-semibold text-black">My Notes</h1>
      <div class="flex gap-5">
        <button @click="saveNote" :disabled="loading" :class="{ 'opacity-80 cursor-not-allowed': loading }"
          class="px-4 py-2 bg-gray-100 text-black rounded hover:bg-gray-500 transition duration-200 text-sm font-medium">
          <div v-if="!loading">
            <SaveIcon />
          </div>
          <div v-else>
            <LoadingIcon />
          </div>
        </button>
        <button @click="handleDelete"
          class="px-4 py-2 bg-gray-100 text-white rounded hover:bg-gray-500 transition duration-200 text-sm font-medium">
          <DeleteIcon />
        </button>
      </div>
    </div>
    <!-- Bagian Input Catatan -->
    <div v-if="isLoading" class="flex justify-center items-center"> Loadingg</div>
    <div v-else-if="isError"> Error</div>
    <div v-else class="flex flex-col backdrop-blur-[2px] bg-white/30 flex-grow p-6">
      <!-- Input Judul -->
      <input v-model="title" placeholder="Judul"
        class="w-full p-3 mb-4 text-lg font-semibold text-black bg-transparent  rounded-lg border-none focus:outline-none placeholder-black" />
      <div class="flex flex-grow rounded-lg overflow-hidden">
        <div ref="lineNumbers"
          class="line-numbers w-12 p-3 text-right text-black bg-transparent  font-mono select-none overflow-hidden scrollbar-hidden">
          <div v-for="line in lineCount" :key="line" class="text-sm">{{ line }}</div>
        </div>
        <!-- Textarea -->
        <textarea ref="textarea" v-model="content" @input="updateLineNumbers" @scroll="syncScroll"
          placeholder="Mulai menulis catatan..."
          class="text-sm w-full p-3 flex-grow text-black bg-transparent border-none focus:outline-none resize-none font-mono placeholder-gray-500 scrollbar-hidden"
          style="line-height: 1.4;"></textarea>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, watchEffect, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getNoteId, useUpdateNote, useDeleteNote } from '@/composables/useNotes';
import DeleteIcon from '@/components/icons/DeleteIcon.vue';
import { useNotifyStore } from '@/stores/Notify';
import SaveIcon from '@/components/icons/SaveIcon.vue';
import Swal from 'sweetalert2';
import { nextTick } from 'vue';
import LoadingIcon from '@/components/icons/LoadingIcon.vue';



const loading = ref(false);
// Inisialisasi Route & Router
const route = useRoute();
const router = useRouter();
const noteId = ref(route.params.id);
const notifyStore = useNotifyStore();
// State Title & Content
const title = ref('');
const content = ref('');
// Fetch Data dari Backend
const { data: noteData, isLoading, isError, refetch } = getNoteId(noteId.value);

// Watch untuk perubahan route parameter (id)
watch(() => route.params.id, (newId) => {
  if (newId && newId !== noteId.value) {
    noteId.value = newId;
    refetch(); // Refetch data ketika ID berubah
    // Reset form sementara loading
    title.value = '';
    content.value = '';
  }
}, { immediate: true });

// Update Data ketika Data dari Query Berubah
watchEffect(() => {
  if (noteData.value) {
    title.value = noteData.value.title;
    content.value = noteData.value.content;
    nextTick(() => {
      updateLineNumbers(); // Pastikan dipanggil setelah render selesai
    });
  }
});

// Update Catatan
const updateNote = useUpdateNote();
const saveNote = async () => {
  if (!title.value || !content.value) {
    notifyStore.notify("error", "Failed to create note Judul and Content cannot be empty");
    return;
  }
  loading.value = true;
  if (!noteId.value) {
    console.error('Note ID tidak ditemukan, tidak dapat memperbarui.');
    return;
  }
  try {
    await updateNote.mutateAsync({
      id: noteId.value,
      title: title.value,
      content: content.value,
    });

    notifyStore.notify("success", "Note berhasil disimpan");
    refetch(); // Refetch setelah update untuk memastikan data terbaru
  } catch (error) {
    notifyStore.notify("error", "Gagal menyimpan note");
    console.error(error);
  } finally {
    loading.value = false;
  }
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
      try {
        await deleteNote(noteId.value);
        notifyStore.notify("success", "Note berhasil dihapus");
        router.push('/home');
      } catch (error) {
        notifyStore.notify("error", "Gagal menghapus note");
        console.error(error);
      }
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

.line-numbers div {
  line-height: 1.4;
}

.scrollbar-hidden {
  scrollbar-width: none;
}
</style>
