<template>
  <el-container class="layout-container">
    <el-aside width="220px" class="aside">
      <div class="logo">
        <span>Milk Tea Admin</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="el-menu-vertical"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#fbc02d"
        router
      >
        <!-- Dashboard (Common) -->
        <el-menu-item index="/">
          <el-icon><Odometer /></el-icon>
          <span>Dashboard</span>
        </el-menu-item>

        <!-- Store Menus -->
        <template v-if="isTerminal('STORE')">
          <el-menu-item index="/store/my-products">
            <el-icon><Box /></el-icon>
            <span>Product Management</span>
          </el-menu-item>
          <el-menu-item index="/store/requisitions">
            <el-icon><Document /></el-icon>
            <span>Procurement Management</span>
          </el-menu-item>
        </template>

        <!-- Warehouse Menus -->
        <template v-if="isTerminal('WAREHOUSE')">
          <el-menu-item index="/warehouse/my-products">
            <el-icon><Box /></el-icon>
            <span>Product Management</span>
          </el-menu-item>
          <el-menu-item index="/warehouse/orders">
            <el-icon><Document /></el-icon>
            <span>Delivery management</span>
          </el-menu-item>
          <el-menu-item index="/warehouse/transfers">
            <el-icon><Position /></el-icon>
            <span>Warehouse Transfer</span>
          </el-menu-item>
        </template>

        <!-- Management Terminal Menus -->
        <template v-if="isTerminal('MANAGEMENT')">
          <el-menu-item index="/product-templates">
            <el-icon><Box /></el-icon>
            <span>Product Templates</span>
          </el-menu-item>
          <el-menu-item index="/warehouses">
            <el-icon><OfficeBuilding /></el-icon>
            <span>Warehouse Management</span>
          </el-menu-item>
          <el-menu-item index="/stores">
            <el-icon><Shop /></el-icon>
            <span>Store Management</span>
          </el-menu-item>
        </template>

        <!-- Manager Menus (Account Management) -->
        <template v-if="isManager">
          <el-menu-item index="/account">
            <el-icon><User /></el-icon>
            <span>Account Management</span>
          </el-menu-item>
        </template>

        <!-- Personal Center (All Users) -->
        <el-menu-item index="/warehouse/stock-logs">
          <el-icon><List /></el-icon>
          <span>Logs Management</span>
        </el-menu-item>
        <el-menu-item index="/profile">
          <el-icon><UserFilled /></el-icon>
          <span>Personal Center</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <div class="header-left">
          <!-- Breadcrumb or other info -->
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="el-dropdown-link">
              {{ userName }}
              <el-icon class="el-icon--right"><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">Logout</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import {
  Odometer,
  Document,
  User,
  UserFilled,
  Box,
  OfficeBuilding,
  Shop,
  ArrowDown,
  Position,
  List,
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const activeMenu = computed(() => route.path)
const userName = computed(() => userStore.name)

// Helper to check terminal type
const isTerminal = (type) => {
  return userStore.terminalType === type
}

// Helper to check if manager
// Assuming 'MANAGER' is the role string for managers. Adjust if API returns something else.
const isManager = computed(() => {
  return userStore.roles.includes('MANAGER') || userStore.roles.includes('manager') // Case insensitive check might be safer
})

const handleCommand = (command) => {
  if (command === 'logout') {
    userStore.logout().then(() => {
      router.push('/login')
    })
  }
}
</script>

<style lang="scss" scoped>
.layout-container {
  height: 100vh;
}

.aside {
  background-color: #304156;
  color: #fff;
  .logo {
    height: 60px;
    line-height: 60px;
    text-align: center;
    font-size: 20px;
    font-weight: bold;
    background-color: #2b3649;
  }
  .el-menu-vertical {
    border-right: none;
  }
}

.header {
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;

  .header-right {
    cursor: pointer;
    .el-dropdown-link {
      display: flex;
      align-items: center;
    }
  }
}

.main {
  background-color: #f0f2f5;
  padding: 20px;
}
</style>
