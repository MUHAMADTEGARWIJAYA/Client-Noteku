<template>
  <div class="bg-black flex h-screen">
    <!-- Sidebar -->
    <div class="bg-secondary flex-col flex justify-center w-[500px] p-8">
      <PenIcon />
      <h1 class="text-white font-bold text-lg mt-8">Sign up jika belum ada account</h1>
      <p class="text-zinc-400 text-sm mt-0.5">Sudah punya akun?
        <router-link to="/login">
          <span class="font-bold text-primary underline">Log in</span>
        </router-link>
      </p>
      <form @submit.prevent="handleSignup">
        <div class="mt-16">
          <label class="mt-0.5 block text-sm text-zinc-400" for="name">Name</label>
          <input v-model="username"
            class="block w-full bg-[#27272A] border border-[#3F3F46] rounded text-white px-2 py-1 placeholder:text-zinc-600 text-sm"
            type="text" placeholder="Your Name" required :class="{ 'border-red-500': v$.username.$error }">
          <div v-if="v$.username.$error" class="text-red-500 text-xs mt-1">
            {{ v$.username.$errors[0].message }}
          </div>
        </div>
        <div class="mt-8">
          <label class="mt-0.5 block text-sm text-zinc-400" for="email">Email Address</label>
          <input v-model="email"
            class="block w-full bg-[#27272A] border border-[#3F3F46] rounded text-white px-2 py-1 placeholder:text-zinc-600 text-sm"
            type="email" placeholder="Masukkan Email Anda" required :class="{ 'border-red-500': v$.email.$error }">
          <div class="text-red-500 text-xs mt-1" v-if="v$.email.$error">
            {{ v$.email.$errors[0].message }}
          </div>
        </div>
        <div class="mt-8">
          <label class="mt-0.5 block text-sm text-zinc-400" for="password">Password</label>
          <input v-model="password"
            class="block w-full bg-[#27272A] border border-[#3F3F46] rounded text-white px-2 py-1 placeholder:text-zinc-600 text-sm"
            type="password" placeholder="*************" required :class="{ 'border-red-500': v$.password.$error }">
          <div class="text-red-500 text-xs mt-1" v-if="v$.password.$error">
            {{ v$.password.$errors[0].message }}
          </div>
        </div>
        <button
          class="mt-10 w-full bg-primary text-white font-bold py-2 px-4 rounded-full hover:bg-opacity-80 transition"
          type="submit" :disabled="loading || v$.$invalid"
          :class="{ 'opacity-80 cursor-not-allowed': loading || v$.$invalid }">
          {{ loading ? 'Signing up...' : 'Sign up' }}
        </button>
        <p v-if="RegisterErr" class="text-red-500 text-sm mt-2">Nama atau email sudah terdaftar</p>
      </form>
    </div>

    <!-- Sidebar End  -->
    <!-- Note Isi -->
    <div class="hidden sm:block w-full">
      <WelcomeCustom />
    </div>
    <!-- Note end -->
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, email as emailValidator, minLength, maxLength } from '@vuelidate/validators';
import PenIcon from '@/components/icons/PenIcon.vue';
import WelcomeCustom from '@/components/shared/WelcomeCustom.vue';
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { useNotifyStore } from '@/stores/Notify';
const router = useRouter()
const authStore = useAuthStore()
const username = ref('');
const email = ref('');
const RegisterErr = ref(false)
const password = ref('');
const loading = ref(false);
const error = ref(null);
const rules = computed(() => ({

  username: {
    required,
    $message: "Please enter your name",
    maxLength: maxLength(10),
    $message: "Name must be at most 10 characters long"
  },
  email: {
    required,
    emailValidator,
    $message: "Please enter a valid email address"
  },
  password: {
    required,
    minLength: minLength(6),
    $message: "Password must be at least 6 characters long"
  }

}))

const notifyStore = useNotifyStore();

const showSuccess = () => {
  notifyStore.notify("success", "signup successful");
}
const showError = () => {
  notifyStore.notify("error", "Email atau Username sudah terdaftar");
}
const v$ = useVuelidate(rules, { username, email, password })


const handleSignup = async () => {
  loading.value = true;
  RegisterErr.value = false
  try {
    const result = await v$.value.$validate();
    if (!result) return;


    await authStore.register(username.value, email.value, password.value);


    showSuccess();
    setTimeout(() => {
      router.push('/login');
    }, 2000);

  } catch (err) {
    RegisterErr.value = true
    showError();
    error.value = err; // Simpan pesan error dari backend
  } finally {
    loading.value = false;
  }
};

</script>
