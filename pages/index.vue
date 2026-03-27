<script setup lang="ts">
import {
  PlusCircle,
  TrendingUp,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  AlertCircle,
  X,
  Bell
} from 'lucide-vue-next';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'vue-chartjs';

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
});

const api = useApi();
const stats = ref([
  { label: 'ລາຍຮັບທັງໝົດ', value: 'LKR 0', change: '+0%', isPositive: true, icon: TrendingUp },
  { label: 'ລາຍການສັ່ງຊື້ທັງໝົດ', value: '0', change: '+0%', isPositive: true, icon: TrendingUp },
  { label: 'ສິນຄ້າທີ່ມີຢູ່', value: '0', change: '+0%', isPositive: true, icon: TrendingUp },
  { label: 'ລູກຄ້າທັງໝົດ', value: '0', change: '+0%', isPositive: true, icon: TrendingUp },
]);

const recentOrders = ref<any[]>([]);
const categories = ref<any[]>([]);
const isLoading = ref(true);

const selectedTimeframe = ref('7 ມື້ຜ່ານມາ');
const allOrders = ref<any[]>([]);

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

let pollingInterval: any = null;
let lastKnownOrderId: number = 0;
const unreadOrdersCount = ref(0);

// Chart Data
const chartData = ref<any>({
  labels: [],
  datasets: [{
    label: 'ລາຍຮັບ (LKR)',
    backgroundColor: 'rgba(255, 77, 109, 0.1)',
    borderColor: '#ff4d6d',
    fill: true,
    data: [],
    tension: 0.4,
    pointRadius: 4,
    pointBackgroundColor: '#fff',
    pointBorderColor: '#ff4d6d',
    pointBorderWidth: 2,
  }]
});

const updateChartData = () => {
  const days = selectedTimeframe.value === '7 ມື້ຜ່ານມາ' ? 7 : selectedTimeframe.value === '30 ມື້ຜ່ານມາ' ? 30 : 365;
  const labels: string[] = [];
  const data: number[] = [];

  if (days <= 30) {
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      data.push(0);
    }
  } else {
    labels.push(...['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']);
    data.push(...Array(12).fill(0));
  }

  const now = new Date();
  allOrders.value.forEach((order: any) => {
    const orderDate = new Date(order.createdAt || order.order_date || order.date || new Date());
    // Strip time from both to accurately calculate diff days
    const diffTime = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() - new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate()).getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (days <= 30) {
      if (diffDays >= 0 && diffDays < days) {
        const dateStr = orderDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const idx = labels.indexOf(dateStr);
        if (idx !== -1) data[idx] += parseFloat(order.total_amount || 0);
      }
    } else {
      if (orderDate.getFullYear() === now.getFullYear()) {
        const monthIdx = orderDate.getMonth();
        data[monthIdx] += parseFloat(order.total_amount || 0);
      }
    }
  });

  chartData.value = {
    labels,
    datasets: [{
      label: 'ລາຍຮັບ (LKR)',
      backgroundColor: 'rgba(255, 77, 109, 0.1)',
      borderColor: '#ff4d6d',
      fill: true,
      data,
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: '#fff',
      pointBorderColor: '#ff4d6d',
      pointBorderWidth: 2,
    }]
  };
};

watch(selectedTimeframe, updateChartData);


const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#fff',
      titleColor: '#1f2937',
      bodyColor: '#1f2937',
      borderColor: '#f3f4f6',
      borderWidth: 1,
      padding: 12,
      displayColors: false,
    }
  },
  scales: {
    y: {
      display: false,
      grid: { display: false },
    },
    x: {
      grid: { display: false },
      ticks: { color: '#9ca3af', font: { size: 12 } }
    }
  }
};

const authStore = useAuthStore();
const user = computed(() => authStore.user);

const fetchDashboardData = async (quiet = false) => {
  if (!quiet) isLoading.value = true;
  try {
    const [productsRes, ordersRes, customersRes, categoriesRes] = await Promise.all([
      api.get('/products'),
      api.get('/orders'),
      api.get('/users/getall'),
      api.get('/categories')
    ]) as any[];

    const products = productsRes.data || [];
    const orders = ordersRes.data || [];
    const customers = customersRes.data || [];
    const cats = categoriesRes.data || [];

    if (orders.length > 0) {
      const maxId = Math.max(...orders.map((o: any) => o.id || 0));
      if (lastKnownOrderId > 0 && maxId > lastKnownOrderId) {
        const newOrdersList = orders.filter((o: any) => o.id > lastKnownOrderId);
        unreadOrdersCount.value += newOrdersList.length;
        showToast(`ມີການສັ່ງຊື້ໃໝ່ ${newOrdersList.length} ລາຍການ!`, 'success');
      }
      lastKnownOrderId = maxId;
    }

    allOrders.value = orders;
    updateChartData();

    // Helper for calculating 30-day percentage changes based on createdAt
    const calcChange = (items: any[], valueMapper: (item: any) => number = () => 1) => {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

      let curr = 0;
      let prev = 0;

      items.forEach(item => {
        const date = new Date(item.createdAt || item.date || item.order_date || new Date());
        const val = valueMapper(item);
        if (date >= thirtyDaysAgo) curr += val;
        else if (date >= sixtyDaysAgo && date < thirtyDaysAgo) prev += val;
      });

      if (prev === 0 && curr === 0) return { change: '0%', isPositive: true };
      if (prev === 0) return { change: '+100%', isPositive: true };
      const percent = ((curr - prev) / prev) * 100;
      return {
        change: `${percent > 0 ? '+' : ''}${Math.round(percent)}%`,
        isPositive: percent >= 0
      };
    };

    // Total Revenue
    const totalRevenue = orders.reduce((sum: number, o: any) => sum + parseFloat(o.total_amount || 0), 0);
    const revChange = calcChange(orders, o => parseFloat(o.total_amount || 0));
    stats.value[0].value = `LKR ${totalRevenue.toLocaleString()}`;
    stats.value[0].change = revChange.change;
    stats.value[0].isPositive = revChange.isPositive;

    // Total Orders
    const ordersChange = calcChange(orders);
    stats.value[1].value = orders.length.toString();
    stats.value[1].change = ordersChange.change;
    stats.value[1].isPositive = ordersChange.isPositive;

    // Active Products
    const activeProducts = products.filter((p: any) => (p.stock_qty || 0) > 0).length;
    const prodChange = calcChange(products);
    stats.value[2].value = activeProducts.toString();
    stats.value[2].change = prodChange.change;
    stats.value[2].isPositive = prodChange.isPositive;

    // Total Customers
    const custChange = calcChange(customers);
    stats.value[3].value = customers.length.toString();
    stats.value[3].change = custChange.change;
    stats.value[3].isPositive = custChange.isPositive;

    // Recent Orders (last 5)
    recentOrders.value = orders.slice(0, 5).map((order: any) => ({
      id: `#${order.id}`,
      customer: order.user?.name || 'ແຂກ',
      product: `${order.items?.length || 0} ລາຍການ`,
      status: order.status || 'pending',
      amount: `LKR ${parseFloat(order.total_amount || 0).toLocaleString()}`
    }));

    // Categories with product count
    const totalProducts = products.length || 1;
    categories.value = cats.map((cat: any) => {
      const count = products.filter((p: any) => p.category_id === cat.id).length;
      return {
        name: cat.name,
        count,
        percent: Math.round((count / totalProducts) * 100)
      };
    }).sort((a: any, b: any) => b.count - a.count);
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
  } finally {
    if (!quiet) isLoading.value = false;
  }
};

onMounted(() => {
  if (process.client) {
    ChartJS.register(
      CategoryScale,
      LinearScale,
      PointElement,
      LineElement,
      Title,
      Tooltip,
      Legend,
      Filler
    );

    pollingInterval = setInterval(() => {
      fetchDashboardData(true);
    }, 10000); // Poll every 10 seconds
  }
  fetchDashboardData();
});

onUnmounted(() => {
  if (pollingInterval) clearInterval(pollingInterval);
});

const getStatusClass = (status: string) => {
  switch (status) {
    case 'Completed': return 'badge-success text-white';
    case 'Processing': return 'badge-info text-white';
    case 'Pending': return 'badge-warning text-white';
    case 'Cancelled': return 'badge-error text-white';
    default: return 'badge-ghost';
  }
};
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">ພາບລວມຂອງໜ້າຫຼັກ</h1>
        <p class="text-gray-500">ຍິນດີຕ້ອນຮັບກັບຄືນມາ! {{ user?.email }} ນີ້ແມ່ນສິ່ງທີ່ເກີດຂຶ້ນໃນມື້ນີ້.</p>
      </div>
      <div class="flex gap-2 items-center">
        <!-- Notification Dropdown -->
        <div class="dropdown dropdown-end">
          <label tabindex="0" class="btn btn-ghost btn-circle relative">
            <div class="indicator">
              <span v-if="unreadOrdersCount > 0" class="indicator-item badge badge-primary badge-sm animate-bounce">{{
                unreadOrdersCount }}</span>
              <Bell class="w-6 h-6 text-gray-600" />
            </div>
          </label>
          <ul tabindex="0" class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
            <li v-if="unreadOrdersCount > 0">
              <a @click="navigateTo('/orders'); unreadOrdersCount = 0" class="flex justify-between">
                <span>ລາຍການສັ່ງຊື້ໃໝ່</span>
                <span class="badge badge-primary">{{ unreadOrdersCount }}</span>
              </a>
            </li>
            <li v-else>
              <a class="text-gray-400">ບໍ່ມີການແຈ້ງເຕືອນໃໝ່</a>
            </li>
          </ul>
        </div>

        <button @click="navigateTo('/products')" class="btn btn-primary gap-2">
          <PlusCircle class="w-5 h-5" />
          ເພີ່ມສິນຄ້າໃໝ່
        </button>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div v-for="stat in stats" :key="stat.label"
        class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div class="flex justify-between items-start mb-4">
          <div class="p-2 bg-gray-50 rounded-lg">
            <TrendingUp class="w-6 h-6 text-primary" />
          </div>
          <button class="text-gray-400 hover:text-gray-600">
            <MoreVertical class="w-5 h-5" />
          </button>
        </div>
        <p class="text-sm font-medium text-gray-500">{{ stat.label }}</p>
        <div class="flex items-end gap-2 mt-1">
          <span class="text-2xl font-bold text-gray-900">{{ stat.value }}</span>
          <span class="text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-0.5"
            :class="stat.isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'">
            <ArrowUpRight v-if="stat.isPositive" class="w-3 h-3" />
            <ArrowDownRight v-else class="w-3 h-3" />
            {{ stat.change }}
          </span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Sales Chart Mockup -->
      <div class="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-lg font-bold text-gray-900">ການວິເຄາະຍອດຂາຍ</h2>
          <select v-model="selectedTimeframe" class="select select-sm select-bordered">
            <option>7 ມື້ຜ່ານມາ</option>
            <option>30 ມື້ຜ່ານມາ</option>
            <option>ປີນີ້</option>
          </select>
        </div>
        <!-- Placeholder for Chart -->
        <div class="h-[300px] w-full mt-4">
          <ClientOnly>
            <Line :data="chartData" :options="chartOptions" />
            <template #fallback>
              <div class="w-full h-full flex items-center justify-center bg-gray-50 rounded-xl">
                <span class="loading loading-spinner text-primary"></span>
              </div>
            </template>
          </ClientOnly>
        </div>
      </div>

      <!-- Top Categories -->
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 class="text-lg font-bold text-gray-900 mb-6">ໝວດໝູ່ຍອດນິຍົມ</h2>
        <div class="space-y-4">
          <div v-if="categories.length === 0" class="text-center py-6 text-gray-400 text-sm">ຍັງບໍ່ມີໝວດໝູ່ເທື່ອ.</div>
          <div v-for="(cat, index) in categories" :key="cat.name" class="space-y-2">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-2.5 h-2.5 rounded-full"
                  :style="{ backgroundColor: ['#ff4d6d', '#4d79ff', '#ffa94d', '#69db7c', '#da77f2', '#ff8787'][index % 6] }">
                </div>
                <span class="text-sm font-medium text-gray-700">{{ cat.name }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-gray-500">{{ cat.count }} ສິນຄ້າ</span>
                <span class="text-xs font-bold text-gray-400">{{ cat.percent }}%</span>
              </div>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-1.5">
              <div class="h-1.5 rounded-full transition-all duration-500"
                :style="{ width: cat.percent + '%', backgroundColor: ['#ff4d6d', '#4d79ff', '#ffa94d', '#69db7c', '#da77f2', '#ff8787'][index % 6] }">
              </div>
            </div>
          </div>
          <div class="pt-6 mt-6 border-t border-gray-100">
            <button @click="navigateTo('/reports')"
              class="btn btn-outline btn-primary btn-block">ເບິ່ງລາຍງານທັງໝົດ</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Orders -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="p-6 border-b border-gray-100 flex items-center justify-between">
        <h2 class="text-lg font-bold text-gray-900">ລາຍການສັ່ງຊື້ຫຼ້າສຸດ</h2>
        <NuxtLink to="/orders" class="text-primary text-sm font-semibold hover:underline">ເບິ່ງທັງໝົດ</NuxtLink>
      </div>

      <!-- Desktop Table -->
      <div class="hidden md:block overflow-x-auto">
        <table class="table w-full">
          <thead>
            <tr class="bg-gray-50/50">
              <th class="text-gray-500 font-semibold px-6 py-4">ລະຫັດສັ່ງຊື້</th>
              <th class="text-gray-500 font-semibold px-6 py-4">ລູກຄ້າ</th>
              <th class="text-gray-500 font-semibold px-6 py-4">ສິນຄ້າ</th>
              <th class="text-gray-500 font-semibold px-6 py-4">ສະຖານະ</th>
              <th class="text-gray-500 font-semibold px-6 py-4">ຈຳນວນເງິນ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in recentOrders" :key="order.id" class="hover:bg-gray-50/50 transition-colors">
              <td class="px-6 py-4 font-medium text-gray-900">{{ order.id }}</td>
              <td class="px-6 py-4">{{ order.customer }}</td>
              <td class="px-6 py-4 text-gray-500">{{ order.product }}</td>
              <td class="px-6 py-4">
                <span class="badge" :class="getStatusClass(order.status)">{{ order.status }}</span>
              </td>
              <td class="px-6 py-4 font-bold text-gray-900">{{ order.amount }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Cards -->
      <div class="md:hidden divide-y divide-gray-50">
        <div v-for="order in recentOrders" :key="order.id" class="p-4 active:bg-gray-50 transition-colors">
          <div class="flex justify-between items-start mb-2">
            <div>
              <p class="font-bold text-gray-900 mb-0.5">{{ order.id }}</p>
              <p class="text-sm text-gray-600 font-medium">{{ order.customer }}</p>
            </div>
            <span class="badge badge-sm" :class="getStatusClass(order.status)">{{ order.status }}</span>
          </div>
          <div class="flex justify-between items-end">
            <p class="text-xs text-gray-400 font-medium">{{ order.product }}</p>
            <p class="font-bold text-primary">{{ order.amount }}</p>
          </div>
        </div>
        <div v-if="recentOrders.length === 0" class="p-8 text-center text-gray-400 text-sm">
          ບໍ່ມີລາຍການສັ່ງຊື້ໃນເວລານີ້.
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
