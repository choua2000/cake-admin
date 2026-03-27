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

// Sidebar state
const isSidebarOpen = ref(true);
const isMobileMenuOpen = ref(false);

const toggleSidebar = () => {
  if (window.innerWidth < 768) {
    isMobileMenuOpen.value = !isMobileMenuOpen.value;
  } else {
    isSidebarOpen.value = !isSidebarOpen.value;
  }
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};

const authStore = useAuthStore();
const user = computed(() => authStore.user);
const handleLogout = () => {
  if (confirm('ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການອອກຈາກລະບົບ?')) {
    authStore.logout();
  }
};

const navItems = [
  { name: 'ແຜງຄວບຄຸມ', icon: LayoutDashboard, path: '/' },
  { name: 'ໝວດໝູ່', icon: Tags, path: '/categories' },
  { name: 'ສິນຄ້າ', icon: ShoppingBasket, path: '/products' },
  { name: 'ລາຍການສັ່ງຊື້', icon: ShoppingCart, path: '/orders' },
  { name: 'ລູກຄ້າ', icon: Users, path: '/customers' },
  { name: 'ລາຍງານ', icon: BarChart3, path: '/reports' },
  { name: 'ການຕັ້ງຄ່າ', icon: Settings, path: '/settings' },
];

// Handle window resize to reset states if needed
onMounted(() => {
  if (window.innerWidth < 768) {
    isSidebarOpen.value = false;
  }

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768) {
      isMobileMenuOpen.value = false;
    }
  });
});
</script>

<template>
  <div class="h-screen bg-gray-50 flex overflow-hidden">
    <!-- Mobile Sidebar Overlay -->
    <div v-if="isMobileMenuOpen" class="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300"
      @click="closeMobileMenu"></div>

    <!-- Sidebar -->
    <aside :class="[
      'bg-white border-r border-gray-200 transition-all duration-300 fixed top-0 left-0 z-50 h-screen overflow-y-auto flex flex-col',
      // Desktop classes
      isSidebarOpen ? 'md:w-64' : 'md:w-20',
      // Mobile classes
      isMobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'
    ]">
      <!-- Header -->
      <div class="p-6 flex items-center justify-between flex-shrink-0">
        <div v-show="isSidebarOpen || isMobileMenuOpen" class="flex items-center gap-2">
          <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
            <span class="text-white font-bold text-xl">C</span>
          </div>
          <span class="font-bold text-xl tracking-tight text-gray-900">CakeAdmin</span>
        </div>
        <div v-show="!isSidebarOpen && !isMobileMenuOpen"
          class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mx-auto shadow-lg shadow-primary/20">
          <span class="text-white font-bold text-xl">C</span>
        </div>
        <button @click="closeMobileMenu" class="md:hidden text-gray-500 hover:text-gray-700 p-1">
          <X class="w-6 h-6" />
        </button>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 mt-4 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        <NuxtLink v-for="item in navItems" :key="item.name" :to="item.path" @click="closeMobileMenu"
          class="flex items-center gap-3.5 px-3.5 py-3 rounded-xl transition-all duration-200 group relative" :class="[
            $route.path === item.path
              ? 'bg-primary text-white shadow-md shadow-primary/20 pointer-events-none'
              : 'text-gray-500 hover:bg-gray-100 hover:text-primary active:scale-95'
          ]">
          <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
          <span v-show="isSidebarOpen || isMobileMenuOpen" class="font-medium truncate transition-opacity duration-300">
            {{ item.name }}
          </span>

          <!-- Tooltip for collapsed desktop sidebar -->
          <div v-if="!isSidebarOpen && !isMobileMenuOpen"
            class="hidden md:group-hover:block absolute left-full ml-4 px-3 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap z-[60]">
            {{ item.name }}
          </div>
        </NuxtLink>
      </nav>

      <!-- Footer / Logout -->
      <div class="p-4 mt-auto border-t border-gray-100">
        <button @click="handleLogout"
          class="flex items-center gap-3.5 w-full px-3.5 py-3 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 active:scale-95 group relative">
          <LogOut class="w-5 h-5 flex-shrink-0" />
          <span v-show="isSidebarOpen || isMobileMenuOpen" class="font-medium">ອອກຈາກລະບົບ</span>

          <!-- Tooltip for collapsed desktop sidebar -->
          <div v-if="!isSidebarOpen && !isMobileMenuOpen"
            class="hidden md:group-hover:block absolute left-full ml-4 px-3 py-1 bg-red-600 text-white text-xs rounded-md whitespace-nowrap z-[60]">
            ອອກຈາກລະບົບ
          </div>
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div :class="[
      'flex-1 flex flex-col h-screen min-w-0 transition-all duration-300',
      isSidebarOpen ? 'md:ml-64' : 'md:ml-20'
    ]">
      <!-- Sticky Navbar -->
      <header
        class="bg-white/80 backdrop-blur-md border-b border-gray-200 h-16 flex items-center justify-between px-4 md:px-6 flex-shrink-0 z-30 sticky top-0">
        <div class="flex items-center gap-4">
          <button @click="toggleSidebar"
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/20">
            <Menu class="w-6 h-6" />
          </button>
          <h2 class="text-lg font-bold text-gray-800 md:hidden">
            {{navItems.find(i => i.path === $route.path)?.name || 'CakeAdmin'}}
          </h2>
        </div>

        <div class="flex items-center gap-3 md:gap-4">
          <div class="text-right hidden sm:block">
            <p class="text-sm font-bold text-gray-900 truncate max-w-[150px]">{{ user?.email }}</p>
            <p
              class="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full inline-block font-bold uppercase tracking-wider">
              {{ user?.role }}
            </p>
          </div>
          <div class="avatar online">
            <div
              class="w-9 h-9 md:w-10 md:h-10 rounded-full ring-2 ring-primary/20 ring-offset-2 overflow-hidden shadow-sm">
              <img :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'admin'}`"
                alt="Admin Avatar" />
            </div>
          </div>
        </div>
      </header>

      <!-- Scrollable Content -->
      <main class="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50/50 custom-scrollbar pb-20 md:pb-8">
        <div class="max-w-7xl mx-auto">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}

@media (max-width: 767px) {

  /* Hide scrollbar on mobile */
  .custom-scrollbar::-webkit-scrollbar {
    width: 0px;
  }
}
</style>
