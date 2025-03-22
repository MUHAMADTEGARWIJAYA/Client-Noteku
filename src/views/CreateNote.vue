<template>
  <div class="h-96 flex flex-col text-gray-200">
    <!-- Header with Save Button -->
    <div class="flex justify-between items-center p-4">
      <h1 class="text-xl font-semibold text-gray-200">
        Create New Note
      </h1>
      <button @click="saveNote"
        class="px-4 py-2 bg-gray-100 text-white rounded hover:bg-gray-400 transition duration-200  text-sm font-medium">
        <SaveIcon />
      </button>
    </div>

    <!-- Note Input Section -->
    <div class="flex flex-col bg-secondary flex-grow p-6">
      <!-- Title Input -->
      <input v-model="title" placeholder="Judul"
        class="w-full p-3 mb-4 text-lg font-semibold text-gray-200 bg-secondary rounded-lg border-none focus:outline-none placeholder-gray-500" />

      <!-- Content Textarea with Line Numbers -->
      <div class="flex flex-grow rounded-lg overflow-hidden">
        <!-- Line Numbers -->
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
import { ref, onMounted } from 'vue';
import { useCreateNote } from '@/composables/useNotes';
import SaveIcon from '@/components/icons/SaveIcon.vue';
import { useNotifyStore } from '@/stores/Notify';

const notifyStore = useNotifyStore();
const createNote = useCreateNote();
const title = ref('');
const content = ref('');

// Line Numbers Logic
const textarea = ref(null);
const lineNumbers = ref(null);
const lineCount = ref(1);


const showSuccess = () => {
  notifyStore.notify("success", "Note created successfully");
}

const showError = () => {
  notifyStore.notify("error", "Failed to create note Judul and Content cannot be empty");
}
const updateLineNumbers = () => {
  const lines = content.value.split('\n').length;
  lineCount.value = lines < 1 ? 1 : lines;
};

const syncScroll = () => {
  if (textarea.value && lineNumbers.value) {
    lineNumbers.value.scrollTop = textarea.value.scrollTop;
  }
};

// Save Note
const saveNote = async () => {
  if (!title.value || !content.value) {
    showError()
    return;
  }
  showSuccess()
  try {
    await createNote.mutateAsync({
      title: title.value,
      content: content.value,
    });

    // Reset form setelah berhasil menyimpan
    title.value = '';
    content.value = '';
  } catch (error) {

    console.error('Failed to create note:', error);
  }
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
