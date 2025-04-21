<template>
  <div class="bg-gradient-to-r from-rose-50 to-violet-300 flex h-screen justify-center items-center">
    <slot></slot>

    <div class="hidden md:block  w-full">
      <WelcomeCustom />
    </div>
  </div>
</template>

<script setup>
import WelcomeCustom from '@/components/shared/WelcomeCustom.vue';
</script>
