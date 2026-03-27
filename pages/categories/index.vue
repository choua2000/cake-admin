<script setup lang="ts">
import {
    PlusCircle,
    Search,
    X,
    Tags,
    Pencil,
    Trash2
} from 'lucide-vue-next';
definePageMeta({
    layout: 'admin',
    middleware: 'auth'
});

const api = useApi();
const categories = ref<any[]>([]);
const isLoading = ref(true);
const searchQuery = ref('');

// Form state
const isEditMode = ref(false);
const formCategory = ref({ id: '', name: '', description: '' });
const isSubmitting = ref(false);

const fetchCategories = async () => {
    isLoading.value = true;
    try {
        const response: any = await api.get('/categories');
        categories.value = response.data || [];
    } catch (error) {
        console.error('Failed to fetch categories:', error);
    } finally {
        isLoading.value = false;
    }
};

const filteredCategories = computed(() => {
    const q = searchQuery.value.toLowerCase();
    if (!q) return categories.value;
    return categories.value.filter(c =>
        c.name?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q)
    );
});

const openModal = (category: any = null) => {
    if (category) {
        isEditMode.value = true;
        formCategory.value = { ...category };
    } else {
        isEditMode.value = false;
        formCategory.value = { id: '', name: '', description: '' };
    }
    const modal = document.getElementById('category_modal') as HTMLDialogElement;
    modal?.showModal();
};

const closeModal = () => {
    const modal = document.getElementById('category_modal') as HTMLDialogElement;
    modal?.close();
};

const saveCategory = async () => {
    if (!formCategory.value.name) return;
    isSubmitting.value = true;
    try {
        if (isEditMode.value) {
            await api.put(`/categories/${formCategory.value.id}`, {
                name: formCategory.value.name,
                description: formCategory.value.description
            });
            // Update locally
            const index = categories.value.findIndex(c => c.id === formCategory.value.id);
            if (index !== -1) {
                categories.value[index] = { ...formCategory.value };
            }
        } else {
            const response: any = await api.post('/categories', {
                name: formCategory.value.name,
                description: formCategory.value.description
            });
            categories.value.unshift(response.category); // Add new category to the top
        }
        closeModal();
    } catch (error: any) {
        console.error('Failed to save category:', error);
        alert(error.data?.message || 'ການບັນທຶກໝວດໝູ່ລົ້ມເຫລວ');
    } finally {
        isSubmitting.value = false;
    }
};

const deleteCategory = async (id: number) => {
    if (!confirm('ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບໝວດໝູ່ນີ້?')) return;
    try {
        await api.delete(`/categories/${id}`);
        categories.value = categories.value.filter(c => c.id !== id);
    } catch (error: any) {
        console.error('ການລຶບໝວດໝູ່ລົ້ມເຫລວ:', error);
        alert(error.data?.message || 'ການລຶບໝວດໝູ່ລົ້ມເຫລວ');
    }
};

onMounted(() => {
    fetchCategories();
});
</script>

<template>
    <div class="space-y-6">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 class="text-3xl font-bold text-gray-900">ໝວດໝູ່ສິນຄ້າ</h1>
                <p class="text-gray-600">ຈັດການໝວດໝູ່ສິນຄ້າສຳລັບຮ້ານຂອງທ່ານ.</p>
            </div>
            <button @click="openModal()" class="btn btn-primary gap-2">
                <PlusCircle class="w-5 h-5" />
                ເພີ່ມໝວດໝູ່ໃໝ່
            </button>
        </div>

        <!-- Search -->
        <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div class="relative">
                <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input v-model="searchQuery" type="text" placeholder="ຄົ້ນຫາໝວດໝູ່..."
                    class="input input-bordered w-full pl-12 pr-10 bg-gray-50 border-gray-200 focus:border-primary rounded-xl" />
                <button v-if="searchQuery" @click="searchQuery = ''"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors">
                    <X class="w-4 h-4" />
                </button>
            </div>
        </div>

        <!-- Categories Content -->
        <div class="space-y-4">
            <!-- Loading State -->
            <div v-if="isLoading" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                <span class="loading loading-spinner loading-lg text-primary"></span>
                <p class="mt-4 text-gray-500 font-medium">ກຳລັງໂຫຼດຂໍ້ມູນໝວດໝູ່...</p>
            </div>

            <!-- Empty State -->
            <div v-else-if="filteredCategories.length === 0"
                class="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Tags class="w-8 h-8 text-gray-300" />
                </div>
                <h3 class="text-lg font-bold text-gray-900">ບໍ່ພົບຂໍ້ມູນ</h3>
                <p class="text-gray-500">{{ searchQuery ? `ບໍ່ພົບຂໍ້ມູນທີ່ຄົ້ນຫາ "${searchQuery}"` :
                    'ຍັງບໍ່ມີໝວດໝູ່ໃນລະບົບເທື່ອ' }}</p>
            </div>

            <!-- Desktop Table -->
            <div v-else class="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="overflow-x-auto text-left">
                    <table class="table w-full">
                        <thead>
                            <tr class="bg-gray-50/50">
                                <th class="text-gray-500 font-bold text-xs uppercase tracking-wider px-6 py-4">ຊື່ໝວດໝູ່
                                </th>
                                <th class="text-gray-500 font-bold text-xs uppercase tracking-wider px-6 py-4">ລາຍລະອຽດ
                                </th>
                                <th
                                    class="text-gray-500 font-bold text-xs uppercase tracking-wider px-6 py-4 text-right">
                                    ຈັດການ</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="category in filteredCategories" :key="category.id"
                                class="hover:bg-gray-50/30 transition-colors">
                                <td class="px-6 py-4 font-bold text-gray-900 text-sm italic">{{ category.name }}</td>
                                <td class="px-6 py-4 text-gray-500 text-sm line-clamp-1 max-w-md">{{
                                    category.description || '-' }}</td>
                                <td class="px-6 py-4 text-right">
                                    <div class="flex items-center justify-end gap-1">
                                        <button @click="openModal(category)"
                                            class="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                                            <Pencil class="w-4 h-4" />
                                        </button>
                                        <button @click="deleteCategory(category.id)"
                                            class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                            <Trash2 class="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Mobile Cards -->
            <div v-if="!isLoading && filteredCategories.length > 0" class="md:hidden space-y-3">
                <div v-for="category in filteredCategories" :key="category.id"
                    class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 active:bg-gray-50 transition-colors">
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="font-bold text-gray-900">{{ category.name }}</h3>
                        <div class="flex gap-1">
                            <button @click="openModal(category)"
                                class="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                                <Pencil class="w-4 h-4" />
                            </button>
                            <button @click="deleteCategory(category.id)"
                                class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                <Trash2 class="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    <p class="text-xs text-gray-500 leading-relaxed">{{ category.description || 'ບໍ່ມີລາຍລະອຽດ' }}</p>
                </div>
            </div>

            <!-- Summary -->
            <div
                class="bg-white px-4 md:px-6 py-4 rounded-2xl shadow-sm border border-gray-100 text-center sm:text-left">
                <p class="text-sm font-medium text-gray-400">ທັງໝົດ: <span class="text-gray-900 font-bold">{{
                    filteredCategories.length }}</span> ໝວດໝູ່</p>
            </div>
        </div>

        <!-- Create/Edit Modal -->
        <dialog id="category_modal" class="modal modal-bottom sm:modal-middle">
            <div class="modal-box rounded-t-3xl sm:rounded-2xl p-0 overflow-hidden max-w-md shadow-2xl bg-white">
                <div class="p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                    <div>
                        <h3 class="font-bold text-xl text-gray-900">{{ isEditMode ? 'ແກ້ໄຂໝວດໝູ່' : 'ເພີ່ມໝວດໝູ່ໃໝ່' }}
                        </h3>
                        <p class="text-xs text-gray-500 mt-1">ຈັດການຂໍ້ມູນໝວດໝູ່ສິນຄ້າຂອງທ່ານ.</p>
                    </div>
                    <button @click="closeModal" class="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X class="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div class="p-6">
                    <form @submit.prevent="saveCategory" class="space-y-5">
                        <div class="space-y-1.5">
                            <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">ຊື່ໝວດໝູ່
                                <span class="text-red-500">*</span></label>
                            <input v-model="formCategory.name" type="text"
                                class="input input-bordered w-full rounded-xl focus:border-primary bg-gray-50 h-12"
                                required placeholder="ເຊັ່ນ: ເຄັກວັນເກີດ" />
                        </div>
                        <div class="space-y-1.5">
                            <label
                                class="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">ລາຍລະອຽດ</label>
                            <textarea v-model="formCategory.description"
                                class="textarea textarea-bordered w-full rounded-xl focus:border-primary h-28 bg-gray-50"
                                placeholder="ລາຍລະອຽດໝວດໝູ່..."></textarea>
                        </div>

                        <div class="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-gray-50">
                            <button type="button" class="btn btn-ghost flex-1 rounded-xl h-12 font-bold"
                                @click="closeModal">ຍົກເລີກ</button>
                            <button type="submit"
                                class="btn btn-primary flex-1 rounded-xl shadow-lg shadow-primary/20 h-12 font-bold"
                                :disabled="isSubmitting || !formCategory.name">
                                <span v-if="isSubmitting" class="loading loading-spinner loading-sm"></span>
                                {{ isEditMode ? 'ບັນທຶກ' : 'ສ້າງຄໍາມວນ' }}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <form method="dialog" class="modal-backdrop bg-black/50 backdrop-blur-sm">
                <button>close</button>
            </form>
        </dialog>
    </div>
</template>
