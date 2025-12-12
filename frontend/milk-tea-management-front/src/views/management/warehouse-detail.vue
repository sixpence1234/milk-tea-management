<template>
  <div class="warehouse-detail-container">
    <el-page-header @back="handleBack" title="返回">
      <template #content>
        <span class="page-title">仓库详情</span>
      </template>
    </el-page-header>

    <el-card v-loading="loading" style="margin-top: 20px">
      <div v-if="warehouseDetail">
        <!-- Basic Information -->
        <el-descriptions title="基本信息" :column="2" border>
          <el-descriptions-item label="仓库编码">{{
            warehouseDetail.warehouseCode
          }}</el-descriptions-item>
          <el-descriptions-item label="仓库名称">{{
            warehouseDetail.warehouseName
          }}</el-descriptions-item>
          <el-descriptions-item label="仓库状态">
            <el-tag :type="warehouseDetail.status === 1 ? 'success' : 'danger'">
              {{ warehouseDetail.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="地址" :span="2">{{
            warehouseDetail.address || '-'
          }}</el-descriptions-item>
        </el-descriptions>

        <!-- Contact Information -->
        <el-descriptions title="联系信息" :column="2" border style="margin-top: 20px">
          <el-descriptions-item label="仓库联系人">{{
            warehouseDetail.contactPerson || '-'
          }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{
            warehouseDetail.contactPhone || '-'
          }}</el-descriptions-item>
          <el-descriptions-item label="仓库邮箱" :span="2">{{
            warehouseDetail.email || '-'
          }}</el-descriptions-item>
        </el-descriptions>

        <!-- Manager Information -->
        <el-descriptions title="负责人信息" :column="2" border style="margin-top: 20px">
          <el-descriptions-item label="负责人账号">{{
            warehouseDetail.managerUsername || '-'
          }}</el-descriptions-item>
          <el-descriptions-item label="负责人名称">{{
            warehouseDetail.managerName || '-'
          }}</el-descriptions-item>
          <el-descriptions-item label="负责人手机号">{{
            warehouseDetail.managerPhone || '-'
          }}</el-descriptions-item>
          <el-descriptions-item label="负责人邮箱列表">
            <template
              v-if="warehouseDetail.managerEmails && warehouseDetail.managerEmails.length > 0"
            >
              <el-tag
                v-for="(email, index) in warehouseDetail.managerEmails"
                :key="index"
                style="margin-right: 5px; margin-bottom: 5px"
              >
                {{ email }}
              </el-tag>
            </template>
            <template v-else>-</template>
          </el-descriptions-item>
        </el-descriptions>

        <!-- Other Information -->
        <el-descriptions title="其他信息" :column="2" border style="margin-top: 20px">
          <el-descriptions-item label="备注" :span="2">{{
            warehouseDetail.remark || '-'
          }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{
            warehouseDetail.createTime
          }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{
            warehouseDetail.updateTime
          }}</el-descriptions-item>
        </el-descriptions>

        <!-- Operation Buttons -->
        <div class="operation-buttons">
          <el-button type="primary" @click="handleEdit">编辑仓库</el-button>
          <el-button type="success" @click="handleEnter">进入仓库</el-button>
          <el-button @click="handleBack">返回列表</el-button>
        </div>
      </div>

      <el-empty v-else description="仓库不存在" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getWarehouseById } from '@/api/warehouse'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const warehouseDetail = ref(null)

// Load warehouse detail
const loadWarehouseDetail = async () => {
  const id = route.params.id
  if (!id) {
    ElMessage.error('仓库ID不存在')
    handleBack()
    return
  }

  loading.value = true
  try {
    const res = await getWarehouseById(id)
    if (res.code === 200) {
      warehouseDetail.value = res.data
    }
  } catch (error) {
    console.error('Failed to load warehouse detail:', error)
    ElMessage.error('加载仓库详情失败')
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
    name: 'WarehouseEdit',
    params: { id: warehouseDetail.value.id },
  })
}

// Handle enter - navigate to warehouse products page
const handleEnter = () => {
  router.push({
    path: '/warehouse/products',
    query: { warehouseId: warehouseDetail.value.id },
  })
}

onMounted(() => {
  loadWarehouseDetail()
})
</script>

<style scoped>
.warehouse-detail-container {
}

.page-title {
  font-size: 18px;
  font-weight: 600;
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
</style>
