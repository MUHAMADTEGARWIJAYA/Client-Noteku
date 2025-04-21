<template>
  <FormMain>
    <div class="flex flex-col justify-center p-6 sm:p-8 rounded-xl backdrop-blur-[2px] bg-white/55
    w-[90%] max-w-[500px] h-auto sm:h-[600px]
    xl:mx-auto
    xl:absolute xl:top-1/2 xl:left-3/4 xl:transform xl:-translate-x-1/2 xl:-translate-y-1/2">
      <div>
        <PenIcon />
      </div>
      <h2 class="text-black font-bold text-lg mt-8">Register</h2>
      <p class="text-zinc-600 text-sm mt-0.5">Sudah punya akun?
        <router-link to="/login">
          <span class="font-bold text-violet-400 underline">Log in</span>
        </router-link>
      </p>
      <form @submit.prevent="handleSignup">
        <div class="mt-16">
          <label class="mt-0.5 block text-sm text-zinc-600" for="name">Name</label>
          <input v-model="username"
            class="block w-full bg-slate-50 border border-slate-50 rounded text-black px-2 py-1 placeholder:text-zinc-600 text-sm"
            type="text" placeholder="Your Name" required :class="{ 'border-red-500': v$.username.$error }">
          <div v-if="v$.username.$error" class="text-red-500 text-xs mt-1">
            {{ v$.username.$errors[0].message }}
          </div>
        </div>
        <div class="mt-8">
          <label class="mt-0.5 block text-sm text-zinc-600" for="email">Email Address</label>
          <input v-model="email"
            class="block w-full bg-slate-50 border border-slate-50 rounded text-black px-2 py-1 placeholder:text-zinc-600 text-sm"
            type="email" placeholder="Masukkan Email Anda" required :class="{ 'border-red-500': v$.email.$error }">
          <div class="text-red-500 text-xs mt-1" v-if="v$.email.$error">
            {{ v$.email.$errors[0].message }}
          </div>
        </div>
        <div class="mt-8">
          <label class="mt-0.5 block text-sm text-zinc-600" for="password">Password</label>
          <input v-model="password"
            class="block w-full bg-slate-50 border border-slate-50 rounded text-black px-2 py-1 placeholder:text-zinc-600 text-sm"
            type="password" placeholder="Min 6 karakter" required :class="{ 'border-red-500': v$.password.$error }">
          <div class="text-red-500 text-xs mt-1" v-if="v$.password.$error">
            {{ v$.password.$errors[0].message }}
          </div>
        </div>
        <div>
          <GenderInput v-model="role" />
        </div>
        <button
          class="mt-10 w-full bg-violet-400 text-white font-bold py-2 px-4 rounded-full hover:bg-opacity-80 transition"
          type="submit" :disabled="loading || v$.$invalid"
          :class="{ 'opacity-80 cursor-not-allowed': loading || v$.$invalid }">
          {{ loading ? 'Signing up...' : 'Sign up' }}
        </button>
        <p v-if="RegisterErr" class="text-red-500 text-sm mt-2">Nama atau email sudah terdaftar</p>
      </form>
    </div>
  </FormMain>
</template>

<script setup>
import FormMain from '../Sections/Form/FormMain.vue';
import { computed } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, email as emailValidator, minLength, maxLength } from '@vuelidate/validators';
import PenIcon from '@/components/icons/PenIcon.vue';

import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import GenderInput from '@/ui/GenderInput.vue';
import { useRouter } from 'vue-router';
import { useNotifyStore } from '@/stores/Notify';
const router = useRouter()
const authStore = useAuthStore()
const username = ref('');
const role = ref('');
const email = ref('');
const RegisterErr = ref(false)
const password = ref('');
const loading = ref(false);
const error = ref(null);
const rules = computed(() => ({

  username: {
    required,
    $message: "Please enter your name",
    maxLength: maxLength(30),
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


    await authStore.register(username.value, email.value, password.value, role.value);


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
