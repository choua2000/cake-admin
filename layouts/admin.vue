<script setup lang="ts">
import {
  LayoutDashboard,
  Tags,
  ShoppingBasket,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-vue-next';

const isSidebarOpen = ref(true);
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

const authStore = useAuthStore();
const user = computed(() => authStore.user);
const handleLogout = () => {
  if (confirm('Are you sure you want to logout?')) {
    authStore.logout();
  }
};

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { name: 'Categories', icon: Tags, path: '/categories' },
  { name: 'Products', icon: ShoppingBasket, path: '/products' },
  { name: 'Orders', icon: ShoppingCart, path: '/orders' },
  { name: 'Customers', icon: Users, path: '/customers' },
  { name: 'Reports', icon: BarChart3, path: '/reports' },
  { name: 'Settings', icon: Settings, path: '/settings' },
];
</script>

<template>
  <div class="h-screen bg-gray-50 flex overflow-hidden">
    <!-- Sidebar (Fixed) -->
    <aside :class="[
      'bg-white border-r border-gray-200 transition-all duration-300 fixed top-0 left-0 z-40 h-screen overflow-y-auto',
      isSidebarOpen ? 'w-64' : 'w-20'
    ]">
      <div class="p-6 flex items-center justify-between">
        <div v-if="isSidebarOpen" class="flex items-center gap-2">
          <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span class="text-white font-bold text-xl">C</span>
          </div>
          <span class="font-bold text-xl tracking-tight">CakeAdmin</span>
        </div>
        <div v-else class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mx-auto">
          <span class="text-white font-bold text-xl">C</span>
        </div>
        <button @click="toggleSidebar" class="md:hidden">
          <X v-if="isSidebarOpen" class="w-6 h-6" />
        </button>
      </div>

      <nav class="mt-6 px-4 space-y-2">
        <NuxtLink v-for="item in navItems" :key="item.name" :to="item.path"
          class="flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group hover:bg-primary/10"
          :class="[
            $route.path === item.path ? 'bg-primary text-white shadow-lg' : 'text-gray-500 hover:text-primary'
          ]">
          <component :is="item.icon" class="w-5 h-5" />
          <span v-if="isSidebarOpen" class="font-medium">{{ item.name }}</span>
        </NuxtLink>
      </nav>

      <div class="absolute bottom-8 left-0 w-full px-4">
        <button @click="handleLogout"
          class="flex items-center gap-4 w-full px-4 py-3 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200">
          <LogOut class="w-5 h-5" />
          <span v-if="isSidebarOpen" class="font-medium">Logout</span>
        </button>
      </div>
    </aside>

    <!-- Main Content (offset by sidebar width) -->
    <main :class="['flex-1 flex flex-col h-screen transition-all duration-300', isSidebarOpen ? 'ml-64' : 'ml-20']">
      <!-- Navbar (sticky within main) -->
      <header class="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 flex-shrink-0 z-30">
        <button @click="toggleSidebar" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Menu class="w-6 h-6 text-gray-600" />
        </button>

        <div class="flex items-center gap-4">
          <div class="text-right hidden sm:block">
            <p class="text-sm font-semibold text-gray-900">{{ user?.email }}</p>
            <p class="text-xs text-gray-500 capitalize">{{ user?.role }}</p>
          </div>
          <div class="avatar online">
            <div class="w-10 h-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
              <img :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`" alt="Admin Avatar" />
            </div>
          </div>
        </div>
      </header>

      <!-- Page Content (only this scrolls) -->
      <div class="flex-1 overflow-y-auto p-6">
        <slot />
      </div>
    </main>
  </div>
</template>

<style scoped>
.router-link-active {
  background-color: var(--color-primary);
  color: white;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}
</style>
