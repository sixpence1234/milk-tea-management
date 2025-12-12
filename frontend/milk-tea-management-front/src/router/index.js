import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layout/index.vue'
import { useUserStore } from '@/stores/user'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/login/index.vue'),
      hidden: true,
    },
    {
      path: '/',
      component: Layout,
      redirect: '/dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('@/views/dashboard/index.vue'),
          meta: { title: 'Dashboard', icon: 'dashboard' },
        },
        {
          path: 'account',
          name: 'Account',
          component: () => import('@/views/common/account.vue'),
          meta: { title: 'Account Management', roles: ['MANAGER'] }, // Custom role check needed
        },
        {
          path: 'account/add',
          name: 'AccountAdd',
          component: () => import('@/views/common/account-add.vue'),
          meta: { title: 'Add Account', roles: ['MANAGER'] },
        },
        {
          path: 'account/edit/:id',
          name: 'AccountEdit',
          component: () => import('@/views/common/account-edit.vue'),
          meta: { title: 'Edit Account', roles: ['MANAGER'] },
        },
        {
          path: 'account/:id',
          name: 'AccountDetail',
          component: () => import('@/views/common/account-detail.vue'),
          meta: { title: 'Account Detail', roles: ['MANAGER'] },
        },
        {
          path: 'product-templates',
          name: 'ProductTemplates',
          component: () => import('@/views/management/product-templates.vue'),
          meta: { title: 'Product Templates', terminalType: 'MANAGEMENT' },
        },
        {
          path: 'product-template/add',
          name: 'ProductTemplateAdd',
          component: () => import('@/views/management/template-add.vue'),
          meta: { title: 'Add Product Template', terminalType: 'MANAGEMENT' },
        },
        {
          path: 'product-template/edit/:id',
          name: 'ProductTemplateEdit',
          component: () => import('@/views/management/template-edit.vue'),
          meta: { title: 'Edit Product Template', terminalType: 'MANAGEMENT' },
        },
        {
          path: 'product-template/:id',
          name: 'ProductTemplateDetail',
          component: () => import('@/views/management/template-detail.vue'),
          meta: { title: 'Product Template Detail', terminalType: 'MANAGEMENT' },
        },
        {
          path: 'warehouses',
          name: 'Warehouses',
          component: () => import('@/views/management/warehouses.vue'),
          meta: { title: 'Warehouse Management', terminalType: 'MANAGEMENT' },
        },
        {
          path: 'warehouse/add',
          name: 'WarehouseAdd',
          component: () => import('@/views/management/warehouse-add.vue'),
          meta: { title: 'Add Warehouse', terminalType: 'MANAGEMENT' },
        },
        {
          path: 'warehouse/edit/:id',
          name: 'WarehouseEdit',
          component: () => import('@/views/management/warehouse-edit.vue'),
          meta: { title: 'Edit Warehouse', terminalType: 'MANAGEMENT' },
        },
        {
          path: 'warehouse/:id',
          name: 'WarehouseDetail',
          component: () => import('@/views/management/warehouse-detail.vue'),
          meta: { title: 'Warehouse Detail', terminalType: 'MANAGEMENT' },
        },
        {
          path: 'warehouse/products',
          name: 'WarehouseProducts',
          component: () => import('@/views/warehouse/products.vue'),
          meta: { title: 'Warehouse Products', terminalType: 'MANAGEMENT' },
        },
        {
          path: 'stores',
          name: 'Stores',
          component: () => import('@/views/management/stores.vue'),
          meta: { title: 'Store Management', terminalType: 'MANAGEMENT' },
        },
        {
          path: 'store/add',
          name: 'StoreAdd',
          component: () => import('@/views/management/store-add.vue'),
          meta: { title: 'Add Store', terminalType: 'MANAGEMENT' },
        },
        {
          path: 'store/edit/:id',
          name: 'StoreEdit',
          component: () => import('@/views/management/store-edit.vue'),
          meta: { title: 'Edit Store', terminalType: 'MANAGEMENT' },
        },
        {
          path: 'store/:id',
          name: 'StoreDetail',
          component: () => import('@/views/management/store-detail.vue'),
          meta: { title: 'Store Detail', terminalType: 'MANAGEMENT' },
        },
        {
          path: 'store/products',
          name: 'StoreProducts',
          component: () => import('@/views/store/products.vue'),
          meta: { title: 'Store Products', terminalType: 'MANAGEMENT' },
        },
        {
          path: 'store/my-products',
          name: 'StoreMyProducts',
          component: () => import('@/views/store/my-products.vue'),
          meta: { title: 'My Store Products', terminalType: 'STORE' },
        },
        {
          path: 'store/product/add',
          name: 'StoreProductAdd',
          component: () => import('@/views/store/store-product-add.vue'),
          meta: { title: 'Add Store Product', terminalType: 'STORE' },
        },
        {
          path: 'store/product/edit/:id',
          name: 'StoreProductEdit',
          component: () => import('@/views/store/store-product-edit.vue'),
          meta: { title: 'Edit Store Product', terminalType: 'STORE' },
        },
        {
          path: 'store/product/:id',
          name: 'StoreProductDetail',
          component: () => import('@/views/store/store-product-detail.vue'),
          meta: { title: 'Store Product Detail', terminalType: 'STORE' },
        },
        {
          path: 'store/requisitions',
          name: 'StoreRequisitions',
          component: () => import('@/views/store/requisitions.vue'),
          meta: { title: 'Requisitions Management', terminalType: 'STORE' },
        },
        {
          path: 'store/create-requisition',
          name: 'StoreCreateRequisition',
          component: () => import('@/views/store/create-requisition.vue'),
          meta: { title: 'Create Requisition', terminalType: 'STORE' },
        },
        {
          path: 'store/requisitions/:orderId',
          name: 'StoreRequisitionDetail',
          component: () => import('@/views/store/requisition-detail.vue'),
          meta: { title: 'Requisition Detail', terminalType: 'STORE' },
        },
        {
          path: 'warehouse/my-products',
          name: 'WarehouseMyProducts',
          component: () => import('@/views/warehouse/my-products.vue'),
          meta: { title: 'My Warehouse Products', terminalType: 'WAREHOUSE' },
        },
        {
          path: 'warehouse/product/add',
          name: 'WarehouseProductAdd',
          component: () => import('@/views/warehouse/product-add.vue'),
          meta: { title: 'Add Product', terminalType: 'WAREHOUSE' },
        },
        {
          path: 'warehouse/product/edit/:id',
          name: 'WarehouseProductEdit',
          component: () => import('@/views/warehouse/product-edit.vue'),
          meta: { title: 'Edit Product', terminalType: 'WAREHOUSE' },
        },
        {
          path: 'warehouse/product/:id',
          name: 'WarehouseProductDetail',
          component: () => import('@/views/warehouse/product-detail.vue'),
          meta: { title: 'Product Detail', terminalType: 'WAREHOUSE' },
        },
        {
          path: 'warehouse/orders',
          name: 'WarehouseOrders',
          component: () => import('@/views/warehouse/orders.vue'),
          meta: { title: 'Warehouse Orders', terminalType: 'WAREHOUSE' },
        },
        {
          path: 'warehouse/orders/:orderId',
          name: 'WarehouseOrderDetail',
          component: () => import('@/views/warehouse/order-detail.vue'),
          meta: { title: 'Order Detail', terminalType: 'WAREHOUSE' },
        },
        {
          path: 'warehouse/transfers',
          name: 'WarehouseTransfers',
          component: () => import('@/views/warehouse/transfers.vue'),
          meta: { title: 'Warehouse Transfers', terminalType: 'WAREHOUSE' },
        },
        {
          path: 'warehouse/create-transfer',
          name: 'WarehouseCreateTransfer',
          component: () => import('@/views/warehouse/create-transfer.vue'),
          meta: { title: 'Create Transfer', terminalType: 'WAREHOUSE' },
        },
        {
          path: 'warehouse/transfers/:transferId',
          name: 'WarehouseTransferDetail',
          component: () => import('@/views/warehouse/transfer-detail.vue'),
          meta: { title: 'Transfer Detail', terminalType: 'WAREHOUSE' },
        },
        {
          path: 'warehouse/stock-logs',
          name: 'WarehouseStockLogs',
          component: () => import('@/views/common/logs.vue'),
          meta: { title: 'Stock Logs', terminalType: 'WAREHOUSE' },
        },
        {
          path: 'profile',
          name: 'Profile',
          component: () => import('@/views/common/profile.vue'),
          meta: { title: 'Personal Center' },
        },
      ],
    },
  ],
})

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  const hasToken = userStore.token

  if (hasToken) {
    if (to.path === '/login') {
      next({ path: '/' })
    } else {
      const hasRoles = userStore.roles && userStore.roles.length > 0
      if (hasRoles) {
        next()
      } else {
        await userStore.resetToken()
        next(`/login?redirect=${to.path}`)
      }
    }
  } else {
    if (to.path === '/login') {
      next()
    } else {
      next(`/login?redirect=${to.path}`)
    }
  }
})

export default router
