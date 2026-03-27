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
    <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-4">
      <div class="relative flex-1">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input v-model="searchQuery" type="text" placeholder="ຄົ້ນຫາສິນຄ້າ..."
          class="input input-bordered w-full pl-12 bg-gray-50 border-gray-200 focus:border-primary rounded-xl h-12" />
      </div>
      <div class="flex flex-col sm:flex-row gap-3">
        <select v-model="selectedCategory"
          class="select select-bordered bg-gray-50 border-gray-200 focus:border-primary rounded-xl h-12">
          <option v-for="cat in categories" :key="cat">{{ cat }}</option>
        </select>
        <button class="btn btn-ghost bg-gray-50 border border-gray-200 rounded-xl gap-2 h-12">
          <Filter class="w-5 h-5" />
          ຕົວກອງ
        </button>
      </div>
    </div>

    <!-- Product Content -->
    <div class="space-y-4">
      <!-- Desktop Table -->
      <div class="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="table w-full">
            <thead>
              <tr class="bg-gray-50/50">
                <th class="text-gray-500 font-bold text-xs uppercase tracking-wider px-6 py-4">ສິນຄ້າ</th>
                <th class="text-gray-500 font-bold text-xs uppercase tracking-wider px-6 py-4 text-center">ໝວດໝູ່</th>
                <th class="text-gray-500 font-bold text-xs uppercase tracking-wider px-6 py-4 text-center">ລາຄາ</th>
                <th class="text-gray-500 font-bold text-xs uppercase tracking-wider px-6 py-4 text-center">ຈຳນວນ</th>
                <th class="text-gray-500 font-bold text-xs uppercase tracking-wider px-6 py-4 text-center">ສະຖານະ</th>
                <th class="text-gray-500 font-bold text-xs uppercase tracking-wider px-6 py-4 text-right">ຈັດການ</th>
              </tr>
            </thead>
            <tbody v-if="!isLoading">
              <tr v-for="product in paginatedProducts" :key="product.id"
                class="hover:bg-gray-50/30 transition-colors group">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 ring-1 ring-gray-100">
                      <img :src="product.image_url" :alt="product.name" class="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p class="font-bold text-gray-900 line-clamp-1">{{ product.name }}</p>
                      <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest">ID: #{{ product.id }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 text-gray-600 font-medium text-center text-sm">
                  {{ product.category?.name || product.category_name || 'N/A' }}
                </td>
                <td class="px-6 py-4 font-bold text-gray-900 text-center text-sm">
                  ₭{{ parseFloat(product.price).toLocaleString() }}
                </td>
                <td class="px-6 py-4 text-center">
                  <span class="text-sm font-semibold"
                    :class="product.stock_qty === 0 ? 'text-red-500' : product.stock_qty < 10 ? 'text-orange-500' : 'text-gray-600'">
                    {{ product.stock_qty }} ຊຸດ
                  </span>
                </td>
                <td class="px-6 py-4 text-center">
                  <span class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                    :class="product.stock_qty > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'">
                    {{ product.stock_qty > 0 ? 'ມີສິນຄ້າ' : 'ໝົດແລ້ວ' }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center justify-end gap-1 px-2">
                    <NuxtLink :to="`/products/${product.id}`"
                      class="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit class="w-4 h-4" />
                    </NuxtLink>
                    <button @click="deleteProduct(product.id)"
                      class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
            <tbody v-else>
              <tr>
                <td colspan="6" class="text-center py-16">
                  <span class="loading loading-spinner loading-lg text-primary"></span>
                  <p class="mt-4 text-gray-400 font-medium">ກຳລັງໂຫຼດຂໍ້ມູນສິນຄ້າ...</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Mobile Cards -->
      <div v-if="!isLoading" class="md:hidden space-y-3">
        <div v-for="product in paginatedProducts" :key="product.id"
          class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 active:bg-gray-50 transition-colors">
          <div class="flex gap-4 mb-4">
            <div class="w-20 h-20 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0 ring-1 ring-gray-100">
              <img :src="product.image_url" :alt="product.name" class="w-full h-full object-cover" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex justify-between items-start gap-2">
                <h3 class="font-bold text-gray-900 leading-tight mb-1 line-clamp-2">{{ product.name }}</h3>
                <div class="dropdown dropdown-end">
                  <button tabindex="0" class="p-1 hover:bg-gray-100 rounded-lg">
                    <MoreVertical class="w-5 h-5 text-gray-400" />
                  </button>
                  <ul tabindex="0"
                    class="dropdown-content z-[1] menu p-2 shadow-xl bg-base-100 rounded-xl w-40 mt-1 border border-gray-100">
                    <li>
                      <NuxtLink :to="`/products/${product.id}`" class="text-blue-500 font-bold">
                        <Edit class="w-4 h-4" /> ແກ້ໄຂ
                      </NuxtLink>
                    </li>
                    <li><button @click="deleteProduct(product.id)" class="text-red-500 font-bold">
                        <Trash2 class="w-4 h-4" /> ລຶບ
                      </button></li>
                  </ul>
                </div>
              </div>
              <p class="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">₭{{
                parseFloat(product.price).toLocaleString() }} • {{ product.category?.name || 'ທົ່ວໄປ' }}</p>
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                  :class="product.stock_qty > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'">
                  {{ product.stock_qty > 0 ? 'ມີສິນຄ້າ' : 'ໝົດແລ້ວ' }}
                </span>
                <span class="text-xs font-bold" :class="product.stock_qty === 0 ? 'text-red-500' : 'text-gray-500'">
                  ຄົງເຫຼືອ: {{ product.stock_qty }}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div v-if="paginatedProducts.length === 0" class="bg-white p-12 rounded-2xl border border-gray-100 text-center">
          <Filter class="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <p class="text-gray-500 font-medium">ບໍ່ພົບສິນຄ້າທີ່ທ່ານຄົ້ນຫາ</p>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="filteredProducts.length > 0"
        class="bg-white px-4 md:px-6 py-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p class="text-sm text-gray-500 order-2 sm:order-1">
          ສະແດງ {{ (currentPage - 1) * itemsPerPage + 1 }} - {{ Math.min(currentPage * itemsPerPage,
            filteredProducts.length) }} จาก {{ filteredProducts.length }}
        </p>
        <div class="flex gap-2 order-1 sm:order-2">
          <NuxtLink v-if="currentPage > 1"
            :to="{ query: { ...route.query, page: currentPage - 1 === 1 ? undefined : currentPage - 1 } }"
            class="p-2 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
            <ChevronLeft class="w-5 h-5" />
          </NuxtLink>
          <div v-else class="p-2 rounded-lg border border-gray-100 opacity-30 pointer-events-none">
            <ChevronLeft class="w-5 h-5" />
          </div>

          <div class="flex items-center px-4 font-bold text-gray-900 border border-gray-100 rounded-lg">
            {{ currentPage }} / {{ totalPages }}
          </div>

          <NuxtLink v-if="currentPage < totalPages" :to="{ query: { ...route.query, page: currentPage + 1 } }"
            class="p-2 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
            <ChevronRight class="w-5 h-5" />
          </NuxtLink>
          <div v-else class="p-2 rounded-lg border border-gray-100 opacity-30 pointer-events-none">
            <ChevronRight class="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
