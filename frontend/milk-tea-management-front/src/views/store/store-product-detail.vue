<template>
  <div class="store-product-detail-container">
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
        <!-- 商品图片 -->
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

        <!-- 基本信息 -->
        <el-descriptions title="基本信息" :column="2" border>
          <el-descriptions-item label="商品编码">{{
            productDetail.productCode
          }}</el-descriptions-item>
          <el-descriptions-item label="商品名称">{{
            productDetail.productName
          }}</el-descriptions-item>
          <el-descriptions-item label="SKU编码">{{ productDetail.skuCode }}</el-descriptions-item>
          <el-descriptions-item label="规格信息">{{
            productDetail.specInfo || '-'
          }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="productDetail.status === 1 ? 'success' : 'danger'">
              {{ productDetail.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <!-- 库存信息 -->
        <el-descriptions title="库存信息" :column="2" border style="margin-top: 20px">
          <el-descriptions-item label="库存数量">{{
            productDetail.stockQuantity
          }}</el-descriptions-item>
          <!-- <el-descriptions-item label="安全库存">{{
            productDetail.safetyStock
          }}</el-descriptions-item> -->
        </el-descriptions>

        <!-- 价格信息 -->
        <el-descriptions title="价格信息" :column="2" border style="margin-top: 20px">
          <el-descriptions-item label="采购价格"
            >¥{{ productDetail.purchasePrice?.toFixed(2) || '0.00' }}</el-descriptions-item
          >
          <el-descriptions-item label="销售价格"
            >¥{{ productDetail.sellingPrice?.toFixed(2) || '0.00' }}</el-descriptions-item
          >
        </el-descriptions>

        <!-- 其他信息 -->
        <el-descriptions title="其他信息" :column="2" border style="margin-top: 20px">
          <el-descriptions-item label="货架位置">{{
            productDetail.shelfLocation || '-'
          }}</el-descriptions-item>
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

        <div style="margin-top: 20px; text-align: center">
          <el-button type="primary" @click="handleEdit">编辑</el-button>
          <el-button @click="handleBack">返回</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getStoreProductById } from '@/api/store-product'
import { getImageUrl } from '@/utils/image'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const productDetail = ref(null)

const loadProductDetail = async () => {
  const productId = route.params.id
  if (!productId) {
    ElMessage.error('商品ID不存在')
    router.back()
    return
  }

  loading.value = true
  try {
    const res = await getStoreProductById(productId)
    if (res.code === 200 && res.data) {
      productDetail.value = res.data
    } else {
      ElMessage.error(res.msg || '获取商品信息失败')
    }
  } catch (error) {
    ElMessage.error('获取商品信息失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleEdit = () => {
  router.push({ name: 'StoreProductEdit', params: { id: route.params.id } })
}

const handleBack = () => {
  router.back()
}

onMounted(() => {
  loadProductDetail()
})
</script>

<style scoped>
.store-product-detail-container {
}

.page-title {
  font-size: 18px;
  font-weight: 600;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
