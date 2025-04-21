<template>
  <FormMain>
    <div class="flex flex-col justify-center p-6 sm:p-8 rounded-xl backdrop-blur-[2px] bg-white/55
    w-[90%] max-w-[500px] h-auto sm:h-[600px]
    xl:mx-auto
    xl:absolute xl:top-1/2 xl:left-3/4 xl:transform xl:-translate-x-1/2 xl:-translate-y-1/2">
      <div>
        <PenIcon />
      </div>
      <h2 class="text-black font-bold text-lg mt-8">Login</h2>
      <p class="text-zinc-600 text-sm mt-0.5">Belum punya akun?
        <router-link to="/register">
          <span class="font-bold text-violet-400 underline">Sing up</span>
        </router-link>
      </p>
      <form @submit.prevent="handleLogin" class="mt-16">
        <div>
          <label for="email" class="block text-zinc-600 text-sm border-[#3F3F46]">Email</label>
          <input v-model="email" type="email" placeholder="Email"
            class="block w-full bg-rose-50 border border-rose-50 rounded text-black px-2 py-1 placeholder:text-zinc-600 text-sm"
            :class="{ 'border-red-500': v$.email.$error }" />
          <div v-if="v$.email.$error" class="text-red-500 text-xs mt-1">
            {{ v$.email.$errors[0].$message }}
          </div>
        </div>
        <div>
          <div class="flex items-end  justify-between">
            <label for="password" class="block text-zinc-600 text-sm border-[#3F3F46] mt-10">Password</label>
            <router-link to="/forgot-password" class="text-zinc-600 hover:text-violet-400 mb-0.1  text-sm "> Lupa
              Password?</router-link>

          </div>

          <input v-model="password" type="password" placeholder="Password"
            class="block w-full bg-rose-50 border border-rose-50 rounded text-black px-2 py-1 placeholder:text-zinc-600 text-sm"
            :class="{ 'border-red-500': v$.password.$error }" />
          <div v-if="v$.password.$error" class="text-red-500 text-xs mt-1">
            {{ v$.password.$errors[0].$message }}
          </div>
        </div>
        <div v-if="loginError" class="text-red-500 text-sm mt-4">
          Email or password is wrong
        </div>
        <button @click="notify" type="submit" :disabled="loading || v$.$invalid"
          class="mt-10 w-full bg-violet-400 text-white font-bold py-2 px-4 rounded-full hover:bg-opacity-80 transition"
          :class="{ 'opacity-80 cursor-not-allowed': loading || v$.$invalid }">
          {{ loading ? 'Please wait...' : 'Login' }}
        </button>
      </form>
    </div>

  </FormMain>

</template>

<script setup>
import FormMain from '../Sections/Form/FormMain.vue';
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useVuelidate } from '@vuelidate/core';
import { required, email as emailValidator, minLength } from '@vuelidate/validators';
import { useNotifyStore } from "@/stores/Notify";
import { useAuthStore } from "@/stores/auth";
import PenIcon from "@/components/icons/PenIcon.vue";


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
