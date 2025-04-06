<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 w-96">
      <h2 class="text-xl font-bold mb-4">Tambahkan User ke Grup</h2>
      <div class="mb-4">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="email">
          Email User
        </label>
        <input id="email" v-model="emailInput" type="email"
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="user@example.com" />
      </div>
      <div v-if="addUserError" class="text-red-500 text-sm mb-4">{{ addUserError }}</div>
      <div class="flex justify-end space-x-2">
        <button @click="closeDialog" class="px-4 py-2 text-gray-600 hover:text-gray-800" :disabled="addUserLoading">
          Batal
        </button>
        <button @click="addUserToGroup" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          :disabled="addUserLoading">
          <span v-if="addUserLoading">Memproses...</span>
          <span v-else>Tambahkan</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from "vue";
import axiosInstance from "@/utils/axiosInstance";

const props = defineProps({
  show: Boolean, // Prop untuk kontrol dialog
  groupId: { type: String, default: null }, // Pastikan ada default untuk menghindari undefined
});

const emits = defineEmits(["update:show", "userAdded"]);

const emailInput = ref("");
const addUserLoading = ref(false);
const addUserError = ref("");

const closeDialog = () => {
  emits("update:show", false);
};

const addUserToGroup = async () => {
  if (!emailInput.value) {
    addUserError.value = "Email tidak boleh kosong";
    return;
  }
  addUserLoading.value = true;
  addUserError.value = "";
  try {
    const token = localStorage.getItem("accessToken");
    await axiosInstance.post(
      "/groups/add-user",
      { groupId: props.groupId, email: emailInput.value },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    emits("userAdded");
    closeDialog();
  } catch (err) {
    addUserError.value = err.response?.data?.message || "Gagal menambahkan user";
  } finally {
    addUserLoading.value = false;
  }
};
</script>
