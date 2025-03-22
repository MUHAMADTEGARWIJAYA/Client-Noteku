import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useQuery, useMutation } from "@tanstack/vue-query";
import axios from "axios";

export const useNotesStore = defineStore("notes", () => {
  const notes = ref([]);
  const isLoading = ref(false);
  const error = ref(null);

  const fetchNotes = async () => {
    isLoading.value = true;
    try {
      const { data } = await axios.get("/api/notes");
      notes.value = data;
    } catch (err) {
      error.value = err;
    } finally {
      isLoading.value = false;
    }
  };

  const createNote = async (newNote) => {
    try {
      const { data } = await axios.post("/api/notes", newNote);
      notes.value.push(data);
    } catch (err) {
      console.error("Failed to create note:", err);
    }
  };

  const updateNote = async (updatedNote) => {
    try {
      await axios.put(`/api/notes/${updatedNote._id}`, updatedNote);
      const index = notes.value.findIndex((n) => n._id === updatedNote._id);
      if (index !== -1) notes.value[index] = updatedNote;
    } catch (err) {
      console.error("Failed to update note:", err);
    }
  };

  const sortedNotes = computed(() =>
    [...notes.value].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
  );

  return {
    notes,
    isLoading,
    error,
    fetchNotes,
    createNote,
    updateNote,
    sortedNotes,
  };
});
