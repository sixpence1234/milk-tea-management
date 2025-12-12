<template>
  <div class="warehouse-orders-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>配送管理</span>
        </div>
      </template>

      <!-- Tabs -->
      <el-tabs v-model="activeTab" @tab-change="handleTabChange" style="margin-bottom: 20px">
        <el-tab-pane label="全部" name="ALL" />
        <el-tab-pane label="待处理" name="PENDING" />
        <el-tab-pane label="处理中" name="PROCESSING" />
        <el-tab-pane label="配送中" name="IN_DELIVERY" />
        <el-tab-pane label="待收货" name="WAITING_RECEIPT" />
        <el-tab-pane label="售后" name="AFTER_SALE" />
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
        <el-table-column label="订单类型" width="120">
          <template #default="scope">
            {{ scope.row.orderType }}
          </template>
        </el-table-column>
        <el-table-column label="订单状态" width="120">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.orderStatus)">
              {{ scope.row.orderStatus }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="fromOrgName" label="发起方" width="150" />
        <el-table-column label="配送方式" width="120">
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
              type="primary"
              v-if="scope.row.orderStatus === 'PENDING'"
              @click="handleConfirm(scope.row)"
              >确认</el-button
            >
            <el-button
              size="small"
              type="danger"
              v-if="scope.row.orderStatus === 'PENDING'"
              @click="handleReject(scope.row)"
              >拒绝</el-button
            >
            <el-button
              size="small"
              type="success"
              v-if="scope.row.orderStatus === 'CONFIRMED'"
              @click="handleDeliver(scope.row)"
              >发货</el-button
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
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getWarehouseOrderList,
  confirmOrder,
  rejectOrder,
  deliverOrder,
} from '@/api/warehouse-order'

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

// Handle tab change
const handleTabChange = (tabName) => {
  // 直接使用tab名称作为businessStatus参数值
  searchForm.businessStatus = tabName === 'ALL' ? '' : tabName
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
    const res = await getWarehouseOrderList(params)
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

// Handle view
const handleView = (row) => {
  router.push({ name: 'WarehouseOrderDetail', params: { orderId: row.id } })
}

// Handle confirm
const handleConfirm = async (row) => {
  try {
    await ElMessageBox.confirm('确认处理此订单？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    const res = await confirmOrder({ orderId: row.id })
    if (res.code === 200 || res.code === 0) {
      ElMessage.success('确认订单成功')
      loadOrderList()
    } else {
      ElMessage.error(res.message || '确认订单失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('确认订单失败:', error)
      ElMessage.error('确认订单失败')
    }
  }
}

// Handle reject
const handleReject = async (row) => {
  try {
    const { value: rejectReason } = await ElMessageBox.prompt('请输入拒绝原因', '拒绝订单', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputType: 'textarea',
      inputPlaceholder: '请输入拒绝原因',
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return '拒绝原因不能为空'
        }
        return true
      },
    })

    const res = await rejectOrder({
      orderId: row.id,
      rejectReason: rejectReason.trim(),
    })

    if (res.code === 200 || res.code === 0) {
      ElMessage.success('订单已拒绝')
      loadOrderList()
    } else {
      ElMessage.error(res.message || '拒绝订单失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('拒绝订单失败:', error)
      ElMessage.error('拒绝订单失败')
    }
  }
}

// Handle deliver
const handleDeliver = async (row) => {
  // 跳转到详情页进行发货操作
  router.push({ name: 'WarehouseOrderDetail', params: { orderId: row.id } })
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
.warehouse-orders-container {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
