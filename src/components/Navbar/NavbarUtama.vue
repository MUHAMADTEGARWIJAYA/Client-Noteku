<template>
  <div class="w-full flex justify-end items-end">
    <!-- <button @click="toggleSidebar" class=" z-50 p-2 ">
      <GroupIcon />
    </button> -->


    <div class="h-full w-full shadow-lg transform transition-transform duration-300">
      <h2 class="text-xl font-bold text-white mb-4">Daftar Grup</h2>

      <div v-if="isLoading" class="text-gray-600 text-center">Loading...</div>
      <div v-else-if="error" class="text-red-500 text-center">Error: {{ error.message }}</div>
      <div v-else>

        <ul class="space-y-2">
          <li v-for="group in groups" :key="group._id">
            <div class="flex justify-between items-center p-3 bg-primary rounded-lg cursor-pointer transition">
              <span class="font-semibold text-white">{{ group.name }}</span>

              <div class="flex gap-2">
                <!-- Toggle Detail Grup -->
                <span class="text-white cursor-pointer" @click="toggleGroup(group._id)">
                  {{ isOpen[group._id] ? "▼" : "►" }}
                </span>

                <!-- Link ke TestSoket.vue -->

              </div>
            </div>

            <!-- Detail Grup -->
            <transition name="slide">
              <div v-if="isOpen[group._id]" class="ml-6 mt-2 bg-gray-50 p-3 rounded-lg">
                <h3 class="font-semibold text-gray-700">👥 Members:</h3>
                <ul class="pl-4 list-disc text-gray-600">
                  <li v-for="member in group.members" :key="member">ID: {{ member }}</li>
                </ul>

                <h3 class="font-semibold text-gray-700 mt-2">📝 Notes:</h3>
                <ul class="pl-4 list-disc text-gray-600">
                  <li v-for="note in group.notes" :key="note">Note ID: {{ note }}</li>
                </ul>
                <router-link :to="`/test/${group._id}`" class="text-blue-400 underline text-sm">
                  View Group
                </router-link>
              </div>
            </transition>
          </li>
        </ul>

      </div>
    </div>
  </div>
</template>

<script setup>

import { ref } from "vue";
import { useGroups } from "@/composables/useNotes";

// Fetch data grup
const { data: groups, isLoading, error } = useGroups();

// State untuk menyimpan grup yang terbuka
const isOpen = ref({});


// Fungsi untuk toggle grup
const toggleGroup = (groupId) => {
  isOpen.value[groupId] = !isOpen.value[groupId];
};


</script>

<style scoped>
/* Animasi transisi */
.slide-enter-active,
.slide-leave-active {
  transition: max-height 0.3s ease-in-out, opacity 0.3s;
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
}

.slide-enter-to,
.slide-leave-from {
  max-height: 200px;
  /* Sesuaikan dengan konten */
  opacity: 1;
}
</style>
