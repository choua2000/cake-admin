<script setup lang="ts">
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
        alert(error.data?.message || 'Failed to save category');
    } finally {
        isSubmitting.value = false;
    }
};

const deleteCategory = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
        await api.delete(`/categories/${id}`);
        categories.value = categories.value.filter(c => c.id !== id);
    } catch (error: any) {
        console.error('Failed to delete category:', error);
        alert(error.data?.message || 'Failed to delete category');
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
                <h1 class="text-3xl font-bold text-gray-900">Categories</h1>
                <p class="text-gray-500">Manage product categories for your store.</p>
            </div>
            <button @click="openModal()" class="btn btn-primary gap-2">
                <PlusCircle class="w-5 h-5" />
                New Category
            </button>
        </div>

        <!-- Search -->
        <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div class="relative">
                <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input v-model="searchQuery" type="text" placeholder="Search categories..."
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
                        <tr class="border-b border-gray-100 bg-gray-300">
                            <th class="text-gray-500 font-semibold px-6 py-4">Name</th>
                            <th class="text-gray-500 font-semibold px-6 py-4">Description</th>
                            <th class="text-gray-500 font-semibold px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody v-if="isLoading">
                        <tr>
                            <td colspan="3" class="text-center py-16">
                                <span class="loading loading-spinner text-primary loading-lg"></span>
                            </td>
                        </tr>
                    </tbody>
                    <tbody v-else-if="filteredCategories.length === 0">
                        <tr>
                            <td colspan="3" class="text-center py-16 text-gray-400">
                                <Tags class="w-12 h-12 text-gray-200 mx-auto mb-3" />
                                <p class="font-medium text-gray-400">No categories found.</p>
                            </td>
                        </tr>
                    </tbody>
                    <tbody v-else>
                        <tr v-for="category in filteredCategories" :key="category.id"
                            class="hover:bg-gray-50 transition-colors">
                            <td class="px-6 py-4 font-bold text-gray-900">{{ category.name }}</td>
                            <td class="px-6 py-4 text-gray-500 max-w-md truncate">{{ category.description }}</td>
                            <td class="px-6 py-4 text-right">
                                <div class="flex items-center justify-end gap-2">
                                    <button @click="openModal(category)"
                                        class="btn btn-ghost btn-sm btn-square text-blue-500 hover:bg-blue-50">
                                        <Pencil class="w-4 h-4" />
                                    </button>
                                    <button @click="deleteCategory(category.id)"
                                        class="btn btn-ghost btn-sm btn-square text-red-500 hover:bg-red-50">
                                        <Trash2 class="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="px-6 py-4 border-t border-gray-100 text-sm text-gray-400">
                Total: {{ filteredCategories.length }} categories
            </div>
        </div>

        <!-- Create/Edit Modal -->
        <dialog id="category_modal" class="modal">
            <div class="modal-box rounded-2xl p-0 overflow-hidden max-w-md shadow-2xl">
                <form method="dialog">
                    <button class="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 focus:outline-none">
                        <X class="w-4 h-4" />
                    </button>
                </form>

                <div class="p-6 border-b border-gray-100 bg-gray-50">
                    <h3 class="font-bold text-xl text-gray-900">{{ isEditMode ? 'Edit Category' : 'Create Category' }}
                    </h3>
                    <p class="text-sm text-gray-500 mt-1">
                        <span v-if="isEditMode">Update this category details.</span>
                        <span v-else>Add a new category for your products.</span>
                    </p>
                </div>

                <div class="p-6">
                    <form @submit.prevent="saveCategory" class="space-y-4">
                        <div class="space-y-2">
                            <label class="text-sm font-semibold text-gray-700 ml-1">Category Name <span
                                    class="text-red-500">*</span></label>
                            <input v-model="formCategory.name" type="text"
                                class="input input-bordered w-full rounded-xl focus:border-primary" required
                                placeholder="e.g. Wedding Cakes" />
                        </div>
                        <div class="space-y-2">
                            <label class="text-sm font-semibold text-gray-700 ml-1">Description</label>
                            <textarea v-model="formCategory.description"
                                class="textarea textarea-bordered w-full rounded-xl focus:border-primary h-24"
                                placeholder="Optional brief description of the category..."></textarea>
                        </div>

                        <div class="mt-8 flex gap-3 pt-4 border-t border-gray-100">
                            <button type="button" class="btn btn-ghost flex-1 rounded-xl"
                                @click="closeModal">Cancel</button>
                            <button type="submit" class="btn btn-primary flex-1 rounded-xl shadow-lg shadow-primary/20"
                                :disabled="isSubmitting || !formCategory.name">
                                <span v-if="isSubmitting" class="loading loading-spinner loading-sm"></span>
                                {{ isEditMode ? 'Save Changes' : 'Create Category' }}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <form method="dialog" class="modal-backdrop">
                <button>close</button>
            </form>
        </dialog>
    </div>
</template>
