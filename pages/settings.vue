<script setup lang="ts">
import { 
  Store, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Save, 
  Lock,
  Globe
} from 'lucide-vue-next';

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
});

const storeInfo = reactive({
  name: 'Sweet Delights Bakery',
  email: 'hello@sweetdelights.com',
  phone: '+1 (555) 123-4567',
  address: '123 Bakers Street, Flour City, FC 54321',
  website: 'www.sweetdelights.com',
  hours: 'Mon-Sat: 8:00 AM - 8:00 PM'
});

const password = reactive({
  current: '',
  new: '',
  confirm: ''
});
</script>

<template>
  <div class="space-y-8 max-w-5xl mx-auto">
    <div>
      <h1 class="text-3xl font-bold text-gray-900">Settings</h1>
      <p class="text-gray-500">Configure your store information and account security.</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Store Information -->
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div class="flex items-center gap-3 mb-8">
            <div class="p-2 bg-primary/10 rounded-lg">
              <Store class="w-6 h-6 text-primary" />
            </div>
            <h2 class="text-xl font-bold text-gray-900">Store Information</h2>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div class="space-y-2 sm:col-span-2">
              <label class="text-sm font-bold text-gray-700 ml-1">Store Name</label>
              <input v-model="storeInfo.name" type="text" class="input input-bordered w-full bg-gray-50 border-gray-200 focus:border-primary rounded-xl" />
            </div>

            <div class="space-y-2">
              <label class="text-sm font-bold text-gray-700 ml-1">Business Email</label>
              <div class="relative">
                <Mail class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input v-model="storeInfo.email" type="email" class="input input-bordered w-full pl-12 bg-gray-50 border-gray-200 focus:border-primary rounded-xl" />
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-bold text-gray-700 ml-1">Phone Number</label>
              <div class="relative">
                <Phone class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input v-model="storeInfo.phone" type="text" class="input input-bordered w-full pl-12 bg-gray-50 border-gray-200 focus:border-primary rounded-xl" />
              </div>
            </div>

            <div class="space-y-2 sm:col-span-2">
              <label class="text-sm font-bold text-gray-700 ml-1">Store Address</label>
              <div class="relative">
                <MapPin class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input v-model="storeInfo.address" type="text" class="input input-bordered w-full pl-12 bg-gray-50 border-gray-200 focus:border-primary rounded-xl" />
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-bold text-gray-700 ml-1">Website URL</label>
              <div class="relative">
                <Globe class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input v-model="storeInfo.website" type="text" class="input input-bordered w-full pl-12 bg-gray-50 border-gray-200 focus:border-primary rounded-xl" />
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-bold text-gray-700 ml-1">Business Hours</label>
              <div class="relative">
                <Clock class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input v-model="storeInfo.hours" type="text" class="input input-bordered w-full pl-12 bg-gray-50 border-gray-200 focus:border-primary rounded-xl" />
              </div>
            </div>
          </div>

          <div class="mt-8 flex justify-end">
            <button class="btn btn-primary rounded-xl px-10 h-12 shadow-lg shadow-primary/20 gap-2">
              <Save class="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>

      <!-- Change Password -->
      <div class="lg:col-span-1 space-y-6">
        <div class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-full">
          <div class="flex items-center gap-3 mb-8">
            <div class="p-2 bg-accent/10 rounded-lg">
              <Lock class="w-6 h-6 text-accent" />
            </div>
            <h2 class="text-xl font-bold text-gray-900">Security</h2>
          </div>

          <div class="space-y-6">
            <div class="space-y-2">
              <label class="text-sm font-bold text-gray-700 ml-1">Current Password</label>
              <input type="password" class="input input-bordered w-full bg-gray-50 border-gray-200 rounded-xl" />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-bold text-gray-700 ml-1">New Password</label>
              <input type="password" class="input input-bordered w-full bg-gray-50 border-gray-200 rounded-xl" />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-bold text-gray-700 ml-1">Confirm Password</label>
              <input type="password" class="input input-bordered w-full bg-gray-50 border-gray-200 rounded-xl" />
            </div>

            <button class="btn btn-outline btn-block border-gray-200 text-gray-600 rounded-xl h-12 mt-4 hover:bg-gray-50">
              Update Password
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
