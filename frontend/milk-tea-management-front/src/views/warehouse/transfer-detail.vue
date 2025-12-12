<template>
  <div class="transfer-detail-container">
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <span>调货单详情</span>
          <el-button @click="handleBack">返回</el-button>
        </div>
      </template>

      <div v-if="transferDetail">
        <!-- 基本信息 -->
        <el-descriptions title="调货单信息" :column="2" border>
          <el-descriptions-item label="调货单号">{{ transferDetail.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(transferDetail.status)">
              {{ transferDetail.status }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="发起仓库">{{
            transferDetail.fromWarehouseName
          }}</el-descriptions-item>
          <el-descriptions-item label="目标仓库">{{
            transferDetail.toWarehouseName
          }}</el-descriptions-item>
          <el-descriptions-item label="调货原因" :span="2">{{
            transferDetail.reason || '-'
          }}</el-descriptions-item>
          <el-descriptions-item v-if="transferDetail.rejectReason" label="拒绝原因" :span="2">
            <span style="color: #f56c6c">{{ transferDetail.rejectReason }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="发货时间">{{
            transferDetail.shippedTime || '-'
          }}</el-descriptions-item>
          <el-descriptions-item label="收货时间">{{
            transferDetail.receivedTime || '-'
          }}</el-descriptions-item>

          <el-descriptions-item label="备注" :span="2">{{
            transferDetail.remark || '-'
          }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{
            transferDetail.createdTime
          }}</el-descriptions-item>
        </el-descriptions>

        <!-- 商品明细 -->
        <el-divider />
        <h3 style="margin-bottom: 16px">商品明细</h3>
        <el-table :data="displayItems" border style="width: 100%">
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="productCode" label="商品编码" width="150" />
          <el-table-column prop="productName" label="商品名称" width="200" />
          <el-table-column prop="skuCode" label="SKU编码" width="150" />
          <el-table-column label="申请数量" width="120">
            <template #default="scope">{{ scope.row.requestQuantity }}</template>
          </el-table-column>
          <el-table-column label="确认数量" width="150" v-if="isConfirming">
            <template #default="scope">
              <el-input-number
                v-model="scope.row.confirmedQuantity"
                :min="0"
                :max="scope.row.requestQuantity"
                size="small"
              />
            </template>
          </el-table-column>
          <el-table-column label="确认数量" width="120" v-else>
            <template #default="scope">{{
              scope.row.confirmedQuantity || scope.row.requestQuantity
            }}</template>
          </el-table-column>
          <el-table-column
            v-if="transferDetail.status === 'SHIPPED' || transferDetail.status === 'COMPLETED'"
            label="发货数量"
            width="120"
          >
            <template #default="scope">{{ scope.row.shippedQuantity || '-' }}</template>
          </el-table-column>
          <el-table-column
            v-if="transferDetail.status === 'COMPLETED'"
            label="收货数量"
            width="120"
          >
            <template #default="scope">{{ scope.row.receivedQuantity || '-' }}</template>
          </el-table-column>
          <el-table-column label="备注">
            <template #default="scope">{{ scope.row.remark || '-' }}</template>
          </el-table-column>
        </el-table>

        <!-- 操作按钮 -->
        <el-divider />
        <div class="action-buttons">
          <!-- 目标仓库确认调货单 -->
          <template v-if="isReceiver && transferDetail.status === 'PENDING'">
            <el-button type="primary" @click="handleConfirm">确认调货</el-button>
            <el-button type="danger" @click="handleReject">拒绝调货</el-button>
          </template>

          <!-- 目标仓库发货 -->
          <template v-if="isReceiver && transferDetail.status === 'CONFIRMED'">
            <el-button type="success" @click="handleShip">发货</el-button>
          </template>

          <!-- 发起方确认收货 -->
          <template v-if="!isReceiver && transferDetail.status === 'SHIPPED'">
            <el-button type="success" @click="handleReceive">确认收货</el-button>
          </template>
        </div>
      </div>
    </el-card>

    <!-- 确认调货对话框 -->
    <el-dialog v-model="confirmDialogVisible" title="确认调货" width="400px">
      <el-alert
        title="请确认商品数量"
        type="info"
        description="您可以调整确认数量，系统将按确认数量进行发货"
        :closable="false"
        style="margin-bottom: 20px"
      />
      <el-form :model="confirmForm" label-width="100px">
        <el-form-item label="备注">
          <el-input
            v-model="confirmForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注（可选）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="confirmDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitConfirm" :loading="loading">确认</el-button>
      </template>
    </el-dialog>

    <!-- 发货对话框 -->
    <el-dialog v-model="shipDialogVisible" title="发货" width="400px">
      <el-form :model="shipForm" label-width="100px">
        <el-form-item label="备注">
          <el-input
            v-model="shipForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注（可选）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="shipDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitShip" :loading="loading">确认发货</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getTransferOrderDetail,
  confirmTransferOrder,
  rejectTransferOrder,
  shipTransferOrder,
  receiveTransferOrder,
} from '@/api/warehouse-transfer'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const transferId = route.params.transferId
const loading = ref(false)
const transferDetail = ref(null)

// 是否为接收方（目标仓库）
const isReceiver = computed(() => {
  if (!transferDetail.value || !userStore.userInfo) return false
  return transferDetail.value.toWarehouseId === userStore.userInfo.warehouseId
})

// 是否处于确认状态（显示可编辑的确认数量）
const isConfirming = ref(false)

// 显示的商品明细（确认时使用临时数据）
const displayItems = computed(() => {
  return transferDetail.value?.items || []
})

// 确认对话框
const confirmDialogVisible = ref(false)
const confirmForm = ref({
  remark: '',
})

// 发货对话框
const shipDialogVisible = ref(false)
const shipForm = ref({
  remark: '',
})

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

// Load transfer detail
const loadTransferDetail = async () => {
  loading.value = true
  try {
    const res = await getTransferOrderDetail(transferId)
    if (res.code === 200 || res.code === 0) {
      transferDetail.value = res.data

      // 初始化确认数量为申请数量
      if (transferDetail.value.items) {
        transferDetail.value.items.forEach((item) => {
          if (!item.confirmedQuantity) {
            item.confirmedQuantity = item.requestQuantity
          }
        })
      }

      // 检查URL参数中的action
      const action = route.query.action
      if (action === 'confirm' && transferDetail.value.status === 'PENDING') {
        isConfirming.value = true
        confirmDialogVisible.value = true
      } else if (action === 'ship' && transferDetail.value.status === 'CONFIRMED') {
        shipDialogVisible.value = true
      }
    }
  } catch (error) {
    ElMessage.error('加载调货单详情失败')
  } finally {
    loading.value = false
  }
}

// Handle back
const handleBack = () => {
  router.back()
}

// Handle confirm
const handleConfirm = () => {
  isConfirming.value = true
  confirmDialogVisible.value = true
}

// Submit confirm
const submitConfirm = async () => {
  loading.value = true
  try {
    const items = transferDetail.value.items.map((item) => ({
      itemId: item.id,
      confirmedQuantity: item.confirmedQuantity,
    }))

    const res = await confirmTransferOrder({
      orderId: transferDetail.value.id,
      items,
      remark: confirmForm.value.remark,
    })

    if (res.code === 200 || res.code === 0) {
      ElMessage.success('确认成功')
      confirmDialogVisible.value = false
      isConfirming.value = false
      await loadTransferDetail()
    } else {
      ElMessage.error(res.message || '确认失败')
    }
  } catch (error) {
    console.error('确认失败:', error)
    ElMessage.error('确认失败')
  } finally {
    loading.value = false
  }
}

// Handle reject
const handleReject = async () => {
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

    loading.value = true
    const res = await rejectTransferOrder({
      orderId: transferDetail.value.id,
      rejectReason: rejectReason.trim(),
    })

    if (res.code === 200 || res.code === 0) {
      ElMessage.success('已拒绝调货')
      await loadTransferDetail()
    } else {
      ElMessage.error(res.message || '拒绝失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('拒绝失败:', error)
      ElMessage.error('拒绝失败')
    }
  } finally {
    loading.value = false
  }
}

// Handle ship
const handleShip = () => {
  shipDialogVisible.value = true
}

// Submit ship
const submitShip = async () => {
  loading.value = true
  try {
    const res = await shipTransferOrder({
      orderId: transferDetail.value.id,
      remark: shipForm.value.remark,
    })

    if (res.code === 200 || res.code === 0) {
      ElMessage.success('发货成功')
      shipDialogVisible.value = false
      await loadTransferDetail()
    } else {
      ElMessage.error(res.message || '发货失败')
    }
  } catch (error) {
    console.error('发货失败:', error)
    ElMessage.error('发货失败')
  } finally {
    loading.value = false
  }
}

// Handle receive
const handleReceive = async () => {
  try {
    await ElMessageBox.confirm('确认收到调货商品？', '确认收货', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    loading.value = true
    const res = await receiveTransferOrder({
      orderId: transferDetail.value.id,
    })

    if (res.code === 200 || res.code === 0) {
      ElMessage.success('收货成功')
      await loadTransferDetail()
    } else {
      ElMessage.error(res.message || '收货失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('收货失败:', error)
      ElMessage.error('收货失败')
    }
  } finally {
    loading.value = false
  }
}

// Initialize
onMounted(() => {
  loadTransferDetail()
})
</script>

<style lang="scss" scoped>
.transfer-detail-container {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .action-buttons {
    display: flex;
    gap: 12px;
    justify-content: center;
    margin-top: 20px;
  }
}
</style>
