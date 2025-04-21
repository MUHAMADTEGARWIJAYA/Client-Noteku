<template>
  <div class="flex bg-secondary  flex-row w-full min-h-screen ">
    <!-- Sidebar -->
    <SidebarGroup :key="$route.params.id" />
    <!-- Main Content -->
    <div class=" xl:px-20 w-full xl:ml-20 overflow-y-auto">
      <div class="w-full h-10 mt-5">

      </div>
      <div class="mt-16">
        <router-view :key="$route.params.id" />
      </div>


    </div>

  </div>
</template>

<script setup>
import SidebarGroup from '@/utils/SidebarGroup.vue';


</script>
