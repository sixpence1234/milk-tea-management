<template>
  <div class="warehouse-transfers-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>仓库调货管理</span>
          <el-button type="primary" @click="handleCreate">发起调货</el-button>
        </div>
      </template>

      <!-- Main Tabs: Sent and Received -->
      <el-tabs v-model="mainTab" @tab-change="handleMainTabChange" style="margin-bottom: 20px">
        <el-tab-pane label="我发起的" name="SENT">
          <!-- Status Tabs for Sent -->
          <el-tabs v-model="sentStatusTab" @tab-change="handleStatusTabChange" type="card">
            <el-tab-pane label="全部" name="ALL" />
            <el-tab-pane label="待确认" name="PENDING" />
            <el-tab-pane label="已确认" name="CONFIRMED" />
            <el-tab-pane label="已发货" name="SHIPPED" />
            <el-tab-pane label="已完成" name="COMPLETED" />
            <el-tab-pane label="已拒绝" name="REJECTED" />
          </el-tabs>
        </el-tab-pane>

        <el-tab-pane label="收到的" name="RECEIVED">
          <!-- Status Tabs for Received -->
          <el-tabs v-model="receivedStatusTab" @tab-change="handleStatusTabChange" type="card">
            <el-tab-pane label="全部" name="ALL" />
            <el-tab-pane label="待处理" name="PENDING" />
            <el-tab-pane label="待发货" name="CONFIRMED" />
            <el-tab-pane label="已发货" name="SHIPPED" />
            <el-tab-pane label="已完成" name="COMPLETED" />
            <el-tab-pane label="已拒绝" name="REJECTED" />
          </el-tabs>
        </el-tab-pane>
      </el-tabs>

      <!-- Search Form -->
      <el-form :inline="true" :model="searchForm" style="margin-bottom: 20px">
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- Table -->
      <el-table :data="transferList" style="width: 100%" v-loading="loading">
        <el-table-column prop="orderNo" label="调货单号" width="180" />
        <el-table-column label="发起仓库" width="150">
          <template #default="scope">
            {{ scope.row.fromWarehouseName }}
          </template>
        </el-table-column>
        <el-table-column label="目标仓库" width="150">
          <template #default="scope">
            {{ scope.row.toWarehouseName }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="120">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="调货原因" width="200" show-overflow-tooltip />
        <el-table-column prop="shippedTime" label="发货时间" width="180" />
        <el-table-column prop="receivedTime" label="收货时间" width="180" />
        <el-table-column prop="createdTime" label="创建时间" width="180" />
        <el-table-column label="操作" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="handleView(scope.row)">查看</el-button>

            <!-- 收到的调货单 - 待处理状态 -->
            <template v-if="mainTab === 'RECEIVED' && scope.row.status === 'PENDING'">
              <el-button size="small" type="primary" @click="handleConfirm(scope.row)">
                确认
              </el-button>
              <el-button size="small" type="danger" @click="handleReject(scope.row)">
                拒绝
              </el-button>
            </template>

            <!-- 收到的调货单 - 已确认状态 -->
            <template v-if="mainTab === 'RECEIVED' && scope.row.status === 'CONFIRMED'">
              <el-button size="small" type="success" @click="handleShip(scope.row)">
                发货
              </el-button>
            </template>

            <!-- 发起的调货单 - 已发货状态 -->
            <template v-if="mainTab === 'SENT' && scope.row.status === 'SHIPPED'">
              <el-button size="small" type="success" @click="handleReceive(scope.row)">
                确认收货
              </el-button>
            </template>
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
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getSentTransferList,
  getReceivedTransferList,
  rejectTransferOrder,
  shipTransferOrder,
  receiveTransferOrder,
} from '@/api/warehouse-transfer'

const router = useRouter()

// Main tab: SENT or RECEIVED
const mainTab = ref('SENT')

// Status tabs
const sentStatusTab = ref('ALL')
const receivedStatusTab = ref('ALL')

// Current active status
const currentStatus = computed(() => {
  return mainTab.value === 'SENT' ? sentStatusTab.value : receivedStatusTab.value
})

// Search form
const searchForm = reactive({})
const dateRange = ref([])

// Pagination
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
})

// Table data
const transferList = ref([])
const loading = ref(false)

// Status label mapping
const getStatusLabel = (status) => {
  const labelMap = {
    PENDING: '待确认',
    CONFIRMED: '已确认',
    SHIPPED: '已发货',
    COMPLETED: '已完成',
    REJECTED: '已拒绝',
  }
  return labelMap[status] || status
}

// Get status type
const getStatusType = (status) => {
  const typeMap = {
    PENDING: 'warning',
    CONFIRMED: 'primary',
    SHIPPED: 'info',
    COMPLETED: 'success',
    REJECTED: 'danger',
  }
  return typeMap[status] || 'info'
}

// Handle main tab change
const handleMainTabChange = () => {
  pagination.pageNum = 1
  loadTransferList()
}

// Handle status tab change
const handleStatusTabChange = () => {
  pagination.pageNum = 1
  loadTransferList()
}

// Load transfer list
const loadTransferList = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      businessStatus: currentStatus.value === 'ALL' ? undefined : currentStatus.value,
    }

    const apiFunc = mainTab.value === 'SENT' ? getSentTransferList : getReceivedTransferList
    const res = await apiFunc(params)

    if (res.code === 200 || res.code === 0) {
      transferList.value = res.data.records || []
      pagination.total = res.data.total || 0
    }
  } catch (error) {
    ElMessage.error('加载调货单列表失败')
  } finally {
    loading.value = false
  }
}

// Handle search
const handleSearch = () => {
  pagination.pageNum = 1
  loadTransferList()
}

// Handle reset
const handleReset = () => {
  dateRange.value = []
  pagination.pageNum = 1
  if (mainTab.value === 'SENT') {
    sentStatusTab.value = 'ALL'
  } else {
    receivedStatusTab.value = 'ALL'
  }
  loadTransferList()
}

// Handle create
const handleCreate = () => {
  router.push({ name: 'WarehouseCreateTransfer' })
}

// Handle view
const handleView = (row) => {
  router.push({ name: 'WarehouseTransferDetail', params: { transferId: row.id } })
}

// Handle confirm - navigate to detail page
const handleConfirm = (row) => {
  router.push({
    name: 'WarehouseTransferDetail',
    params: { transferId: row.id },
    query: { action: 'confirm' },
  })
}

// Handle reject
const handleReject = async (row) => {
  try {
    const { value: rejectReason } = await ElMessageBox.prompt('请输入拒绝原因', '拒绝调货', {
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

    const res = await rejectTransferOrder({
      orderId: row.id,
      rejectReason: rejectReason.trim(),
    })

    if (res.code === 200 || res.code === 0) {
      ElMessage.success('调货单已拒绝')
      loadTransferList()
    } else {
      ElMessage.error(res.message || '拒绝调货单失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('拒绝调货单失败:', error)
      ElMessage.error('拒绝调货单失败')
    }
  }
}

// Handle ship - navigate to detail page
const handleShip = (row) => {
  router.push({
    name: 'WarehouseTransferDetail',
    params: { transferId: row.id },
    query: { action: 'ship' },
  })
}

// Handle receive
const handleReceive = async (row) => {
  try {
    await ElMessageBox.confirm('确认收到调货商品？', '确认收货', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    const res = await receiveTransferOrder({
      orderId: row.id,
    })

    if (res.code === 200 || res.code === 0) {
      ElMessage.success('收货成功')
      loadTransferList()
    } else {
      ElMessage.error(res.message || '收货失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('收货失败:', error)
      ElMessage.error('收货失败')
    }
  }
}

const handleSizeChange = () => {
  loadTransferList()
}

const handleCurrentChange = () => {
  loadTransferList()
}

// Initialize
onMounted(() => {
  loadTransferList()
})
</script>

<style lang="scss" scoped>
.warehouse-transfers-container {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
