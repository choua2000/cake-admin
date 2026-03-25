<script setup lang="ts">
import {
    TrendingUp,
    TrendingDown,
    Download,
    Calendar,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    Printer,
    BarChart3,
    PieChart as PieChartIcon,
    ShoppingBag,
    Layers,
    Clock,
    RefreshCcw
} from 'lucide-vue-next';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ArcElement
} from 'chart.js';
import { Line, Bar, Doughnut } from 'vue-chartjs';

definePageMeta({
    layout: 'admin',
    middleware: 'auth'
});

const api = useApi();
const isLoading = ref(true);
const selectedTimeframe = ref('month'); // 'day' | 'month' | 'year'

// Real-time Stats
const stats = ref([
    { label: 'ລາຍຮັບທັງໝົດ', value: 'LKR 0', change: '0%', isPositive: true, icon: TrendingUp },
    { label: 'ຈຳນວນການສັ່ງຊື້', value: '0', change: '0%', isPositive: true, icon: ShoppingBag },
    { label: 'ສະເລ່ຍຕໍ່ບິນ', value: 'LKR 0', change: '0%', isPositive: true, icon: BarChart3 },
    { label: 'ອັດຕາຄວາມສຳເລັດ', value: '0%', change: '0%', isPositive: true, icon: RefreshCcw },
]);

// Top Products Data
const topProducts = ref<any[]>([]);

// Chart States
const salesTrendData = ref<any>({ labels: [], datasets: [] });
const mealDistributionData = ref<any>({ labels: [], datasets: [] });

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
        y: { grid: { color: '#f3f4f6' }, ticks: { font: { size: 10 } } },
        x: { grid: { display: false }, ticks: { font: { size: 10 } } }
    }
};

const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'bottom' as const,
            labels: { usePointStyle: true, font: { size: 11 } }
        }
    },
    cutout: '70%'
};

const fetchData = async () => {
    isLoading.value = true;
    try {
        const response: any = await api.get('/orders');
        const orders = response.data || [];

        // 1. Calculate Real-time Stats
        const totalRev = orders.reduce((sum: number, o: any) => sum + parseFloat(o.total_amount || 0), 0);
        const completedOrders = orders.filter((o: any) => o.status === 'completed');
        const successRate = orders.length > 0 ? (completedOrders.length / orders.length) * 100 : 0;

        stats.value[0].value = `LKR ${totalRev.toLocaleString()}`;
        stats.value[1].value = orders.length.toString();
        stats.value[2].value = `LKR ${Math.round(orders.length > 0 ? totalRev / orders.length : 0).toLocaleString()}`;
        stats.value[3].value = `${successRate.toFixed(1)}%`;
        stats.value[3].isPositive = successRate > 80;

        // 2. Process Top Products (Best Sellers)
        const productMap = new Map();
        orders.forEach((order: any) => {
            order.items?.forEach((item: any) => {
                const name = item.product?.name || 'Unknown Product';
                const existing = productMap.get(name) || { name, sales: 0, revenue: 0, qty: 0 };
                existing.sales += 1;
                existing.qty += item.quantity;
                existing.revenue += parseFloat(item.subtotal || 0);
                productMap.set(name, existing);
            });
        });

        topProducts.value = Array.from(productMap.values())
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        // 3. Process Sales Trend (Timeline)
        const timelineMap = new Map();
        orders.forEach((o: any) => {
            const date = new Date(o.order_date);
            const label = selectedTimeframe.value === 'year'
                ? date.getFullYear().toString()
                : selectedTimeframe.value === 'month'
                    ? date.toLocaleString('default', { month: 'short' })
                    : date.toLocaleDateString();

            timelineMap.set(label, (timelineMap.get(label) || 0) + parseFloat(o.total_amount || 0));
        });

        salesTrendData.value = {
            labels: Array.from(timelineMap.keys()),
            datasets: [{
                label: 'ລາຍຮັບ',
                backgroundColor: 'rgba(255, 77, 109, 0.1)',
                borderColor: '#ff4d6d',
                data: Array.from(timelineMap.values()),
                fill: true,
                tension: 0.4
            }]
        };

        // 4. Meal/Category Distribution
        const mealMap = new Map();
        orders.forEach((order: any) => {
            order.items?.forEach((item: any) => {
                const cat = item.product?.category?.name || 'Standard';
                mealMap.set(cat, (mealMap.get(cat) || 0) + 1);
            });
        });

        mealDistributionData.value = {
            labels: Array.from(mealMap.keys()),
            datasets: [{
                backgroundColor: ['#ff4d6d', '#ffb3c1', '#c9184a', '#1d1d1d', '#f3f4f6'],
                data: Array.from(mealMap.values())
            }]
        };

    } catch (error) {
        console.error('Failed to fetch data:', error);
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
            BarElement,
            ArcElement,
            Title,
            Tooltip,
            Legend,
            Filler
        );
    }
    fetchData();
});

watch(selectedTimeframe, () => fetchData());
</script>

<template>
    <div class="space-y-8 pb-12">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 class="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                    <BarChart3 class="w-8 h-8 text-primary" />
                    ການວິເຄາະຍອດຂາຍສົດ
                </h1>
                <p class="text-gray-500 font-medium">ຕິດຕາມປະສິດທິຜົນຂອງຮ້ານເບເກີຣີໃນເວລາຈິງ.</p>
            </div>
            <div class="flex gap-2">
                <button @click="fetchData"
                    class="btn btn-ghost bg-white border border-gray-200 rounded-xl px-4 gap-2 hover:bg-gray-50">
                    <RefreshCcw class="w-4 h-4" :class="{ 'animate-spin': isLoading }" />
                    ໂຫຼດໃໝ່
                </button>
                <button class="btn btn-primary rounded-xl px-6 gap-2 shadow-lg shadow-primary/25">
                    <Download class="w-4 h-4" />
                    ສົ່ງອອກຂໍ້ມູນ
                </button>
            </div>
        </div>

        <!-- Quick Stats -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div v-for="stat in stats" :key="stat.label"
                class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all relative group overflow-hidden">
                <div class="flex flex-col gap-1 relative z-10">
                    <span class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{{ stat.label
                    }}</span>
                    <div class="flex items-baseline gap-2">
                        <h3 class="text-2xl font-black text-gray-900">{{ stat.value }}</h3>
                    </div>
                    <div class="flex items-center gap-1.5 mt-2">
                        <span :class="[
                            'text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5',
                            stat.isPositive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        ]">
                            <component :is="stat.isPositive ? TrendingUp : TrendingDown" class="w-3 h-3" />
                            {{ stat.change }}
                        </span>
                        <span class="text-[10px] text-gray-400 font-medium">ທຽບກັບຊ່ວງທີ່ແລ້ວ</span>
                    </div>
                </div>
                <div class="absolute -right-2 -bottom-2 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                    <component :is="stat.icon" class="w-24 h-24" />
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Sales Timeline Chart -->
            <div class="lg:col-span-2 bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                <div class="flex items-center justify-between mb-8">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                            <Clock class="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h2 class="text-xl font-black text-gray-900">ໄລຍະລາຍຮັບ</h2>
                            <p class="text-sm text-gray-600 font-bold uppercase tracking-widest">ກວດຫາແນວໂນ້ມຍອດຂາຍ
                                ແລະ ການຫຼຸດລົງ</p>
                        </div>
                    </div>
                    <div class="flex bg-gray-100 p-1 rounded-xl">
                        <button v-for="t in ['day', 'month', 'year']" :key="t" @click="selectedTimeframe = t" :class="[
                            'px-4 py-1.5 rounded-lg text-xs font-bold transition-all capitalize',
                            selectedTimeframe === t ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        ]">
                            {{ t }}
                        </button>
                    </div>
                </div>
                <div class="h-[350px]">
                    <ClientOnly>
                        <Line :data="salesTrendData" :options="chartOptions" />
                    </ClientOnly>
                </div>
            </div>

            <!-- Meal / Category Insights -->
            <div class="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col">
                <div class="flex items-center gap-4 mb-8">
                    <div class="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center">
                        <Layers class="w-6 h-6 text-accent" />
                    </div>
                    <div>
                        <h2 class="text-xl font-black text-gray-900">ລາຍລະອຽດໝວດໝູ່</h2>
                        <p class="text-sm text-gray-600 font-bold uppercase tracking-widest">ການແຈກຢາຍການສັ່ງຊື້</p>
                    </div>
                </div>
                <div class="flex-1 flex flex-col justify-center">
                    <div class="h-[250px] relative">
                        <ClientOnly>
                            <Doughnut :data="mealDistributionData" :options="doughnutOptions" />
                        </ClientOnly>
                        <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span class="text-3xl font-black text-gray-900">{{ stats[1].value }}</span>
                            <span
                                class="text-sm font-bold text-gray-600 uppercase tracking-widest">ລາຍການສັ່ງຊື້</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Best Selling Products -->
        <div class="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
            <div class="p-8 border-b border-gray-100 flex items-center justify-between">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-neutral/10 rounded-2xl flex items-center justify-center">
                        <TrendingUp class="w-6 h-6 text-neutral" />
                    </div>
                    <div>
                        <h2 class="text-xl font-black text-gray-900">ສິນຄ້າຂາຍດີທີ່ສຸດ</h2>
                        <p class="text-sm text-gray-600 font-bold uppercase tracking-widest">ຈັດອັນດັບຕາມລາຍຮັບ
                            ທີ່ສ້າງໄດ້</p>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <span class="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
                    <span class="text-sm font-bold text-gray-600">ອັນດັບປັດຈຸບັນ</span>
                </div>
            </div>
            <div class="overflow-x-auto">
                <table class="table w-full">
                    <thead>
                        <tr class="bg-gray-50/30">
                            <th class="px-8 py-4 text-sm font-black text-gray-600 uppercase tracking-widest">#
                                ອັນດັບ
                            </th>
                            <th class="px-8 py-4 text-sm font-black text-gray-600 uppercase tracking-widest">
                                ຂໍ້ມູນສິນຄ້າ
                            </th>
                            <th
                                class="px-8 py-4 text-sm font-black text-gray-600 uppercase tracking-widest text-center">
                                ຈຳນວນທີ່ຂາຍໄດ້</th>
                            <th
                                class="px-8 py-4 text-sm font-black text-gray-600 uppercase tracking-widest text-center">
                                ແນວໂນ້ມ</th>
                            <th
                                class="px-8 py-4 text-sm font-black text-gray-600 uppercase tracking-widest text-right">
                                ລາຍຮັບທັງໝົດ</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(product, idx) in topProducts" :key="product.name"
                            class="hover:bg-gray-50/50 transition-all group">
                            <td class="px-8 py-6">
                                <span :class="[
                                    'w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs',
                                    idx === 0 ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'
                                ]">
                                    {{ idx + 1 }}
                                </span>
                            </td>
                            <td class="px-8 py-6">
                                <div class="flex items-center gap-4">
                                    <div
                                        class="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                                        <ShoppingBag class="w-6 h-6 text-gray-300" />
                                    </div>
                                    <div>
                                        <h4 class="font-bold text-gray-900">{{ product.name }}</h4>
                                        <p class="text-[11px] text-gray-400 font-bold uppercase tracking-wider">ອັນດັບ
                                            1%
                                            ຂອງສິນຄ້າ</p>
                                    </div>
                                </div>
                            </td>
                            <td class="px-8 py-6 text-center font-black text-gray-700">{{ product.qty }}</td>
                            <td class="px-8 py-6 text-center">
                                <div
                                    class="inline-flex items-center gap-1 text-green-500 font-bold px-3 py-1 bg-green-50 rounded-full text-xs">
                                    <ArrowUpRight class="w-3 h-3" />
                                    +{{ 12 - idx }}%
                                </div>
                            </td>
                            <td class="px-8 py-6 text-right font-black text-gray-900 text-lg">
                                LKR {{ product.revenue.toLocaleString() }}
                            </td>
                        </tr>
                        <tr v-if="topProducts.length === 0">
                            <td colspan="5" class="py-12 text-center text-gray-400 font-medium">ບໍ່ມີຂໍ້ມູນຍອດຂາຍສຳລັບ
                                ການຈັດອັນດັບ.</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<style scoped>
.table th {
    background: transparent;
}
</style>
