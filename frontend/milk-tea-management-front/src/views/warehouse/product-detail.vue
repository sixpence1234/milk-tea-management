<template>
  <div class="product-detail-container">
    <el-page-header @back="handleBack" title="返回">
      <template #content>
        <span class="page-title">商品详情</span>
      </template>
    </el-page-header>

    <el-card v-loading="loading" style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span>商品信息</span>
        </div>
      </template>

      <div v-if="productDetail">
        <!-- Cover Image -->
        <div v-if="productDetail.coverUrl" style="text-align: center; margin-bottom: 30px">
          <el-image
            :src="getImageUrl(productDetail.coverUrl)"
            :preview-src-list="[getImageUrl(productDetail.coverUrl)]"
            fit="contain"
            style="
              max-width: 400px;
              max-height: 400px;
              border-radius: 8px;
              box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
            "
          />
        </div>

        <!-- Basic Information -->
        <el-descriptions title="基本信息" :column="2" border>
          <el-descriptions-item label="商品编码">{{
            productDetail.productCode
          }}</el-descriptions-item>
          <el-descriptions-item label="商品名称">{{
            productDetail.productName
          }}</el-descriptions-item>
          <el-descriptions-item label="SKU编码">{{ productDetail.skuCode }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="productDetail.status === 1 ? 'success' : 'danger'">
              {{ productDetail.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <!-- Stock Information -->
        <el-descriptions title="库存信息" :column="2" border style="margin-top: 20px">
          <el-descriptions-item label="库存数量">
            <el-tag type="primary">{{ productDetail.stockQuantity }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="安全库存">
            <el-tag
              :type="
                productDetail.stockQuantity <= productDetail.safetyStock ? 'warning' : 'success'
              "
            >
              {{ productDetail.safetyStock }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="库位编码">{{
            productDetail.locationCode || '-'
          }}</el-descriptions-item>
          <el-descriptions-item label="库存状态">
            <el-tag v-if="productDetail.stockQuantity <= 0" type="danger">缺货</el-tag>
            <el-tag
              v-else-if="productDetail.stockQuantity <= productDetail.safetyStock"
              type="warning"
              >库存预警</el-tag
            >
            <el-tag v-else type="success">库存充足</el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <!-- Price Information -->
        <el-descriptions title="价格信息" :column="2" border style="margin-top: 20px">
          <el-descriptions-item label="采购价格">
            <span class="price">¥{{ productDetail.purchasePrice?.toFixed(2) || '0.00' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="销售价格">
            <span class="price">¥{{ productDetail.sellingPrice?.toFixed(2) || '0.00' }}</span>
          </el-descriptions-item>
        </el-descriptions>

        <!-- Other Information -->
        <el-descriptions title="其他信息" :column="2" border style="margin-top: 20px">
          <el-descriptions-item label="备注" :span="2">{{
            productDetail.remark || '-'
          }}</el-descriptions-item>
          <el-descriptions-item label="创建时间" :span="2">{{
            productDetail.createdTime
          }}</el-descriptions-item>
          <el-descriptions-item label="更新时间" :span="2">{{
            productDetail.updatedTime
          }}</el-descriptions-item>
        </el-descriptions>

        <!-- Operation Buttons -->
        <div style="margin-top: 20px; text-align: center">
          <el-button type="primary" @click="handleEdit">编辑</el-button>
          <el-button @click="handleBack">返回</el-button>
        </div>
      </div>

      <el-empty v-else description="商品不存在" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getWarehouseProductById } from '@/api/warehouse-product'
import { getImageUrl } from '@/utils/image'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const productDetail = ref(null)

// Computed profit rate
const profitRate = computed(() => {
  if (
    !productDetail.value ||
    !productDetail.value.purchasePrice ||
    productDetail.value.purchasePrice === 0
  ) {
    return 0
  }
  const profit = productDetail.value.sellingPrice - productDetail.value.purchasePrice
  return (profit / productDetail.value.purchasePrice) * 100
})

// Load product detail
const loadProductDetail = async () => {
  const id = route.params.id
  if (!id) {
    ElMessage.error('商品ID不存在')
    handleBack()
    return
  }

  loading.value = true
  try {
    const res = await getWarehouseProductById(id)
    productDetail.value = res.data
  } catch (error) {
    console.error('Failed to load product detail:', error)
    ElMessage.error('加载商品详情失败')
  } finally {
    loading.value = false
  }
}

// Handle back
const handleBack = () => {
  router.back()
}

// Handle edit
const handleEdit = () => {
  router.push({
    name: 'WarehouseProductEdit',
    params: { id: productDetail.value.id },
  })
}

onMounted(() => {
  loadProductDetail()
})
</script>

<style scoped>
.product-detail-container {
}

.page-title {
  font-size: 18px;
  font-weight: 600;
}

.card-header {
  font-size: 16px;
  font-weight: 600;
}
.operation-buttons .el-button {
  margin: 0 10px;
}

:deep(.el-descriptions__title) {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 15px;
}
</style>
