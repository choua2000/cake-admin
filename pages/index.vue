<script setup lang="ts">
import {
  PlusCircle,
  TrendingUp,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight
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
  { label: 'Total Revenue', value: 'LKR 0', change: '+0%', isPositive: true, icon: TrendingUp },
  { label: 'Total Orders', value: '0', change: '+0%', isPositive: true, icon: TrendingUp },
  { label: 'Active Products', value: '0', change: '+0%', isPositive: true, icon: TrendingUp },
  { label: 'Total Customers', value: '0', change: '+0%', isPositive: true, icon: TrendingUp },
]);

const recentOrders = ref<any[]>([]);
const categories = ref<any[]>([]);
const isLoading = ref(true);

const selectedTimeframe = ref('Last 7 Days');
const allOrders = ref<any[]>([]);

// Chart Data
const chartData = ref<any>({
  labels: [],
  datasets: [{
    label: 'Revenue (LKR)',
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
  const days = selectedTimeframe.value === 'Last 7 Days' ? 7 : selectedTimeframe.value === 'Last 30 Days' ? 30 : 365;
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
      label: 'Revenue (LKR)',
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

const fetchDashboardData = async () => {
  isLoading.value = true;
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
      customer: order.user?.name || 'Guest',
      product: `${order.items?.length || 0} items`,
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
    isLoading.value = false;
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
  }
  fetchDashboardData();
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
        <h1 class="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p class="text-gray-500">Welcome back! {{ user?.email }} Here's what's happening today.</p>
      </div>
      <button @click="navigateTo('/products')" class="btn btn-primary gap-2">
        <PlusCircle class="w-5 h-5" />
        New Product
      </button>
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
          <h2 class="text-lg font-bold text-gray-900">Sales Analytics</h2>
          <select v-model="selectedTimeframe" class="select select-sm select-bordered">
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>This Year</option>
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
        <h2 class="text-lg font-bold text-gray-900 mb-6">Top Categories</h2>
        <div class="space-y-4">
          <div v-if="categories.length === 0" class="text-center py-6 text-gray-400 text-sm">No categories yet.</div>
          <div v-for="(cat, index) in categories" :key="cat.name" class="space-y-2">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-2.5 h-2.5 rounded-full"
                  :style="{ backgroundColor: ['#ff4d6d', '#4d79ff', '#ffa94d', '#69db7c', '#da77f2', '#ff8787'][index % 6] }">
                </div>
                <span class="text-sm font-medium text-gray-700">{{ cat.name }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-gray-500">{{ cat.count }} products</span>
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
            <button @click="navigateTo('/reports')" class="btn btn-outline btn-primary btn-block">View All
              Reports</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Orders -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="p-6 border-b border-gray-100 flex items-center justify-between">
        <h2 class="text-lg font-bold text-gray-900">Recent Orders</h2>
        <NuxtLink to="/orders" class="text-primary text-sm font-semibold hover:underline">View All</NuxtLink>
      </div>
      <div class="overflow-x-auto">
        <table class="table w-full">
          <thead>
            <tr class="bg-gray-50/50">
              <th class="text-gray-500 font-semibold px-6 py-4">Order ID</th>
              <th class="text-gray-500 font-semibold px-6 py-4">Customer</th>
              <th class="text-gray-500 font-semibold px-6 py-4">Product</th>
              <th class="text-gray-500 font-semibold px-6 py-4">Status</th>
              <th class="text-gray-500 font-semibold px-6 py-4">Amount</th>
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
    </div>
  </div>
</template>
