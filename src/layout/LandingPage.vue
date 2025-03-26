<template>
  <div class="flex bg-secondary  flex-row w-full min-h-screen ">
    <!-- Sidebar -->
    <HomePage />


    <!-- Main Content -->
    <div class=" xl:p-20 w-full xl:ml-20 mt-20  overflow-y-auto">


      <router-view :key="$route.params.id" />

    </div>
  </div>
</template>

<script setup>
import HomePage from '@/views/HomePage.vue';


</script>
