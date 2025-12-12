<template>
  <div class="requisitions-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>拿货管理</span>
          <el-button type="primary" @click="handleCreate">创建拿货单</el-button>
        </div>
      </template>

      <!-- Tabs -->
      <el-tabs v-model="activeTab" @tab-change="handleTabChange" style="margin-bottom: 20px">
        <el-tab-pane label="全部" name="ALL" />
        <el-tab-pane label="待处理" name="PENDING" />
        <el-tab-pane label="处理中" name="PROCESSING" />
        <el-tab-pane label="配送中" name="IN_DELIVERY" />
        <el-tab-pane label="待收货" name="WAITING_RECEIPT" />
        <el-tab-pane label="售后中" name="AFTER_SALE" />
        <el-tab-pane label="已完成" name="COMPLETED" />
      </el-tabs>

      <!-- Search Form -->
      <el-form :inline="true" :model="searchForm" style="margin-bottom: 20px">
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- Table -->
      <el-table :data="orderList" style="width: 100%" v-loading="loading">
        <el-table-column prop="orderNo" label="订单编号" width="180" />
        <el-table-column prop="orderType" label="订单类型" width="120">
          <template #default="scope">
            {{ scope.row.orderType }}
          </template>
        </el-table-column>
        <el-table-column prop="orderStatus" label="订单状态" width="180">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.orderStatus)">
              {{ scope.row.orderStatus }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="toOrgName" label="目标仓库" width="150" />
        <el-table-column prop="deliveryType" label="配送方式" width="120">
          <template #default="scope">
            {{ scope.row.deliveryType }}
          </template>
        </el-table-column>
        <el-table-column prop="itemCount" label="商品数量" width="100" />
        <el-table-column prop="totalQuantity" label="总数量" width="100" />
        <el-table-column prop="totalAmount" label="总金额" width="120">
          <template #default="scope"> ¥{{ scope.row.totalAmount?.toFixed(2) || '0.00' }} </template>
        </el-table-column>
        <el-table-column prop="createdTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="handleView(scope.row)">查看</el-button>
            <el-button
              size="small"
              type="success"
              v-if="scope.row.orderStatus === 'DELIVERED'"
              @click="handleConfirmReceipt(scope.row)"
              >确认收货</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <el-pagination
        v-model:current-page="pagination.pageNum"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getRequisitionList, confirmReceipt } from '@/api/requisition'

const router = useRouter()

// Active tab
const activeTab = ref('ALL')

// Search form
const searchForm = reactive({
  businessStatus: '',
})

const dateRange = ref([])

// Pagination
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
})

// Table data
const orderList = ref([])
const loading = ref(false)

// Get status type
const getStatusType = (status) => {
  const typeMap = {
    PENDING: 'warning',
    CONFIRMED: 'primary',
    PROCESSING: 'primary',
    PHOTOGRAPHING: 'primary',
    IN_DELIVERY: 'info',
    DELIVERED: 'success',
    READY_FOR_PICKUP: 'success',
    REJECT_RECEIPT_PENDING: 'warning',
    AFTER_SALE_PENDING: 'warning',
    AFTER_SALE_APPROVED: 'success',
    AFTER_SALE_REJECTED: 'danger',
    COMPLETED: 'success',
    REJECTED: 'danger',
    CANCELLED: 'info',
  }
  return typeMap[status] || 'info'
}

// Get status description
const getStatusDesc = (status) => {
  const descMap = {
    PENDING: '待处理',
    CONFIRMED: '已确认',
    PROCESSING: '处理中',
    PHOTOGRAPHING: '拍照中',
    IN_DELIVERY: '配送中',
    DELIVERED: '已送达',
    READY_FOR_PICKUP: '待自提',
    REJECT_RECEIPT_PENDING: '拒绝收货待审批',
    AFTER_SALE_PENDING: '售后待处理',
    AFTER_SALE_APPROVED: '售后已批准',
    AFTER_SALE_REJECTED: '售后已拒绝',
    COMPLETED: '已完成',
    REJECTED: '已拒绝',
    CANCELLED: '已取消',
  }
  return descMap[status] || status
}

// Get order type description
const getOrderTypeDesc = (type) => {
  const descMap = {
    REQUISITION: '门店拿货',
    PROCUREMENT: '仓库进货',
    TRANSFER: '仓库调货',
    MANUAL_IN: '手动入库',
    MANUAL_OUT: '手动出库',
  }
  return descMap[type] || type
}

// Get delivery type description
const getDeliveryTypeDesc = (type) => {
  const descMap = {
    DELIVERY: '配送',
    PICKUP: '自提',
  }
  return descMap[type] || type
}

// Handle tab change
const handleTabChange = (tabName) => {
  searchForm.businessStatus = tabName
  pagination.pageNum = 1
  loadOrderList()
}

// Load order list
const loadOrderList = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      businessStatus: searchForm.businessStatus || undefined,
      startDate: dateRange.value?.[0] || undefined,
      endDate: dateRange.value?.[1] || undefined,
    }
    const res = await getRequisitionList(params)
    if (res.code === 200 || res.code === 0) {
      orderList.value = res.data.records || []
      pagination.total = res.data.total || 0
    }
  } catch (error) {
    ElMessage.error('加载订单列表失败')
  } finally {
    loading.value = false
  }
}

// Handle search
const handleSearch = () => {
  pagination.pageNum = 1
  loadOrderList()
}

// Handle reset
const handleReset = () => {
  activeTab.value = 'ALL'
  searchForm.businessStatus = ''
  dateRange.value = []
  pagination.pageNum = 1
  loadOrderList()
}

// Handle create
const handleCreate = () => {
  router.push({ name: 'StoreCreateRequisition' })
}

// Handle view
const handleView = (row) => {
  router.push({ name: 'StoreRequisitionDetail', params: { orderId: row.id } })
}

// Handle confirm receipt
const handleConfirmReceipt = async (row) => {
  try {
    const res = await confirmReceipt({ orderId: row.id })
    if (res.code === 200) {
      ElMessage.success('确认收货成功')
      loadOrderList()
    }
  } catch (error) {
    ElMessage.error('确认收货失败')
  }
}

// Pagination handlers
const handleSizeChange = () => {
  loadOrderList()
}

const handleCurrentChange = () => {
  loadOrderList()
}

// Initialize
onMounted(() => {
  loadOrderList()
})
</script>

<style lang="scss" scoped>
.requisitions-container {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
