<template>
  <div class="template-detail-container">
    <el-page-header @back="handleBack" title="返回">
      <template #content>
        <span class="page-title">商品模板详情</span>
      </template>
    </el-page-header>

    <el-card v-loading="loading" style="margin-top: 20px">
      <div v-if="templateDetail">
        <!-- Cover Image -->
        <div v-if="templateDetail.coverUrl" class="cover-section">
          <el-image
            :src="getImageUrl(templateDetail.coverUrl)"
            :preview-src-list="[getImageUrl(templateDetail.coverUrl)]"
            fit="contain"
            class="cover-image"
          />
        </div>

        <!-- Basic Information -->
        <el-descriptions title="基本信息" :column="2" border style="margin-top: 20px">
          <el-descriptions-item label="商品编码">{{
            templateDetail.productCode
          }}</el-descriptions-item>
          <el-descriptions-item label="商品名称">{{
            templateDetail.productName
          }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="templateDetail.status === 'ACTIVE' ? 'success' : 'danger'">
              {{ templateDetail.status === 'ACTIVE' ? '启用' : '禁用' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{
            templateDetail.createdTime
          }}</el-descriptions-item>
          <el-descriptions-item label="更新时间" :span="2">{{
            templateDetail.updatedTime
          }}</el-descriptions-item>
          <el-descriptions-item label="描述" :span="2">{{
            templateDetail.description || '-'
          }}</el-descriptions-item>
        </el-descriptions>

        <!-- Specs Information -->
        <div
          v-if="templateDetail.specs && templateDetail.specs.length > 0"
          style="margin-top: 30px"
        >
          <el-divider content-position="left">
            <span class="section-title">规格列表</span>
          </el-divider>
          <el-table :data="templateDetail.specs" border stripe>
            <el-table-column prop="specName" label="规格名称" width="200" />
            <el-table-column prop="specValue" label="规格值" />
            <el-table-column prop="sortOrder" label="排序" width="100" align="center" />
          </el-table>
        </div>

        <!-- SKU Information -->
        <div v-if="templateDetail.skus && templateDetail.skus.length > 0" style="margin-top: 30px">
          <el-divider content-position="left">
            <span class="section-title">SKU列表</span>
          </el-divider>
          <el-table :data="templateDetail.skus" border stripe>
            <el-table-column prop="skuCode" label="SKU编码" width="200" />
            <el-table-column prop="specUnit" label="规格单位" width="150" align="center" />
            <el-table-column label="价格" width="150" align="center">
              <template #default="scope">
                <span class="price">¥{{ scope.row.price?.toFixed(2) || '0.00' }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100" align="center">
              <template #default="scope">
                <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
                  {{ scope.row.status === 1 ? '启用' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- Operation Buttons -->
        <div class="operation-buttons">
          <el-button type="primary" @click="handleEdit">编辑模板</el-button>
          <el-button @click="handleBack">返回列表</el-button>
        </div>
      </div>

      <el-empty v-else description="商品模板不存在" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getProductTemplateDetail } from '@/api/product'
import { getImageUrl } from '@/utils/image'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const templateDetail = ref(null)

// Load template detail
const loadTemplateDetail = async () => {
  const id = route.params.id
  if (!id) {
    ElMessage.error('商品模板ID不存在')
    handleBack()
    return
  }

  loading.value = true
  try {
    const res = await getProductTemplateDetail({ id })
    templateDetail.value = res.data
  } catch (error) {
    console.error('Failed to load template detail:', error)
    ElMessage.error('加载商品模板详情失败')
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
    name: 'ProductTemplateEdit',
    params: { id: templateDetail.value.id },
  })
}

onMounted(() => {
  loadTemplateDetail()
})
</script>

<style scoped>
.template-detail-container {
}

.page-title {
  font-size: 18px;
  font-weight: 600;
}

.cover-section {
  text-align: center;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.cover-image {
  max-width: 400px;
  max-height: 400px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #409eff;
}

.price {
  font-size: 16px;
  font-weight: 600;
  color: #f56c6c;
}

.operation-buttons {
  margin-top: 30px;
  text-align: center;
}

.operation-buttons .el-button {
  margin: 0 10px;
}

:deep(.el-descriptions__title) {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 15px;
}

:deep(.el-divider__text) {
  font-weight: 600;
}
</style>
