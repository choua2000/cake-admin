<script setup lang="ts">
import {
  Search,
  Eye,
  Download,
  ChevronLeft,
  ChevronRight,
  Filter,
  Calendar,
  X,
  Cake
} from 'lucide-vue-next';

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
});

const api = useApi();
const orders = ref<any[]>([]);
const isLoading = ref(true);
const selectedOrder = ref<any>(null);
const isModalOpen = ref(false);
const isUpdatingStatus = ref(false);

const searchQuery = ref('');
const dateFilter = ref('');
const statusFilter = ref('');
const isStatusDropdownOpen = ref(false);

const fetchOrders = async () => {
  isLoading.value = true;
  try {
    const response: any = await api.get('/orders');
    // Using the 'data' property from the response as shown in the JSON
    orders.value = response.data || [];
  } catch (error) {
    console.error('Failed to fetch orders:', error);
  } finally {
    isLoading.value = false;
  }
};

const filteredOrders = computed(() => {
  return orders.value.filter(order => {
    // Search filter: matches ID, customer name, email, phone, status, payment
    const q = searchQuery.value.toLowerCase();
    const matchesSearch = !q ||
      order.id.toString().includes(q) ||
      order.user?.name?.toLowerCase().includes(q) ||
      order.user?.email?.toLowerCase().includes(q) ||
      order.user?.phone?.includes(q) ||
      order.status?.toLowerCase().includes(q) ||
      order.payment_method?.toLowerCase().includes(q);

    // Date filter
    let matchesDate = true;
    if (dateFilter.value) {
      const orderDate = new Date(order.order_date).toISOString().split('T')[0];
      matchesDate = orderDate === dateFilter.value;
    }

    // Status filter
    const matchesStatus = !statusFilter.value ||
      order.status?.toLowerCase() === statusFilter.value.toLowerCase();

    return matchesSearch && matchesDate && matchesStatus;
  });
});

const updateStatus = async (id: number, status: string) => {
  // ... existing code ...
  isUpdatingStatus.value = true;
  try {
    await api.put(`/orders/${id}/status`, { status });
    await fetchOrders();
    if (selectedOrder.value && selectedOrder.value.id === id) {
      selectedOrder.value.status = status;
    }
  } catch (error) {
    console.error('Failed to update order status:', error);
  } finally {
    isUpdatingStatus.value = false;
  }
};

const viewOrderDetails = (order: any) => {
  selectedOrder.value = { ...order };
  isModalOpen.value = true;
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

onMounted(() => {
  fetchOrders();
});

const getStatusBadge = (status: string) => {
  const s = status?.toLowerCase();
  switch (s) {
    case 'completed': return 'badge-success text-white';
    case 'processing': return 'badge-info text-white';
    case 'pending': return 'badge-warning text-white';
    case 'cancelled': return 'badge-error text-white';
    default: return 'badge-ghost';
  }
};

const getPaymentBadge = (payment: string) => {
  const p = payment?.toLowerCase();
  switch (p) {
    case 'paid':
    case 'cash': return 'text-green-600 bg-green-50 px-2 py-1 rounded-lg';
    case 'unpaid': return 'text-orange-600 bg-orange-50 px-2 py-1 rounded-lg';
    case 'refunded': return 'text-red-600 bg-red-50 px-2 py-1 rounded-lg';
    default: return 'text-gray-600';
  }
};

const exportCSV = () => {
  const data = filteredOrders.value;
  if (data.length === 0) return;

  const headers = ['Order ID', 'Customer', 'Email', 'Phone', 'Date', 'Status', 'Payment', 'Items', 'Total (LKR)'];

  const rows = data.map((order: any) => [
    order.id,
    order.user?.name,
    order.user?.email,
    order.user?.phone,
    formatDate(order.order_date),
    order.status,
    order.payment_method,
    order.items?.length,
    parseFloat(order.total_amount).toFixed(2)
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row: any[]) => row.map((cell: any) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const today = new Date().toISOString().split('T')[0];
  link.download = `orders_${today}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Orders</h1>
        <p class="text-gray-500">Track and manage customer orders efficiently.</p>
      </div>
      <div class="flex gap-2">
        <button @click="exportCSV" class="btn btn-success border-gray-200 text-white gap-2 h-12 rounded-xl px-6">
          <Download class="w-5 h-5" />
          Export CSV
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
      <div class="relative flex-1">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input v-model="searchQuery" type="text" placeholder="Search by ID, customer, email, status..."
          class="input input-bordered w-full pl-12 pr-10 bg-gray-50 border-gray-200 focus:border-primary rounded-xl" />
        <button v-if="searchQuery" @click="searchQuery = ''"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors">
          <X class="w-4 h-4" />
        </button>
      </div>
      <div class="flex gap-4">
        <div class="relative group">
          <Calendar
            class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-primary transition-colors z-20 pointer-events-none" />
          <input type="date" v-model="dateFilter"
            class="input input-bordered h-12 rounded-xl bg-gray-50 border-gray-200 focus:border-primary pl-12 pr-4 text-sm font-medium text-gray-600 hover:border-gray-300 transition-all z-10 relative cursor-pointer" />
          <button v-if="dateFilter" @click="dateFilter = ''"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 z-30">
            <X class="w-4 h-4" />
          </button>
        </div>
        <div class="relative">
          <button @click="isStatusDropdownOpen = !isStatusDropdownOpen"
            class="btn btn-ghost bg-gray-50 border border-gray-200 rounded-xl gap-2 h-12"
            :class="statusFilter ? 'border-primary text-primary' : ''">
            <Filter class="w-5 h-5" />
            {{ statusFilter ? statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1) : 'Status' }}
            <X v-if="statusFilter" @click.stop="statusFilter = ''; isStatusDropdownOpen = false"
              class="w-4 h-4 ml-1 hover:text-red-500" />
          </button>
          <div v-if="isStatusDropdownOpen"
            class="absolute right-0 top-14 bg-white border border-gray-100 rounded-xl shadow-xl z-50 w-44 py-2 animate-in fade-in zoom-in-95 duration-150">
            <button v-for="s in ['all', 'pending', 'processing', 'completed', 'cancelled']" :key="s"
              @click="statusFilter = s === 'all' ? '' : s; isStatusDropdownOpen = false"
              class="w-full text-left px-4 py-2.5 text-sm font-medium capitalize hover:bg-gray-50 transition-colors flex items-center justify-between"
              :class="(s === 'all' && !statusFilter) || statusFilter === s ? 'text-primary bg-primary/5' : 'text-gray-600'">
              {{ s }}
              <span v-if="s !== 'all'" class="badge badge-xs" :class="getStatusBadge(s)">{{orders.filter((o: any) =>
                o.status?.toLowerCase() === s).length }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Orders Table -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="table w-full">
          <thead>
            <tr class="bg-gray-50/50 bg-gray-300">
              <!-- <th class="text-gray-500 font-semibold px-6 py-4">Order ID</th> -->
              <th class="text-gray-500 font-semibold px-6 py-4">Customer</th>
              <th class="text-gray-500 font-semibold px-6 py-4">Quantity_Items</th>
              <th class="text-gray-500 font-semibold px-6 py-4">Email</th>
              <th class="text-gray-500 font-semibold px-6 py-4">Phone</th>
              <th class="text-gray-500 font-semibold px-6 py-4 text-center">Date</th>
              <th class="text-gray-500 font-semibold px-6 py-4 text-center">Status</th>
              <th class="text-gray-500 font-semibold px-6 py-4 text-center">Payment</th>
              <th class="text-gray-500 font-semibold px-6 py-4 text-right">Amount</th>
              <th class="text-gray-500 font-semibold px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody v-if="!isLoading">
            <tr v-for="order in filteredOrders" :key="order.id" class="hover:bg-gray-50/5 transition-colors group">
              <!-- <td class="px-6 py-4 font-bold text-gray-900">#{{ order.id }}</td> -->
              <td class="px-6 py-4">
                <div class="flex flex-col">
                  <span class="font-medium text-gray-900">{{ order.user?.name }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-center text-gray-500 text-sm italic">{{ order.items?.length }}</td>
              <td class="px-6 py-4 text-center text-gray-500 text-sm italic">{{ order.user?.email }}</td>
              <td class="px-6 py-4 text-center text-gray-500 text-sm italic">{{ order.user?.phone }}</td>
              <td class="px-6 py-4 text-center text-gray-500 text-sm italic">{{ formatDate(order.order_date) }}</td>
              <td class="px-6 py-4 text-center">
                <span class="badge badge-sm font-bold capitalize" :class="getStatusBadge(order.status)">
                  {{ order.status }}
                </span>
              </td>
              <td class="px-6 py-4 text-center">
                <span class="text-xs font-bold uppercase" :class="getPaymentBadge(order.payment_method)">
                  {{ order.payment_method || 'N/A' }}
                </span>
              </td>
              <td class="px-6 py-4 text-right font-bold text-gray-900">LKR {{ parseFloat(order.total_amount ||
                0).toLocaleString() }}</td>
              <td class="px-6 py-4 text-right">
                <button @click="viewOrderDetails(order)"
                  class="btn btn-ghost btn-sm text-primary hover:bg-primary/10 rounded-lg">
                  <Eye class="w-4 h-4 mr-1" />
                  Details
                </button>
              </td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr>
              <td colspan="7" class="text-center py-12">
                <span class="loading loading-spinner loading-lg text-primary"></span>
                <p class="mt-2 text-gray-400">Loading orders...</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="p-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p class="text-sm text-gray-500">Showing {{ orders.length }} orders</p>
        <div class="flex gap-2">
          <button class="btn btn-ghost btn-sm rounded-lg border border-gray-200">
            <ChevronLeft class="w-4 h-4" />
          </button>
          <button class="btn btn-primary btn-sm rounded-lg px-4 font-bold">1</button>
          <button class="btn btn-ghost btn-sm rounded-lg border border-gray-200">
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Order Details Modal -->
    <div v-if="isModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        class="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div class="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h2 class="text-xl font-bold text-gray-900 text-left">Order #{{ selectedOrder?.id }}</h2>
            <p class="text-xs text-gray-500 text-left">{{ formatDate(selectedOrder?.order_date) }}</p>
          </div>
          <button @click="isModalOpen = false" class="btn btn-ghost btn-circle btn-sm">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="p-8 space-y-8 max-h-[80vh] overflow-y-auto">
          <!-- Customer Info -->
          <div class="grid grid-cols-2 gap-8">
            <div class="text-left">
              <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Customer Details</p>
              <p class="font-bold text-gray-900 text-lg">{{ selectedOrder?.user?.name }}</p>
              <p class="text-sm text-gray-500 italic">{{ selectedOrder?.user?.email }}</p>
              <p class="text-xs text-gray-400 mt-1">{{ selectedOrder?.user?.phone }}</p>
            </div>
            <div class="text-right">
              <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Payment</p>
              <span class="inline-block font-bold text-sm uppercase"
                :class="getPaymentBadge(selectedOrder?.payment_method)">
                {{ selectedOrder?.payment_method || 'N/A' }}
              </span>
            </div>
          </div>

          <!-- Order Summary -->
          <div class="bg-gray-50 rounded-2xl p-6 border border-gray-100">
            <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 text-left">Order Items</p>
            <div class="space-y-4">
              <div v-for="item in (selectedOrder?.items || [])" :key="item.id"
                class="flex justify-between items-center">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg bg-white border border-gray-100 flex items-center justify-center">
                    <Cake class="w-5 h-5 text-primary" />
                  </div>
                  <div class="text-left">
                    <p class="font-bold text-gray-900">{{ item.product?.name }}</p>
                    <p class="text-xs text-gray-400">Qty: {{ item.quantity }} x LKR {{
                      parseFloat(item.price).toLocaleString() }}</p>
                  </div>
                </div>
                <p class="font-bold text-gray-900">LKR {{ parseFloat(item.subtotal).toLocaleString() }}</p>
              </div>
              <div class="pt-4 mt-4 border-t border-gray-200 flex justify-between items-center">
                <p class="font-bold text-gray-900 text-lg">Total Amount</p>
                <p class="font-bold text-primary text-2xl">LKR {{ parseFloat(selectedOrder?.total_amount ||
                  0).toLocaleString() }}</p>
              </div>
            </div>
          </div>

          <!-- Status Update -->
          <div>
            <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 text-left">Update Status</p>
            <div class="flex flex-wrap gap-2 justify-start">
              <button v-for="status in ['pending', 'processing', 'completed', 'cancelled']" :key="status"
                @click="updateStatus(selectedOrder?.id, status)"
                class="btn btn-sm rounded-xl px-4 h-10 border-transparent transition-all capitalize" :class="[
                  selectedOrder?.status?.toLowerCase() === status ? getStatusBadge(status) : 'btn-ghost bg-gray-100 text-gray-500 hover:bg-gray-200'
                ]" :disabled="isUpdatingStatus">
                {{ status }}
              </button>
            </div>
          </div>
        </div>

        <div class="p-6 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-3">
          <button class="btn btn-ghost rounded-xl px-6" @click="isModalOpen = false">Close</button>
          <button class="btn btn-primary rounded-xl px-6 gap-2 shadow-lg shadow-primary/20">
            <Download class="w-4 h-4" />
            Print Invoice
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
