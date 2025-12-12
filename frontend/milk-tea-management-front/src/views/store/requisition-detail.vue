<template>
  <div class="requisition-detail-container">
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <span>拿货单详情</span>
          <el-button @click="handleBack">返回</el-button>
        </div>
      </template>

      <div v-if="orderDetail">
        <!-- 基本信息 -->
        <el-descriptions title="订单信息" :column="2" border>
          <el-descriptions-item label="订单编号">{{ orderDetail.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag :type="getStatusType(orderDetail.orderStatus)">
              {{ orderDetail.orderStatus }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="订单类型">{{
            getOrderTypeDesc(orderDetail.orderType)
          }}</el-descriptions-item>
          <el-descriptions-item label="配送方式">{{
            orderDetail.deliveryType
          }}</el-descriptions-item>
          <el-descriptions-item label="发起方编码">{{
            orderDetail.fromOrgCode
          }}</el-descriptions-item>
          <el-descriptions-item label="目标方编码">{{
            orderDetail.toOrgCode
          }}</el-descriptions-item>
          <el-descriptions-item label="发起方名称">{{
            orderDetail.fromOrgName
          }}</el-descriptions-item>
          <el-descriptions-item label="目标方名称">{{
            orderDetail.toOrgName
          }}</el-descriptions-item>
          <el-descriptions-item label="总金额">
            <span style="color: #f56c6c; font-weight: bold"
              >¥{{ orderDetail.totalAmount?.toFixed(2) || '0.00' }}</span
            >
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{
            orderDetail.createdTime
          }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{
            orderDetail.remark || '-'
          }}</el-descriptions-item>
          <el-descriptions-item v-if="orderDetail.rejectReason" label="拒绝原因" :span="2"
            ><span style="color: #f56c6c">{{
              orderDetail.rejectReason
            }}</span></el-descriptions-item
          >
          <el-descriptions-item v-if="orderDetail.cancelReason" label="取消原因" :span="2"
            ><span style="color: #f56c6c">{{
              orderDetail.cancelReason
            }}</span></el-descriptions-item
          >
        </el-descriptions>

        <!-- 商品明细 -->
        <el-divider />
        <h3 style="margin-bottom: 16px">商品明细</h3>
        <el-table :data="orderDetail.items" border style="width: 100%">
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column label="封面" width="80">
            <template #default="scope">
              <el-image
                v-if="scope.row.coverUrl"
                :src="getImageUrl(scope.row.coverUrl)"
                fit="cover"
                style="width: 50px; height: 50px; border-radius: 4px"
              />
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="productName" label="商品名称" width="180" />
          <el-table-column prop="skuCode" label="SKU编码" width="150" />
          <el-table-column label="单位" width="80">
            <template #default="scope">{{ getSpecUnitDesc(scope.row.specUnit) }}</template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" width="100" />
          <el-table-column prop="price" label="单价" width="120">
            <template #default="scope">¥{{ scope.row.price?.toFixed(2) || '0.00' }}</template>
          </el-table-column>
          <el-table-column prop="subtotal" label="小计" width="120">
            <template #default="scope">¥{{ scope.row.subtotal?.toFixed(2) || '0.00' }}</template>
          </el-table-column>
          <el-table-column label="商品照片">
            <template #default="scope">
              <div v-if="scope.row.photos && scope.row.photos.length > 0" class="photo-list">
                <el-image
                  v-for="photo in scope.row.photos"
                  :key="photo.id"
                  :src="getImageUrl(photo.photoUrl)"
                  :preview-src-list="scope.row.photos.map((p) => getImageUrl(p.photoUrl))"
                  fit="cover"
                  style="width: 50px; height: 50px; margin-right: 5px; border-radius: 4px"
                >
                  <template #error>
                    <div class="image-error">加载失败</div>
                  </template>
                </el-image>
              </div>
              <span v-else>-</span>
            </template>
          </el-table-column>
        </el-table>

        <!-- 操作按钮 -->
        <el-divider />
        <div class="action-buttons">
          <el-button
            v-if="
              orderDetail.orderStatus === 'DELIVERED' ||
              orderDetail.orderStatus === 'READY_FOR_PICKUP' ||
              orderDetail.orderStatus === 'AFTER_SALE_APPROVED'
            "
            type="primary"
            @click="handleConfirmReceipt"
            >确认收货</el-button
          >
          <el-button
            v-if="
              orderDetail.orderStatus === 'DELIVERED' ||
              orderDetail.orderStatus === 'READY_FOR_PICKUP'
            "
            type="danger"
            @click="handleRejectReceipt"
            >拒绝收货</el-button
          >
          <el-button
            v-if="orderDetail.orderStatus === 'COMPLETED'"
            type="warning"
            @click="handleAfterSale"
            >申请售后</el-button
          >
        </div>
      </div>
    </el-card>

    <!-- 售后申请对话框 -->
    <el-dialog v-model="afterSaleDialogVisible" title="申请售后" width="500px">
      <el-form :model="afterSaleForm" label-width="100px">
        <el-form-item label="售后原因" required>
          <el-input
            v-model="afterSaleForm.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入售后原因"
          />
        </el-form-item>
        <el-form-item label="备注说明">
          <el-input
            v-model="afterSaleForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注说明（可选）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="afterSaleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAfterSale" :loading="loading">确认申请</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getRequisitionDetail,
  confirmReceipt,
  rejectReceipt,
  applyAfterSale,
} from '@/api/requisition'
import { getImageUrl } from '@/utils/image'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const orderDetail = ref(null)
const afterSaleDialogVisible = ref(false)
const afterSaleForm = ref({
  reason: '',
  remark: '',
})

// 获取订单ID
const orderId = route.params.orderId || route.query.orderId

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
    PROCUREMENT: '采购入库',
    TRANSFER: '调拨',
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

// Get spec unit description
const getSpecUnitDesc = (unit) => {
  const descMap = {
    PIECE: '个',
    BOX: '箱',
    BAG: '袋',
    BOTTLE: '瓶',
    KILOGRAM: '公斤',
    GRAM: '克',
  }
  return descMap[unit] || unit || '-'
}

// 加载订单详情
const loadOrderDetail = async () => {
  if (!orderId) {
    ElMessage.error('订单ID不存在')
    handleBack()
    return
  }

  loading.value = true
  try {
    const res = await getRequisitionDetail(orderId)
    if (res.code === 200 || res.code === 0) {
      orderDetail.value = res.data
    } else {
      ElMessage.error(res.message || '加载订单详情失败')
    }
  } catch (error) {
    console.error('加载订单详情失败:', error)
    ElMessage.error('加载订单详情失败')
  } finally {
    loading.value = false
  }
}

// 确认收货
const handleConfirmReceipt = async () => {
  try {
    await ElMessageBox.confirm('确认收货？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    loading.value = true
    const res = await confirmReceipt({
      orderId: orderDetail.value.id,
    })

    if (res.code === 200 || res.code === 0) {
      ElMessage.success('收货成功')
      await loadOrderDetail()
    } else {
      ElMessage.error(res.message || '确认收货失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('确认收货失败:', error)
      ElMessage.error('确认收货失败')
    }
  } finally {
    loading.value = false
  }
}

// 拒绝收货
const handleRejectReceipt = async () => {
  try {
    const { value: rejectReason } = await ElMessageBox.prompt('请输入拒绝收货原因', '拒绝收货', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputType: 'textarea',
      inputPlaceholder: '请输入拒绝收货原因',
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return '拒绝原因不能为空'
        }
        return true
      },
    })

    loading.value = true
    const res = await rejectReceipt({
      orderId: orderDetail.value.id,
      rejectReason: rejectReason.trim(),
    })

    if (res.code === 200 || res.code === 0) {
      ElMessage.success('已提交拒绝收货申请，等待仓库审批')
      await loadOrderDetail()
    } else {
      ElMessage.error(res.message || '拒绝收货失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('拒绝收货失败:', error)
      ElMessage.error('拒绝收货失败')
    }
  } finally {
    loading.value = false
  }
}

// 申请售后
const handleAfterSale = () => {
  // 重置表单
  afterSaleForm.value = {
    reason: '',
    remark: '',
  }
  afterSaleDialogVisible.value = true
}

// 确认申请售后
const confirmAfterSale = async () => {
  if (!afterSaleForm.value.reason || !afterSaleForm.value.reason.trim()) {
    ElMessage.warning('请输入售后原因')
    return
  }

  try {
    loading.value = true
    const res = await applyAfterSale({
      orderId: orderDetail.value.id,
      reason: afterSaleForm.value.reason.trim(),
      remark: afterSaleForm.value.remark?.trim() || undefined,
    })

    if (res.code === 200 || res.code === 0) {
      ElMessage.success('售后申请已提交')
      afterSaleDialogVisible.value = false
      await loadOrderDetail()
    } else {
      ElMessage.error(res.message || '申请售后失败')
    }
  } catch (error) {
    console.error('申请售后失败:', error)
    ElMessage.error('申请售后失败')
  } finally {
    loading.value = false
  }
}

// 返回
const handleBack = () => {
  router.back()
}

// 初始化
onMounted(() => {
  loadOrderDetail()
})
</script>

<style scoped>
.requisition-detail-container {
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.photo-list {
  display: flex;
  flex-wrap: wrap;
}

.image-error {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  background-color: #f5f7fa;
  color: #909399;
  font-size: 12px;
}

.action-buttons {
  display: flex;
  gap: 10px;
}
</style>
