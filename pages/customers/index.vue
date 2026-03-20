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
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 30) return `${diffDays} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const isActive = (customer: any) => {
  if (!customer.updatedAt) return false;
  const lastActive = new Date(customer.updatedAt).getTime();
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  return lastActive > thirtyDaysAgo;
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
        <h1 class="text-3xl font-bold text-gray-900">Customers</h1>
        <p class="text-gray-500">Manage your loyal customers and their history.</p>
      </div>
      <div class="text-sm text-gray-400 font-medium bg-white px-4 py-2 rounded-xl border border-gray-100">
        <Users class="w-4 h-4 inline mr-1" />
        {{ customers.length }} total customers
      </div>
    </div>

    <!-- Search -->
    <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
      <div class="relative">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input v-model="searchQuery" type="text" placeholder="Search by name, email, phone or address..."
          class="input input-bordered w-full pl-12 pr-10 bg-gray-50 border-gray-200 focus:border-primary rounded-xl" />
        <button v-if="searchQuery" @click="searchQuery = ''"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors">
          <X class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="table w-full">
          <thead>
            <tr class="border-b border-gray-400 bg-gray-200">
              <th class="text-gray-400 font-semibold text-xs uppercase tracking-wider px-6 py-4">Name</th>
              <th class="text-gray-400 font-semibold text-xs uppercase tracking-wider px-6 py-4">Email</th>
              <th class="text-gray-400 font-semibold text-xs uppercase tracking-wider px-6 py-4 text-center">Phone</th>
              <th class="text-gray-400 font-semibold text-xs uppercase tracking-wider px-6 py-4 text-center">Role</th>
              <th class="text-gray-400 font-semibold text-xs uppercase tracking-wider px-6 py-4 text-center">Last Login
              </th>
              <th class="text-gray-400 font-semibold text-xs uppercase tracking-wider px-6 py-4 text-center">Status</th>
            </tr>
          </thead>

          <!-- Loading -->
          <tbody v-if="isLoading">
            <tr>
              <td colspan="5" class="text-center py-16">
                <span class="loading loading-spinner loading-lg text-primary"></span>
                <p class="mt-3 text-gray-400">Loading customers...</p>
              </td>
            </tr>
          </tbody>

          <!-- Empty -->
          <tbody v-else-if="paginatedCustomers.length === 0">
            <tr>
              <td colspan="5" class="text-center py-16">
                <Users class="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p class="text-gray-400 font-medium">{{ searchQuery ? 'No match found.' : 'No customers yet.' }}</p>
              </td>
            </tr>
          </tbody>

          <!-- Rows -->
          <tbody v-else>
            <tr v-for="customer in paginatedCustomers" :key="customer.id"
              class="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
              <!-- Name + Avatar -->
              <td class="px-6 py-5">
                <div class="flex items-center gap-4">
                  <div class="w-11 h-11 rounded-full overflow-hidden ring-2 flex-shrink-0"
                    :class="isActive(customer) ? 'ring-green-400' : 'ring-gray-200'">
                    <img :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${customer.name}`"
                      class="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p class="font-bold text-gray-900">{{ customer.name }}</p>
                    <p class="text-xs text-gray-400">{{ customer.address || 'No address' }}</p>
                  </div>
                </div>
              </td>
              <!-- Email -->
              <td class="px-6 py-5 text-sm text-gray-600">{{ customer.email }}</td>
              <!-- Phone -->
              <td class="px-6 py-5 text-sm text-gray-600 text-center">{{ customer.phone || 'N/A' }}</td>
              <!-- Address -->
              <td class="px-6 py-5 text-sm text-gray-600 text-center">{{ customer.role}}</td>
              <!-- Last Login -->
              <td class="px-6 py-5 text-sm text-gray-500 text-center">{{ getLastLogin(customer.updatedAt) }}</td>
              <!-- Status -->
              <td class="px-6 py-5 text-center">
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                  :class="isActive(customer) ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'">
                  <CheckCircle v-if="isActive(customer)" class="w-3.5 h-3.5" />
                  <XCircle v-else class="w-3.5 h-3.5" />
                  {{ isActive(customer) ? 'Active' : 'Inactive' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
        <p class="text-sm text-gray-400">
          Showing {{ ((currentPage - 1) * perPage) + 1 }} to {{ Math.min(currentPage * perPage,
            filteredCustomers.length) }} of {{ filteredCustomers.length }} entries
        </p>
        <div class="flex items-center gap-1">
          <button @click="currentPage = Math.max(1, currentPage - 1)" :disabled="currentPage === 1"
            class="btn btn-ghost btn-sm rounded-lg border border-gray-200 disabled:opacity-30">
            <ChevronLeft class="w-4 h-4" />
          </button>
          <button v-for="page in totalPages" :key="page" @click="currentPage = page"
            class="btn btn-sm rounded-lg min-w-[2.5rem] font-bold"
            :class="currentPage === page ? 'btn-primary' : 'btn-ghost border border-gray-200'">
            {{ page }}
          </button>
          <button @click="currentPage = Math.min(totalPages, currentPage + 1)" :disabled="currentPage === totalPages"
            class="btn btn-ghost btn-sm rounded-lg border border-gray-200 disabled:opacity-30">
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
