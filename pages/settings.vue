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
  name: 'ຮ້ານເບເກີຣີຂອງຫວານ',
  email: 'hello@sweetdelights.com',
  phone: '+856 20 1234 5678',
  address: 'ນະຄອນຫຼວງວຽງຈັນ, ສປປ ລາວ',
  website: 'www.sweetdelights.com',
  hours: 'ຈັນ-ເສົາ: 8:00 ໂມງເຊົ້າ - 8:00 ໂມງແລງ'
});

const password = reactive({
  current: '',
  new: '',
  confirm: ''
});
</script>

<template>
  <div class="space-y-6 md:space-y-8 max-w-5xl mx-auto pb-10">
    <div class="px-2">
      <h1 class="text-3xl font-black text-gray-900 tracking-tight">ການຕັ້ງຄ່າ</h1>
      <p class="text-gray-500 font-medium">ຕັ້ງຄ່າຂໍ້ມູນຮ້ານ ແລະ ຄວາມປອດໄພຂອງບັນຊີຂອງທ່ານ.</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
      <!-- Store Information -->
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
          <div class="flex items-center gap-4 mb-8">
            <div class="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Store class="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 class="text-xl font-black text-gray-900 leading-none mb-1">ຂໍ້ມູນຮ້ານ</h2>
              <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest">ລາຍລະອຽດທຸລະກິດ</p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6 text-left">
            <div class="space-y-1.5 sm:col-span-2">
              <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">ຊື່ຮ້ານ</label>
              <input v-model="storeInfo.name" type="text"
                class="input input-bordered w-full bg-gray-50/50 border-gray-200 focus:border-primary rounded-xl h-12 font-medium" />
            </div>

            <div class="space-y-1.5">
              <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">ອີເມວທຸລະກິດ</label>
              <div class="relative">
                <Mail class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input v-model="storeInfo.email" type="email"
                  class="input input-bordered w-full pl-12 bg-gray-50/50 border-gray-200 focus:border-primary rounded-xl h-12 font-medium" />
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">ເບີໂທລະສັບ</label>
              <div class="relative">
                <Phone class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input v-model="storeInfo.phone" type="text"
                  class="input input-bordered w-full pl-12 bg-gray-50/50 border-gray-200 focus:border-primary rounded-xl h-12 font-medium" />
              </div>
            </div>

            <div class="space-y-1.5 sm:col-span-2">
              <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">ທີ່ຢູ່ຮ້ານ</label>
              <div class="relative">
                <MapPin class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input v-model="storeInfo.address" type="text"
                  class="input input-bordered w-full pl-12 bg-gray-50/50 border-gray-200 focus:border-primary rounded-xl h-12 font-medium" />
              </div>
            </div>

            <div class="space-y-1.5 text-left">
              <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">ເວັບໄຊທ໌້ URL</label>
              <div class="relative">
                <Globe class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input v-model="storeInfo.website" type="text"
                  class="input input-bordered w-full pl-12 bg-gray-50/50 border-gray-200 focus:border-primary rounded-xl h-12 font-medium" />
              </div>
            </div>

            <div class="space-y-1.5 text-left">
              <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">ເວລາເປີດ-ປິດ</label>
              <div class="relative">
                <Clock class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input v-model="storeInfo.hours" type="text"
                  class="input input-bordered w-full pl-12 bg-gray-50/50 border-gray-200 focus:border-primary rounded-xl h-12 font-medium" />
              </div>
            </div>
          </div>

          <div class="mt-10 flex justify-end">
            <button
              class="btn btn-primary rounded-xl px-10 h-14 shadow-lg shadow-primary/25 gap-2 w-full sm:w-auto font-black italic tracking-wider">
              <Save class="w-5 h-5" />
              ບັນທຶກທັງໝົດ
            </button>
          </div>
        </div>
      </div>

      <!-- Change Password -->
      <div class="lg:col-span-1 space-y-6">
        <div class="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-full">
          <div class="flex items-center gap-4 mb-8">
            <div class="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center">
              <Lock class="w-6 h-6 text-accent" />
            </div>
            <div>
              <h2 class="text-xl font-black text-gray-900 leading-none mb-1">ຄວາມປອດໄພ</h2>
              <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest">ລະຫັດຜ່ານ</p>
            </div>
          </div>

          <div class="space-y-6 text-left">
            <div class="space-y-1.5">
              <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">ລະຫັດຜ່ານເກົ່າ</label>
              <input type="password"
                class="input input-bordered w-full bg-gray-50/50 border-gray-200 rounded-xl h-12" />
            </div>
            <div class="space-y-1.5">
              <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">ລະຫັດຜ່ານໃໝ່</label>
              <input type="password"
                class="input input-bordered w-full bg-gray-50/50 border-gray-200 rounded-xl h-12" />
            </div>
            <div class="space-y-1.5">
              <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">ຢືນຢັນລະຫັດຜ່ານ</label>
              <input type="password"
                class="input input-bordered w-full bg-gray-50/50 border-gray-200 rounded-xl h-12" />
            </div>

            <button
              class="btn btn-outline btn-block border-gray-200 text-gray-500 rounded-xl h-14 mt-4 hover:bg-gray-50 font-bold">
              ປ່ຽນລະຫັດຜ່ານ
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
