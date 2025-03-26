<template>
  <div class="bg-primary flex h-screen">
    <div class="flex bg-secondary flex-col justify-center p-8 h-screen w-[500px]">
      <div>
        <PenIcon />
      </div>


      <h2 class="text-white font-bold text-lg mt-8">Login</h2>
      <p class="text-zinc-400 text-sm mt-0.5">Belum punya akun?
        <router-link to="/register">
          <span class="font-bold text-primary underline">Singup</span>
        </router-link>
      </p>
      <form @submit.prevent="handleLogin" class="mt-16">
        <div>
          <label for="email" class="block text-zinc-400 text-sm border-[#3F3F46]">Email</label>
          <input v-model="email" type="email" placeholder="Email"
            class="block w-full bg-[#27272A] border border-[#3F3F46] rounded text-white px-2 py-1 placeholder:text-zinc-600 text-sm"
            :class="{ 'border-red-500': v$.email.$error }" />
          <div v-if="v$.email.$error" class="text-red-500 text-xs mt-1">
            {{ v$.email.$errors[0].$message }}
          </div>
        </div>
        <div>
          <div class="flex items-end  justify-between">
            <label for="password" class="block text-zinc-400 text-sm border-[#3F3F46] mt-10">Password</label>
            <router-link to="/forgot-password" class="text-zinc-400 hover:text-primary mb-0.1  text-sm "> Lupa
              Password?</router-link>

          </div>

          <input v-model="password" type="password" placeholder="Password"
            class="block w-full bg-[#27272A] border border-[#3F3F46] rounded text-white px-2 py-1 placeholder:text-zinc-600 text-sm"
            :class="{ 'border-red-500': v$.password.$error }" />
          <div v-if="v$.password.$error" class="text-red-500 text-xs mt-1">
            {{ v$.password.$errors[0].$message }}
          </div>
        </div>
        <div v-if="loginError" class="text-red-500 text-sm mt-4">
          Email or password is wrong
        </div>
        <button @click="notify" type="submit" :disabled="loading || v$.$invalid"
          class="mt-10 w-full bg-primary text-white font-bold py-2 px-4 rounded-full hover:bg-opacity-80 transition"
          :class="{ 'opacity-80 cursor-not-allowed': loading || v$.$invalid }">
          {{ loading ? 'Please wait...' : 'Login' }}
        </button>
      </form>
    </div>

    <div class="hidden sm:block w-full">
      <WelcomeCustom />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useVuelidate } from '@vuelidate/core';
import { required, email as emailValidator, minLength } from '@vuelidate/validators';
import { useNotifyStore } from "@/stores/Notify";
import { useAuthStore } from "@/stores/auth";
import PenIcon from "@/components/icons/PenIcon.vue";
import WelcomeCustom from "@/components/shared/WelcomeCustom.vue";

const email = ref("");
const password = ref("");
const authStore = useAuthStore();
const router = useRouter();
const loading = ref(false);
const loginError = ref(false);
const notifyStore = useNotifyStore();

const showSuccess = () => {
  notifyStore.notify("success", "Login successful");
};

const showError = () => {
  notifyStore.notify("error", "Email or password is wrong");
};

const rules = computed(() => ({
  email: { required, emailValidator, $message: "Please enter a valid email address" },
  password: { required, minLength: minLength(6), $message: "Password must be at least 6 characters long" },
}));

const v$ = useVuelidate(rules, { email, password });

const handleLogin = async () => {
  loginError.value = false;

  const result = await v$.value.$validate();
  if (!result) return;

  loading.value = true;
  try {
    await authStore.login(email.value, password.value);
    if (!authStore.error) {
      showSuccess();
      setTimeout(() => {
        router.push("/home");
      }, 5000);
    } else {
      loginError.value = true;
      showError();
    }
  } catch (error) {
    console.error("Login failed:", error);
    loginError.value = true;
    showError();
  } finally {
    loading.value = false;
  }
};
</script>
