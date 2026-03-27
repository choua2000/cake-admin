<script setup lang="ts">
import {
  Search,
  X,
  Users,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle
} from 'lucide-vue-next';

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
});

const api = useApi();
const customers = ref<any[]>([]);
const isLoading = ref(true);
const searchQuery = ref('');

const fetchCustomers = async () => {
  isLoading.value = true;
  try {
    const response: any = await api.get('/users/getall');
    customers.value = response.data || [];
  } catch (error) {
    console.error('Failed to fetch customers:', error);
  } finally {
    isLoading.value = false;
  }
};

const filteredCustomers = computed(() => {
  const q = searchQuery.value.toLowerCase();
  if (!q) return customers.value;
  return customers.value.filter(c =>
    c.name?.toLowerCase().includes(q) ||
    c.email?.toLowerCase().includes(q) ||
    c.phone?.includes(q) ||
    c.address?.toLowerCase().includes(q)
  );
});

const getLastLogin = (dateStr: string) => {
  if (!dateStr) return 'N/A';
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'ມື້ນີ້';
  if (diffDays === 1) return 'ມື້ວານນີ້';
  if (diffDays < 30) return `${diffDays} ມື້ກ່ອນ`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const toggleStatus = async (customer: any) => {
  try {
    const newStatus = !customer.isActive;
    await api.put(`/users/update-status/${customer.id}`, { isActive: newStatus });
    customer.isActive = newStatus;
  } catch (error) {
    console.error('Failed to update status:', error);
  }
};

// Pagination
const currentPage = ref(1);
const perPage = 5;
const totalPages = computed(() => Math.ceil(filteredCustomers.value.length / perPage));
const paginatedCustomers = computed(() => {
  const start = (currentPage.value - 1) * perPage;
  return filteredCustomers.value.slice(start, start + perPage);
});

watch(searchQuery, () => { currentPage.value = 1; });

onMounted(() => {
  fetchCustomers();
});
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">ລູກຄ້າ</h1>
        <p class="text-gray-600">ຈັດການລູກຄ້າຂອງທ່ານ.</p>
      </div>
      <div class="text-sm text-gray-600 font-medium bg-white px-4 py-2 rounded-xl border border-gray-100">
        <Users class="w-4 h-4 inline mr-1" />
        ລູກຄ້າທັງໝົດ {{ customers.length }} ຄົນ
      </div>
    </div>

    <!-- Search -->
    <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
      <div class="relative">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input v-model="searchQuery" type="text" placeholder="ຄົ້ນຫາຕາມຊື່, ອີເມວ, ເບີໂທ ຫຼື ທີ່ຢູ່..."
          class="input input-bordered w-full pl-12 pr-10 bg-gray-50 border-gray-200 focus:border-primary rounded-xl" />
        <button v-if="searchQuery" @click="searchQuery = ''"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors">
          <X class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="space-y-4">
      <!-- Loading State -->
      <div v-if="isLoading" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
        <span class="loading loading-spinner loading-lg text-primary"></span>
        <p class="mt-4 text-gray-500 font-medium">ກຳລັງໂຫຼດຂໍ້ມູນລູກຄ້າ...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="paginatedCustomers.length === 0"
        class="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
        <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users class="w-8 h-8 text-gray-300" />
        </div>
        <h3 class="text-lg font-bold text-gray-900">ບໍ່ພົບຂໍ້ມູນ</h3>
        <p class="text-gray-500">{{ searchQuery ? `ບໍ່ພົບຂໍ້ມູນທີ່ຄົ້ນຫາ "${searchQuery}"` :
          'ຍັງບໍ່ມີລູກຄ້າໃນລະບົບເທື່ອ' }}</p>
      </div>

      <!-- Desktop Table View -->
      <div v-else class="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="table w-full">
            <thead>
              <tr class="bg-gray-50/50">
                <th class="px-6 py-4 text-gray-600 font-bold text-xs uppercase tracking-wider">ລູກຄ້າ</th>
                <th class="px-6 py-4 text-gray-600 font-bold text-xs uppercase tracking-wider text-center">ເບີໂທ</th>
                <th class="px-6 py-4 text-gray-600 font-bold text-xs uppercase tracking-wider text-center">ບົດບາດ</th>
                <th class="px-6 py-4 text-gray-600 font-bold text-xs uppercase tracking-wider text-center">
                  ເຂົ້າສູ່ລະບົບຫຼ້າສຸດ</th>
                <th class="px-6 py-4 text-gray-600 font-bold text-xs uppercase tracking-wider text-center">ສະຖານະ</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="customer in paginatedCustomers" :key="customer.id"
                class="hover:bg-gray-50/30 transition-colors">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-gray-100">
                      <img :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${customer.name}`"
                        class="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p class="font-bold text-gray-900">{{ customer.name }}</p>
                      <p class="text-xs text-gray-500">{{ customer.email }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-600 text-center">{{ customer.phone || '-' }}</td>
                <td class="px-6 py-4 text-center">
                  <span
                    class="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wider">
                    {{ customer.role }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500 text-center">{{ getLastLogin(customer.updatedAt) }}</td>
                <td class="px-6 py-4 text-center">
                  <button @click="toggleStatus(customer)"
                    class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all hover:scale-105 active:scale-95"
                    :class="customer.isActive ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-red-50 text-red-500 hover:bg-red-100'">
                    <CheckCircle v-if="customer.isActive" class="w-3.5 h-3.5" />
                    <XCircle v-else class="w-3.5 h-3.5" />
                    {{ customer.isActive ? 'ໃຊ້ງານຢູ່' : 'ປິດໃຊ້ງານ' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Mobile Card View -->
      <div v-if="!isLoading && paginatedCustomers.length > 0" class="md:hidden space-y-3">
        <div v-for="customer in paginatedCustomers" :key="customer.id"
          class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 active:bg-gray-50 transition-colors">
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-full overflow-hidden ring-2 ring-gray-50 shadow-sm flex-shrink-0">
                <img :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${customer.name}`"
                  class="w-full h-full object-cover" />
              </div>
              <div>
                <h3 class="font-bold text-gray-900 leading-none mb-1">{{ customer.name }}</h3>
                <p class="text-xs text-gray-500">{{ customer.email }}</p>
                <div class="mt-1 flex items-center gap-2">
                  <span
                    class="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/5 px-1.5 py-0.5 rounded">
                    {{ customer.role }}
                  </span>
                  <span class="text-[10px] text-gray-400 capitalize">{{ getLastLogin(customer.updatedAt) }}</span>
                </div>
              </div>
            </div>
            <button @click="toggleStatus(customer)" class="p-2 rounded-xl transition-colors"
              :class="customer.isActive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'">
              <CheckCircle v-if="customer.isActive" class="w-5 h-5" />
              <XCircle v-else class="w-5 h-5" />
            </button>
          </div>

          <div class="grid grid-cols-2 gap-4 pt-3 border-t border-gray-50">
            <div>
              <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">ເບີໂທລະສັບ</p>
              <p class="text-sm font-medium text-gray-700">{{ customer.phone || 'ບໍ່ມີຂໍ້ມູນ' }}</p>
            </div>
            <div>
              <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">ສະຖານະ</p>
              <p class="text-sm font-bold" :class="customer.isActive ? 'text-green-600' : 'text-red-500'">
                {{ customer.isActive ? 'ເປີດໃຊ້ງານ' : 'ປິດໃຊ້ງານ' }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div
        class="bg-white px-4 md:px-6 py-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p class="text-sm text-gray-500 order-2 sm:order-1">
          ສະແດງ {{ ((currentPage - 1) * perPage) + 1 }} - {{ Math.min(currentPage * perPage, filteredCustomers.length)
          }} ຈາກ {{ filteredCustomers.length }}
        </p>
        <div class="flex items-center gap-1 order-1 sm:order-2">
          <button @click="currentPage = Math.max(1, currentPage - 1)" :disabled="currentPage === 1"
            class="p-2 rounded-lg border border-gray-100 hover:bg-gray-50 disabled:opacity-30 disabled:pointer-events-none transition-colors">
            <ChevronLeft class="w-5 h-5" />
          </button>

          <div class="flex items-center px-2">
            <span class="text-sm font-bold text-gray-900">ໜ້າ {{ currentPage }} / {{ totalPages }}</span>
          </div>

          <button @click="currentPage = Math.min(totalPages, currentPage + 1)" :disabled="currentPage === totalPages"
            class="p-2 rounded-lg border border-gray-100 hover:bg-gray-50 disabled:opacity-30 disabled:pointer-events-none transition-colors">
            <ChevronRight class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
