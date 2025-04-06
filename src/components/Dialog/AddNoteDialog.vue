<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
        <button @click="closeDialog" class="px-4 py-2 text-gray-600 hover:text-gray-800" :disabled="addNoteLoading">
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

</template>

<script setup>
import { ref, defineProps, defineEmits } from "vue"
import axiosInstance from "@/utils/axiosInstance";


const props = defineProps({
  show: Boolean, // Prop untuk kontrol dialog
  groupId: { type: String, default: null }, // Pastikan ada default untuk menghindari undefined
});

const emits = defineEmits(["update:show", "noteAdded"]);

const closeDialog = () => {
  emits("update:show", false);
};


const notes = ref([]);
const selectedNote = ref(null);

const newNoteTitle = ref("");
const newNoteContent = ref("");
const addNoteLoading = ref(false);
const addNoteError = ref("");



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
        groupId: props.groupId,
        title: newNoteTitle.value,
        content: newNoteContent.value
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );


    // Add the new note to local state
    notes.value.push(response.data.note);
    selectedNote.value = response.data.note;
    emits("noteAdded")
    closeDialog()
  } catch (err) {
    console.error("Gagal menambahkan catatan:", err);
    addNoteError.value = err.response?.data?.message || "Gagal menambahkan catatan";
  } finally {
    addNoteLoading.value = false;
  }
};

</script>
