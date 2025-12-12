<template>
  <div class="order-detail-container">
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <span>订单详情</span>
          <el-button @click="handleBack">返回</el-button>
        </div>
      </template>

      <div v-if="orderDetail">
        <!-- 基本信息 -->
        <el-descriptions title="订单信息" :column="2" border>
          <el-descriptions-item label="订单编号">{{ orderDetail.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag :type="getStatusType(orderDetail.orderStatus)">
              {{ getStatusDesc(orderDetail.orderStatus) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="订单类型">{{
            getOrderTypeDesc(orderDetail.orderType)
          }}</el-descriptions-item>
          <el-descriptions-item label="配送方式">{{
            getDeliveryTypeDesc(orderDetail.deliveryType)
          }}</el-descriptions-item>
          <el-descriptions-item label="发起方编码">{{
            orderDetail.fromOrgCode
          }}</el-descriptions-item>
          <el-descriptions-item label="目标编码">{{ orderDetail.toOrgCode }}</el-descriptions-item>
          <el-descriptions-item label="发起方">{{ orderDetail.fromOrgName }}</el-descriptions-item>

          <el-descriptions-item label="目标方">{{ orderDetail.toOrgName }}</el-descriptions-item>
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
          <el-table-column label="清点照片" width="400">
            <template #default="scope">
              <!-- 拍照状态：显示上传按钮 -->
              <div v-if="orderDetail.orderStatus === 'PHOTOGRAPHING'">
                <ImagesUploadInline v-model="scope.row.uploadedUrls" :limit="3" />
              </div>
              <!-- 其他状态：显示照片列表 -->
              <div v-else>
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
              </div>
            </template>
          </el-table-column>
        </el-table>

        <!-- 操作按钮 -->
        <el-divider />
        <div class="action-buttons">
          <el-button
            v-if="orderDetail.orderStatus === 'PENDING'"
            type="primary"
            @click="handleConfirmOrder"
            >确认订单</el-button
          >
          <el-button
            v-if="orderDetail.orderStatus === 'PENDING'"
            type="danger"
            @click="handleRejectOrder"
            >拒绝订单</el-button
          >
          <el-button
            v-if="orderDetail.orderStatus === 'PHOTOGRAPHING'"
            type="primary"
            @click="handleConfirmInventoryCheck"
            >确认清点完成</el-button
          >
          <el-button
            v-if="orderDetail.orderStatus === 'CONFIRMED'"
            type="success"
            @click="handleDeliverOrder"
            >发货</el-button
          >
          <el-button
            v-if="orderDetail.orderStatus === 'AFTER_SALE_PENDING'"
            type="warning"
            @click="handleAfterSaleDialog"
            >处理售后</el-button
          >
        </div>
      </div>
    </el-card>

    <!-- 发货对话框 -->
    <el-dialog v-model="deliverDialogVisible" title="发货" width="500px">
      <el-form :model="deliverForm" label-width="120px">
        <el-form-item label="配送照片" v-if="orderDetail?.deliveryType === 'DELIVERY'">
          <ImagesUploadInline v-model="deliverForm.deliveryPhotoUrls" :limit="3" />
        </el-form-item>
        <el-form-item>
          <div style="color: #909399; font-size: 12px; margin-top: 4px">
            配送方式为配送时必须上传照片
          </div></el-form-item
        >
        <el-form-item label="备注">
          <el-input
            v-model="deliverForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="deliverDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmDeliver" :loading="loading">确认发货</el-button>
      </template>
    </el-dialog>

    <!-- 售后处理对话框 -->
    <el-dialog v-model="afterSaleDialogVisible" title="处理售后" width="800px">
      <div style="margin-bottom: 20px">
        <el-radio-group v-model="afterSaleForm.handleResult">
          <el-radio value="APPROVED">同意售后</el-radio>
          <el-radio value="REJECTED">拒绝售后</el-radio>
        </el-radio-group>
      </div>

      <!-- 同意时显示商品调整 -->
      <div v-if="afterSaleForm.handleResult === 'APPROVED'" style="margin-bottom: 20px">
        <h4>调整商品明细</h4>
        <el-table :data="afterSaleForm.items" border>
          <el-table-column prop="productName" label="商品名称" width="180" />
          <el-table-column prop="skuCode" label="SKU编码" width="120" />
          <el-table-column label="原数量" width="100">
            <template #default="scope">{{ scope.row.quantity }}</template>
          </el-table-column>
          <el-table-column label="调整后数量" width="150">
            <template #default="scope">
              <el-input-number
                v-model="scope.row.adjustedQuantity"
                :min="0"
                :max="scope.row.quantity"
                size="small"
              />
            </template>
          </el-table-column>
          <el-table-column label="原单价" width="100">
            <template #default="scope">¥{{ scope.row.price?.toFixed(2) }}</template>
          </el-table-column>
          <el-table-column label="调整后单价" width="150">
            <template #default="scope">
              <el-input-number
                v-model="scope.row.adjustedPrice"
                :min="0"
                :precision="2"
                size="small"
              />
            </template>
          </el-table-column>
        </el-table>
      </div>

      <el-form :model="afterSaleForm" label-width="100px">
        <el-form-item label="处理备注">
          <el-input
            v-model="afterSaleForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入处理备注"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="afterSaleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmHandleAfterSale" :loading="loading"
          >确认提交</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getWarehouseOrderDetail,
  confirmOrder,
  rejectOrder,
  confirmInventoryCheck,
  deliverOrder,
  handleAfterSale,
} from '@/api/warehouse-order'
import { getImageUrl } from '@/utils/image'
import ImagesUploadInline from '@/components/ImagesUploadInline.vue'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const orderDetail = ref(null)
const deliverDialogVisible = ref(false)
const deliverForm = ref({
  deliveryPhotoUrls: [],
  remark: '',
})
const afterSaleDialogVisible = ref(false)
const afterSaleForm = ref({
  handleResult: 'APPROVED',
  items: [],
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
    const res = await getWarehouseOrderDetail(orderId)
    if (res.code === 200 || res.code === 0) {
      orderDetail.value = res.data
      // 如果是拍照状态，为每个商品初始化上传照片URL列表
      if (orderDetail.value.orderStatus === 'PHOTOGRAPHING') {
        orderDetail.value.items.forEach((item) => {
          item.uploadedUrls = []
        })
      }
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

// 确认订单
const handleConfirmOrder = async () => {
  try {
    await ElMessageBox.confirm('确认处理此订单？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    loading.value = true
    const res = await confirmOrder({
      orderId: orderDetail.value.id,
    })

    if (res.code === 200 || res.code === 0) {
      ElMessage.success('订单确认成功')
      await loadOrderDetail()
    } else {
      ElMessage.error(res.message || '确认订单失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('确认订单失败:', error)
      ElMessage.error('确认订单失败')
    }
  } finally {
    loading.value = false
  }
}

// 拒绝订单
const handleRejectOrder = async () => {
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

    loading.value = true
    const res = await rejectOrder({
      orderId: orderDetail.value.id,
      rejectReason: rejectReason.trim(),
    })

    if (res.code === 200 || res.code === 0) {
      ElMessage.success('订单已拒绝')
      await loadOrderDetail()
    } else {
      ElMessage.error(res.message || '拒绝订单失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('拒绝订单失败:', error)
      ElMessage.error('拒绝订单失败')
    }
  } finally {
    loading.value = false
  }
}

// 确认清点完成
const handleConfirmInventoryCheck = async () => {
  try {
    await ElMessageBox.confirm('确认已完成所有商品清点？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    loading.value = true
    // 构建商品清点列表，使用上传的照片URL
    const goods = orderDetail.value.items.map((item) => ({
      itemId: item.id,
      photos: item.uploadedUrls || [],
    }))

    const res = await confirmInventoryCheck({
      orderId: orderDetail.value.id,
      goods: goods,
    })

    if (res.code === 200 || res.code === 0) {
      ElMessage.success('清点完成确认成功')
      await loadOrderDetail()
    } else {
      ElMessage.error(res.message || '确认清点完成失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('确认清点完成失败:', error)
      ElMessage.error('确认清点完成失败')
    }
  } finally {
    loading.value = false
  }
}

// 发货
const handleDeliverOrder = () => {
  // 重置表单
  deliverForm.value = {
    deliveryPhotoUrls: [],
    remark: '',
  }
  deliverDialogVisible.value = true
}

// 确认发货
const confirmDeliver = async () => {
  // 如果是配送方式，必须上传照片
  if (
    orderDetail.value.deliveryType === 'DELIVERY' &&
    (!deliverForm.value.deliveryPhotoUrls || deliverForm.value.deliveryPhotoUrls.length === 0)
  ) {
    ElMessage.warning('配送方式为配送时必须上传配送照片')
    return
  }

  try {
    loading.value = true
    const res = await deliverOrder({
      orderId: orderDetail.value.id,
      deliveryPhotoUrls: deliverForm.value.deliveryPhotoUrls,
      remark: deliverForm.value.remark || undefined,
    })

    if (res.code === 200 || res.code === 0) {
      ElMessage.success('发货成功')
      deliverDialogVisible.value = false
      await loadOrderDetail()
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

// 打开售后处理对话框
const handleAfterSaleDialog = () => {
  // 初始化表单数据
  afterSaleForm.value = {
    handleResult: 'APPROVED',
    items: orderDetail.value.items.map((item) => ({
      itemId: item.id,
      productName: item.productName,
      skuCode: item.skuCode,
      quantity: item.quantity,
      price: item.price,
      adjustedQuantity: item.quantity,
      adjustedPrice: item.price,
    })),
    remark: '',
  }
  afterSaleDialogVisible.value = true
}

// 确认处理售后
const confirmHandleAfterSale = async () => {
  try {
    loading.value = true

    const requestData = {
      orderId: orderDetail.value.id,
      handleResult: afterSaleForm.value.handleResult,
      remark: afterSaleForm.value.remark || undefined,
    }

    // 如果同意售后，需要提供调整后的商品明细
    if (afterSaleForm.value.handleResult === 'APPROVED') {
      requestData.items = afterSaleForm.value.items.map((item) => ({
        itemId: item.itemId,
        adjustedQuantity: item.adjustedQuantity,
        adjustedPrice: item.adjustedPrice !== item.price ? item.adjustedPrice : undefined,
      }))
    }

    const res = await handleAfterSale(requestData)

    if (res.code === 200 || res.code === 0) {
      ElMessage.success('售后处理成功')
      afterSaleDialogVisible.value = false
      await loadOrderDetail()
    } else {
      ElMessage.error(res.message || '售后处理失败')
    }
  } catch (error) {
    console.error('售后处理失败:', error)
    ElMessage.error('售后处理失败')
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
.order-detail-container {
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
