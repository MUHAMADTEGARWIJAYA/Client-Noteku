<template>
  <div class="h-96 flex flex-col text-gray-200">
    <!-- Header with Save Button -->
    <div class="flex justify-between  items-center p-4">
      <h1 class="text-xl font-semibold text-gray-200">
        My Notes
      </h1>
      <div class="flex gap-5">
        <button @click="saveNote"
          class="px-4 py-2 bg-gray-100 text-white rounded hover:bg-gray-400 transition duration-200  text-sm font-medium">
          <SaveIcon />
        </button>
        <button @click="handleDelete"
          class="px-4 py-2 bg-gray-100 text-white rounded hover:bg-gray-400 transition duration-200  text-sm font-medium">
          <DeleteIcon />
        </button>
      </div>

    </div>

    <!-- Note Input Section -->
    <div class="flex flex-col bg-secondary flex-grow p-6">
      <!-- Title Input -->
      <input v-model="title" @input="saveToHistory" placeholder="Judul"
        class="w-full p-3 mb-4 text-lg font-semibold text-gray-200 bg-secondary rounded-lg border-none focus:outline-none  placeholder-gray-500" />
      <div class="flex flex-grow  rounded-lg overflow-hidden">

        <div ref="lineNumbers"
          class="w-12 p-3 text-right text-gray-500 bg-secondary font-mono select-none overflow-hidden scrollbar-hidden"
          style="line-height: 1.5;">

          <div v-for="line in lineCount" :key="line" class="text-sm">
            {{ line }}
          </div>
        </div>

        <!-- Textarea -->
        <textarea ref="textarea" v-model="content" @input="updateLineNumbers" @scroll="syncScroll"
          placeholder="Start writing your note..."
          class="w-full p-3 flex-grow text-gray-200 bg-secondary border-none focus:outline-none resize-none font-mono placeholder-gray-500 scrollbar-hidden"
          style="line-height: 1.5;"></textarea>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits, onMounted } from 'vue';
import { useUpdateNote } from '@/composables/useNotes';
import DeleteIcon from '@/components/icons/DeleteIcon.vue';
import { useDeleteNote } from '@/composables/useNotes';
import Swal from 'sweetalert2';
import { useRouter } from 'vue-router';
import SaveIcon from '@/components/icons/SaveIcon.vue';
const props = defineProps({ note: Object });
const emit = defineEmits(['update']);

const router = useRouter();
const updateNote = useUpdateNote();
const { mutateAsync: deleteNote } = useDeleteNote();
const title = ref('');
const content = ref('');
const noteId = ref('');

const history = ref([]);
const historyIndex = ref(0);

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
      emit('deleted');
      router.go(0);
    }
  });
};



// Line Numbers Logic
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

// Watch to ensure noteId is always correct
watch(
  () => props.note,
  (newNote) => {
    if (newNote && newNote._id) {
      noteId.value = newNote._id;
      title.value = newNote.title;
      content.value = newNote.content;
      history.value = [{ title: newNote.title, content: newNote.content }];
      historyIndex.value = 0;
      updateLineNumbers(); // Update line numbers when note is loaded
    }
  },
  { immediate: true }
);

const saveToHistory = () => {
  history.value = history.value.slice(0, historyIndex.value + 1);
  history.value.push({ title: title.value, content: content.value });
  historyIndex.value++;
  updateLineNumbers(); // Update line numbers on input
};

const saveNote = async () => {
  if (!noteId.value) {
    console.error('Note ID is undefined, cannot update note.');
    return;
  }

  const updatedNote = { id: noteId.value, title: title.value, content: content.value };
  await updateNote.mutateAsync(updatedNote);
  emit('update', updatedNote);
};

// Initialize line numbers on mount
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
  /* Firefox */
}
</style>
