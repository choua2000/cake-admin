<script setup lang="ts">
import {
    ArrowLeft,
    Upload,
    X,
    Save,
    Trash2,
    CheckCircle,
    AlertCircle
} from 'lucide-vue-next';

definePageMeta({
    layout: 'admin',
    middleware: 'auth'
});

const route = useRoute();
const api = useApi();
const config = useRuntimeConfig();
const isLoading = ref(false);
const isFetching = ref(true);

// Toast notification
const toast = reactive({
    show: false,
    message: '',
    type: 'success' as 'success' | 'error'
});

const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    toast.show = true;
    toast.message = message;
    toast.type = type;
    setTimeout(() => { toast.show = false; }, 3000);
};

// Build server base URL (e.g., http://localhost:5000)
const serverBase = config.public.apiBase.replace(/\/api$/, '');

const form = reactive({
    name: '',
    price: '',
    category_id: '',
    stock_qty: '',
    description: '',
});

const categories = ref<any[]>([]);
const imagePreview = ref<string | null>(null);
const selectedFile = ref<File | null>(null);

const getImageUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${serverBase}${path}`;
};

const fetchCategories = async () => {
    try {
        const response: any = await api.get('/categories');
        categories.value = response.data;
    } catch (error) {
        console.error('Failed to fetch categories:', error);
    }
};

const fetchProduct = async () => {
    isFetching.value = true;
    try {
        const response: any = await api.get(`/products/${route.params.id}`);
        const product = response.data || response;
        form.name = product.name;
        form.price = product.price?.toString() || '';
        form.category_id = product.category_id;
        form.stock_qty = product.stock_qty?.toString() || '';
        form.description = product.description || '';
        imagePreview.value = getImageUrl(product.image_url);
    } catch (error) {
        console.error('Failed to fetch product:', error);
        alert('Failed to load product details.');
        navigateTo('/products');
    } finally {
        isFetching.value = false;
    }
};

onMounted(async () => {
    await Promise.all([
        fetchCategories(),
        fetchProduct()
    ]);
});

const handleImageUpload = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files[0]) {
        selectedFile.value = target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.value = e.target?.result as string;
        };
        reader.readAsDataURL(target.files[0]);
    }
};

const submitProduct = async () => {
    isLoading.value = true;
    try {
        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('price', form.price);
        formData.append('category_id', form.category_id);
        formData.append('description', form.description);
        formData.append('stock_qty', form.stock_qty);
        if (selectedFile.value) {
            formData.append('image', selectedFile.value);
        }

        await api.put(`/products/${route.params.id}`, formData);
        showToast('Product updated successfully!', 'success');
        setTimeout(() => navigateTo('/products'), 1500);
    } catch (error) {
        console.error('Failed to update product:', error);
        showToast('Failed to update product. Please try again.', 'error');
    } finally {
        isLoading.value = false;
    }
};
</script>

<template>
    <div class="space-y-6 max-w-4xl mx-auto">
        <div class="flex items-center gap-4">
            <NuxtLink to="/products" class="btn btn-ghost btn-circle">
                <ArrowLeft class="w-6 h-6" />
            </NuxtLink>
            <div>
                <h1 class="text-3xl font-bold text-gray-900">Edit Product</h1>
                <p class="text-gray-500">Update your sweet masterpiece and its details.</p>
            </div>
        </div>

        <div v-if="isFetching" class="flex flex-col items-center justify-center py-20">
            <span class="loading loading-spinner loading-lg text-primary"></span>
            <p class="mt-4 text-gray-500">Loading product details...</p>
        </div>

        <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Image Upload Area -->
            <div class="lg:col-span-1">
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 class="text-lg font-bold text-gray-900 mb-4">Product Image</h2>
                    <div class="relative aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden transition-all hover:border-primary group"
                        :class="[imagePreview ? 'border-solid border-primary' : '']">
                        <template v-if="!imagePreview">
                            <Upload class="w-10 h-10 text-gray-300 group-hover:text-primary mb-2 transition-colors" />
                            <p class="text-sm text-gray-500 font-medium">Click to upload</p>
                            <input type="file" @change="handleImageUpload"
                                class="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                        </template>
                        <template v-else>
                            <img :src="imagePreview" alt="Preview" class="w-full h-full object-cover" />
                            <div
                                class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <p class="text-white text-sm font-bold">Change Image</p>
                                <input type="file" @change="handleImageUpload"
                                    class="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                            </div>
                            <button @click="imagePreview = null; selectedFile = null"
                                class="absolute top-2 right-2 p-1.5 bg-white shadow-lg rounded-full text-red-500 hover:scale-110 transition-transform z-10">
                                <X class="w-4 h-4" />
                            </button>
                        </template>
                    </div>
                    <p class="mt-4 text-xs text-gray-400 leading-relaxed text-center">
                        Upload a high-quality 1:1 image. Max size 2MB (JPG, PNG).
                    </p>
                </div>
            </div>

            <!-- Product Form -->
            <div class="lg:col-span-2 space-y-8">
                <div class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div class="sm:col-span-2 space-y-2">
                            <label class="text-sm font-bold text-gray-700 ml-1">Product Name</label>
                            <input v-model="form.name" type="text" placeholder="Ex. Triple Chocolate Layer Cake"
                                class="input input-bordered w-full bg-gray-50 border-gray-200 focus:border-primary rounded-xl" />
                        </div>

                        <div class="space-y-2">
                            <label class="text-sm font-bold text-gray-700 ml-1">Category</label>
                            <select v-model="form.category_id"
                                class="select select-bordered w-full bg-gray-50 border-gray-200 focus:border-primary rounded-xl">
                                <option disabled value="">Select category</option>
                                <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                            </select>
                        </div>

                        <div class="space-y-2">
                            <label class="text-sm font-bold text-gray-700 ml-1">Price ($)</label>
                            <input v-model="form.price" type="number" placeholder="0.00"
                                class="input input-bordered w-full bg-gray-50 border-gray-200 focus:border-primary rounded-xl" />
                        </div>

                        <div class="space-y-2">
                            <label class="text-sm font-bold text-gray-700 ml-1">Stock Level</label>
                            <input v-model="form.stock_qty" type="number" placeholder="0"
                                class="input input-bordered w-full bg-gray-50 border-gray-200 focus:border-primary rounded-xl" />
                        </div>

                        <div class="sm:col-span-2 space-y-2">
                            <label class="text-sm font-bold text-gray-700 ml-1">Description</label>
                            <textarea v-model="form.description" rows="4"
                                placeholder="Tell us about this delicious creation..."
                                class="textarea textarea-bordered w-full bg-gray-50 border-gray-200 focus:border-primary rounded-xl"></textarea>
                        </div>
                    </div>
                </div>

                <!-- Form Actions -->
                <div class="flex items-center justify-end gap-4">
                    <NuxtLink to="/products"
                        class="btn btn-ghost border-transparent text-gray-500 hover:bg-gray-100 rounded-xl px-8 h-12 flex items-center">
                        Cancel</NuxtLink>
                    <button @click="submitProduct" type="button"
                        class="btn btn-primary rounded-xl px-8 h-12 gap-2 shadow-lg shadow-primary/20"
                        :disabled="isLoading">
                        <span v-if="isLoading" class="loading loading-spinner"></span>
                        <Save class="w-5 h-5" />
                        Update Product
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Toast Notification -->
    <Transition enter-active-class="transition-all duration-300 ease-out" enter-from-class="translate-y-4 opacity-0"
        enter-to-class="translate-y-0 opacity-100" leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="translate-y-0 opacity-100" leave-to-class="-translate-y-2 opacity-0">
        <div v-if="toast.show" class="fixed top-6 right-6 z-[100] max-w-sm">
            <div class="flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border backdrop-blur-sm" :class="[
                toast.type === 'success'
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : 'bg-red-50 border-red-200 text-red-800'
            ]">
                <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    :class="toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'">
                    <CheckCircle v-if="toast.type === 'success'" class="w-5 h-5 text-white" />
                    <AlertCircle v-else class="w-5 h-5 text-white" />
                </div>
                <p class="font-bold text-sm">{{ toast.message }}</p>
                <button @click="toast.show = false" class="ml-auto opacity-50 hover:opacity-100 transition-opacity">
                    <X class="w-4 h-4" />
                </button>
            </div>
        </div>
    </Transition>
</template>
