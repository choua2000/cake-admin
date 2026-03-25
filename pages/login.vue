<script setup lang="ts">


definePageMeta({
  layout: false
});

const email = ref('');
const password = ref('');
const isLoading = ref(false);

const authStore = useAuthStore();
const handleLogin = async () => {
  isLoading.value = true;
  try {
    await authStore.login(email.value, password.value);
    navigateTo('/');
  } catch (error: any) {
    alert(error.data?.message || 'ເຂົ້າສູ່ລະບົບລົ້ມເຫລວ. ກະລຸນາກວດສອບຂໍ້ມູນຂອງທ່ານ.');
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-pink-50 flex items-center justify-center p-6">
    <div
      class="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col items-center p-12 relative">
      <!-- Decorative Elements -->
      <div class="absolute top-0 left-0 w-24 h-24 bg-primary/10 rounded-br-full -ml-8 -mt-8"></div>
      <div class="absolute bottom-0 right-0 w-32 h-32 bg-secondary/20 rounded-tl-full -mr-12 -mb-12"></div>

      <div class="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary/30">
        <Cake class="w-10 h-10 text-white" />
      </div>

      <h1 class="text-3xl font-extrabold text-gray-900 mb-2">ຮ້ານເຄັກ</h1>
      <p class="text-gray-500 mb-10 text-center">ຈັດການທຸລະກິດຂອງຫວານຂອງທ່ານຢ່າງງ່າຍດາຍ.</p>

      <form @submit.prevent="handleLogin" class="w-full space-y-6">
        <div class="space-y-2">
          <label class="text-sm font-bold text-gray-700 ml-1">ທີ່ຢູ່ອີເມວ</label>
          <div class="relative">
            <Mail class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input v-model="email" type="email" placeholder="ອີເມວ..."
              class="input input-bordered w-full pl-12 bg-gray-50 border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl h-12"
              required />
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-bold text-gray-700 ml-1">ລະຫັດຜ່ານ</label>
          <div class="relative">
            <Lock class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input v-model="password" type="password" placeholder="ລະຫັດຜ່ານ..."
              class="input input-bordered w-full pl-12 bg-gray-50 border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl h-12"
              required />
          </div>
        </div>

        <div class="flex items-center justify-between">
          <label class="flex items-center gap-2 cursor-pointer group">
            <input type="checkbox" class="checkbox checkbox-sm checkbox-primary rounded" />
            <span class="text-sm text-gray-600 group-hover:text-primary transition-colors">ຈື່ຂ້ອຍໄວ້</span>
          </label>
          <NuxtLink to="/forgot-password" class="text-sm font-bold text-primary hover:underline">ລືມລະຫັດຜ່ານ?
          </NuxtLink>
        </div>

        <button type="submit"
          class="btn btn-primary w-full h-12 rounded-xl text-lg font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          :disabled="isLoading">
          <span v-if="isLoading" class="loading loading-spinner"></span>
          ເຂົ້າສູ່ລະບົບ
        </button>
      </form>

      <p class="mt-8 text-sm text-gray-500">
        © 2026 Cake Store Admin. Premium Bakery Solutions.
      </p>
    </div>
  </div>
</template>
