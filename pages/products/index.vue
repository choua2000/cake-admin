<script setup lang="ts">
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  ChevronLeft,
  ChevronRight
} from 'lucide-vue-next';

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
});

const api = useApi();
const products = ref<any[]>([]);
const categories = ref<string[]>(['ທຸກໝວດໝູ່']);
const searchQuery = ref('');
const selectedCategory = ref('ທຸກໝວດໝູ່');
const isLoading = ref(true);

const fetchCategories = async () => {
  try {
    const response: any = await api.get('/categories');
    categories.value = ['ທຸກໝວດໝູ່', ...response.map((c: any) => c.name)];
  } catch (error) {
    console.error('Failed to fetch categories:', error);
  }
};

const fetchProducts = async () => {
  isLoading.value = true;
  try {
    const response: any = await api.get('/products');
    products.value = response.data;
  } catch (error) {
    console.error('Failed to fetch products:', error);
  } finally {
    isLoading.value = false;
  }
};

const filteredProducts = computed(() => {
  return products.value.filter((product: any) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesCategory = selectedCategory.value === 'ທຸກໝວດໝູ່' ||
      (product.category && product.category.name === selectedCategory.value) ||
      (product.category_name === selectedCategory.value);
    return matchesSearch && matchesCategory;
  });
});

const deleteProduct = async (id: number) => {
  if (confirm('ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບສິນຄ້ານີ້?')) {
    try {
      await api.delete(`/products/${id}`);
      products.value = products.value.filter((p: any) => p.id !== id);
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  }
};

const route = useRoute();
const router = useRouter();

const currentPage = computed(() => Number(route.query.page) || 1);
const itemsPerPage = 10; // Set to 5 items per page so you can easily see Page 2 and 3 with less test data!
const totalPages = computed(() => Math.max(1, Math.ceil(filteredProducts.value.length / itemsPerPage)));

watch([searchQuery, selectedCategory], () => {
  if (currentPage.value !== 1) {
    const q = { ...route.query };
    delete q.page;
    router.push({ query: q });
  }
});

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredProducts.value.slice(start, end);
});

onMounted(() => {
  fetchProducts();
  fetchCategories();
});

const getStatusClass = (stock: number) => {
  return stock > 0 ? 'badge-success' : 'badge-error';
};
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">ສິນຄ້າ</h1>
        <p class="text-gray-500">ຈັດການສິນຄ້າຄົງຄັງ ແລະ ລາຄາໃນຮ້ານຂອງທ່ານ.</p>
      </div>
      <NuxtLink to="/products/create" class="btn btn-primary gap-2 h-12 rounded-xl">
        <Plus class="w-5 h-5" />
        ເພີ່ມສິນຄ້າ
      </NuxtLink>
    </div>

    <!-- Filters -->
    <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
      <div class="relative flex-1">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input v-model="searchQuery" type="text" placeholder="ຄົ້ນຫາສິນຄ້າ..."
          class="input input-bordered w-full pl-12 bg-gray-50 border-gray-200 focus:border-primary rounded-xl" />
      </div>
      <div class="flex gap-4">
        <select v-model="selectedCategory"
          class="select select-bordered bg-gray-50 border-gray-200 focus:border-primary rounded-xl">
          <option v-for="cat in categories" :key="cat">{{ cat }}</option>
        </select>
        <button class="btn btn-ghost bg-gray-50 border border-gray-200 rounded-xl gap-2 h-12">
          <Filter class="w-5 h-5" />
          ຕົວກອງເພີ່ມເຕີມ
        </button>
      </div>
    </div>

    <!-- Product Table -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="table w-full">
          <thead>
            <tr class="bg-gray-50/50 bg-gray-300">
              <th class="text-gray-500 font-semibold px-6 py-4">ສິນຄ້າ</th>
              <th class="text-gray-500 font-semibold px-6 py-4">ໝວດໝູ່</th>
              <th class="text-gray-500 font-semibold px-6 py-4">ລາຄາ</th>
              <th class="text-gray-500 font-semibold px-6 py-4">ຈຳນວນ</th>
              <th class="text-gray-500 font-semibold px-6 py-4">ສະຖານະ</th>
              <th class="text-gray-500 font-semibold px-6 py-4 text-right">ການຈັດການ</th>
            </tr>
          </thead>
          <tbody v-if="!isLoading">
            <tr v-for="product in paginatedProducts" :key="product.id"
              class="hover:bg-gray-50/5 transition-colors group">

              <td class="px-6 py-4">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    <img :src="product.image_url" :alt="product.name" class="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p class="font-bold text-gray-900 line-clamp-1">{{ product.name }}</p>
                    <p class="text-xs text-gray-400 font-mono">ID: #PROD-{{ product.id }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 text-gray-600 font-medium">{{ product.category?.name || product.category_name ||
                'N/A' }}</td>
              <td class="px-6 py-4 font-bold text-gray-900">${{ parseFloat(product.price).toFixed(2) }}</td>
              <td class="px-6 py-4">
                <span class="font-semibold"
                  :class="product.stock_qty === 0 ? 'text-red-500' : product.stock_qty < 10 ? 'text-orange-500' : 'text-gray-600'">
                  {{ product.stock_qty }} units
                </span>
              </td>
              <td class="px-6 py-4">
                <span class="badge badge-sm"
                  :class="product.stock_qty > 0 ? 'badge-success text-white' : 'badge-error text-white'">
                  {{ product.stock_qty > 0 ? 'ມີສິນຄ້າ' : 'ສິນຄ້າໝົດ' }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <NuxtLink :to="`/products/${product.id}`" class="btn btn-ghost btn-sm text-blue-500 hover:bg-blue-50">
                    <Edit class="w-4 h-4" />
                  </NuxtLink>
                  <button @click="deleteProduct(product.id)" class="btn btn-ghost btn-sm text-red-500 hover:bg-red-50">
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr>
              <td colspan="7" class="text-center py-12">
                <span class="loading loading-spinner loading-lg text-primary"></span>
                <p class="mt-2 text-gray-400">ກຳລັງໂຫຼດສິນຄ້າ...</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="filteredProducts.length > 0"
        class="p-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
        <p class="text-sm text-gray-500 italic">
          Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage,
            filteredProducts.length) }} of {{ filteredProducts.length }} products
        </p>
        <div class="flex gap-2">

          <NuxtLink v-if="currentPage > 1"
            :to="{ query: { ...route.query, page: currentPage - 1 === 1 ? undefined : currentPage - 1 } }"
            class="btn btn-ghost btn-sm rounded-lg border border-gray-200">
            <ChevronLeft class="w-4 h-4" />
          </NuxtLink>
          <button v-else disabled class="btn btn-ghost btn-sm rounded-lg border border-gray-200 opacity-50">
            <ChevronLeft class="w-4 h-4" />
          </button>

          <NuxtLink v-for="page in totalPages" :key="page"
            :to="{ query: { ...route.query, page: page === 1 ? undefined : page } }" :class="[
              'btn btn-sm rounded-lg px-4',
              currentPage === page ? 'btn-primary' : 'btn-ghost border border-gray-200'
            ]">
            {{ page }}
          </NuxtLink>

          <NuxtLink v-if="currentPage < totalPages" :to="{ query: { ...route.query, page: currentPage + 1 } }"
            class="btn btn-ghost btn-sm rounded-lg border border-gray-200">
            <ChevronRight class="w-4 h-4" />
          </NuxtLink>
          <button v-else disabled class="btn btn-ghost btn-sm rounded-lg border border-gray-200 opacity-50">
            <ChevronRight class="w-4 h-4" />
          </button>

        </div>
      </div>
    </div>
  </div>
</template>
