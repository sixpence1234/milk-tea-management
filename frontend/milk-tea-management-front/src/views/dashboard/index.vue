<template>
  <component :is="currentDashboard" />
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'
import AdminDashboard from '@/views/dashboard/AdminDashboard.vue'
import StoreDashboard from '@/views/dashboard/StoreDashboard.vue'
import WarehouseDashboard from '@/views/dashboard/WarehouseDashboard.vue'

const userStore = useUserStore()

const currentDashboard = computed(() => {
  switch (userStore.terminalType) {
    case 'MANAGEMENT':
      return AdminDashboard
    case 'STORE':
      return StoreDashboard
    case 'WAREHOUSE':
      return WarehouseDashboard
    default:
      return null
  }
})
</script>
