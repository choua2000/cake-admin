<script setup lang="ts">
import {
  ArrowLeft,
  Upload,
  X,
  Save,
  Trash2
} from 'lucide-vue-next';

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
});

const api = useApi();
const isLoading = ref(false);

const form = reactive({
  name: '',
  price: '',
  category_id: '',
  stock_qty: '',
  description: '',
});

const categories = ref<any[]>([]);

const fetchCategories = async () => {
  try {
    const response: any = await api.get('/categories');
    categories.value = response.data;
  } catch (error) {
    console.error('Failed to fetch categories:', error);
  }
};

onMounted(() => {
  fetchCategories();
});

const imagePreview = ref<string | null>(null);
const selectedFile = ref<File | null>(null);

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

    await api.post('/products', formData);
    navigateTo('/products');
    
  } catch (error) {
    console.error('Failed to create product:', error);
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
        <h1 class="text-3xl font-bold text-gray-900">Add New Product</h1>
        <p class="text-gray-500">Create a new sweet masterpiece for your store.</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Image Upload Area -->
      <div class="lg:col-span-1">
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 class="text-lg font-bold text-gray-900 mb-4">Product Image</h2>
          <div
            class="relative aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden transition-all hover:border-primary group"
            :class="[imagePreview ? 'border-solid border-primary' : '']">
            <template v-if="!imagePreview">
              <Upload class="w-10 h-10 text-gray-300 group-hover:text-primary mb-2 transition-colors" />
              <p class="text-sm text-gray-500 font-medium">Click to upload</p>
              <input type="file" @change="handleImageUpload" class="absolute inset-0 opacity-0 cursor-pointer"
                accept="image/*" />
            </template>
            <template v-else>
              <img :src="imagePreview" alt="Preview" class="w-full h-full object-cover" />
              <button @click="imagePreview = null"
                class="absolute top-2 right-2 p-1.5 bg-white shadow-lg rounded-full text-red-500 hover:scale-110 transition-transform">
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
              <textarea v-model="form.description" rows="4" placeholder="Tell us about this delicious creation..."
                class="textarea textarea-bordered w-full bg-gray-50 border-gray-200 focus:border-primary rounded-xl"></textarea>
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex items-center justify-end gap-4">
          <button @click="navigateTo('/products')"
            class="btn btn-ghost border-transparent text-gray-500 hover:bg-gray-100 rounded-xl px-8 h-12">Cancel</button>
          <button @click="submitProduct" type="button"
            class="btn btn-primary rounded-xl px-8 h-12 gap-2 shadow-lg shadow-primary/20" :disabled="isLoading">
            <span v-if="isLoading" class="loading loading-spinner"></span>
            <Save class="w-5 h-5" />
            Save Product
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
