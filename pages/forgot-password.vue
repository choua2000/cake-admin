<script setup lang="ts">


definePageMeta({
    layout: false
});

const config = useRuntimeConfig();
const email = ref('');
const isLoading = ref(false);
const isSuccess = ref(false);
const errorMessage = ref('');

const handleForgotPassword = async () => {
    isLoading.value = true;
    errorMessage.value = '';
    try {
        const response: any = await $fetch(`${config.public.apiBase}/auth/forgot-password`, {
            method: 'POST',
            body: { email: email.value }
        });
        isSuccess.value = true;
    } catch (error: any) {
        console.error('Forgot password error:', error);
        errorMessage.value = error.data?.message || 'ບໍ່ສາມາດສົ່ງລະຫັດໄດ້, ກະລຸນາກວດສອບອີເມວຂອງທ່ານແລະລອງໃໝ່ອີກຄັ້ງ.';
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

            <div
                class="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary/30">
                <Cake class="w-10 h-10 text-white" />
            </div>

            <h1 class="text-3xl font-extrabold text-gray-900 mb-2">ລືມລະຫັດຜ່ານ</h1>
            <p class="text-gray-500 mb-8 text-center px-4">
                {{ isSuccess ? 'ກວດສອບອີເມວຂອງທ່ານສຳລັບລິ້ງປ່ຽນລະຫັດຜ່ານ.' : 'ປ້ອນອີເມວຂອງທ່ານເພື່ອຕັ້ງລະຫັດຜ່ານໃໝ່.' }}
            </p>

            <div v-if="isSuccess" class="w-full flex flex-col items-center">
                <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle class="w-8 h-8 text-green-500" />
                </div>
                <p class="text-sm text-gray-600 text-center mb-8">
                    ພວກເຮົາໄດ້ສົ່ງລິ້ງປ່ຽນລະຫັດຜ່ານໄປຍັງ <span class="font-bold text-gray-900">{{ email }}</span> ແລ້ວ.
                    ກະລຸນາ
                    ກວດສອບກ່ອງຂໍ້ຄວາມຂອງທ່ານແລະປະຕິບັດຕາມຄຳແນະນຳ.
                </p>
                <NuxtLink to="/login" class="btn btn-outline btn-primary w-full h-12 rounded-xl text-lg font-bold">
                    ກັບຄືນໜ້າເຂົ້າສູ່ລະບົບ
                </NuxtLink>
            </div>

            <form v-else @submit.prevent="handleForgotPassword" class="w-full space-y-6">
                <div v-if="errorMessage"
                    class="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium text-center border border-red-100">
                    {{ errorMessage }}
                </div>

                <div class="space-y-2">
                    <label class="text-sm font-bold text-gray-700 ml-1">ທີ່ຢູ່ອີເມວ</label>
                    <div class="relative">
                        <Mail class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input v-model="email" type="email" placeholder="admin@cakestore.com"
                            class="input input-bordered w-full pl-12 bg-gray-50 border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl h-12"
                            required />
                    </div>
                </div>

                <button type="submit"
                    class="btn btn-primary w-full h-12 rounded-xl text-lg font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    :disabled="isLoading">
                    <span v-if="isLoading" class="loading loading-spinner"></span>
                    ສົ່ງລິ້ງປ່ຽນລະຫັດຜ່ານ
                </button>

                <div class="text-center pt-4">
                    <NuxtLink to="/login"
                        class="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-primary transition-colors">
                        <ArrowLeft class="w-4 h-4" />
                        ກັບຄືນໜ້າເຂົ້າສູ່ລະບົບ
                    </NuxtLink>
                </div>
            </form>

            <p class="mt-8 text-sm text-gray-500">
                © 2026 Cake Store Admin. Premium Bakery Solutions.
            </p>
        </div>
    </div>
</template>
