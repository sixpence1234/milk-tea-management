<template>
  <div class="store-detail-container">
    <el-page-header @back="handleBack" title="返回">
      <template #content>
        <span class="page-title">门店详情</span>
      </template>
    </el-page-header>

    <el-card v-loading="loading" style="margin-top: 20px">
      <div v-if="storeDetail">
        <!-- Basic Information -->
        <el-descriptions title="基本信息" :column="2" border>
          <el-descriptions-item label="门店编码">{{ storeDetail.storeCode }}</el-descriptions-item>
          <el-descriptions-item label="门店名称">{{ storeDetail.storeName }}</el-descriptions-item>
          <el-descriptions-item label="门店状态">
            <el-tag :type="storeDetail.status === 1 ? 'success' : 'danger'">
              {{ storeDetail.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="门店邮箱">{{
            storeDetail.email || '-'
          }}</el-descriptions-item>
          <el-descriptions-item label="地址" :span="2">{{
            storeDetail.address || '-'
          }}</el-descriptions-item>
          <el-descriptions-item label="描述" :span="2">{{
            storeDetail.description || '-'
          }}</el-descriptions-item>
        </el-descriptions>

        <!-- Contact Information -->
        <el-descriptions title="联系信息" :column="2" border style="margin-top: 20px">
          <el-descriptions-item label="门店联系人">{{
            storeDetail.contactPerson || '-'
          }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{
            storeDetail.contactPhone || '-'
          }}</el-descriptions-item>
        </el-descriptions>

        <!-- Manager Information -->
        <el-descriptions title="负责人信息" :column="2" border style="margin-top: 20px">
          <el-descriptions-item label="负责人账号">{{
            storeDetail.managerUsername || '-'
          }}</el-descriptions-item>
          <el-descriptions-item label="负责人姓名">{{
            storeDetail.managerName || '-'
          }}</el-descriptions-item>
          <el-descriptions-item label="负责人电话">{{
            storeDetail.managerPhone || '-'
          }}</el-descriptions-item>
          <el-descriptions-item label="负责人邮箱">
            <template v-if="storeDetail.managerEmails && storeDetail.managerEmails.length > 0">
              <el-tag
                v-for="(email, index) in storeDetail.managerEmails"
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
            storeDetail.remark || '-'
          }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ storeDetail.createTime }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ storeDetail.updateTime }}</el-descriptions-item>
        </el-descriptions>

        <!-- Operation Buttons -->
        <div class="operation-buttons">
          <el-button type="primary" @click="handleEdit">编辑门店</el-button>
          <el-button type="success" @click="handleEnter">进入门店</el-button>
          <el-button @click="handleBack">返回列表</el-button>
        </div>
      </div>

      <el-empty v-else description="门店不存在" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getStoreById } from '@/api/store'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const storeDetail = ref(null)

// Load store detail
const loadStoreDetail = async () => {
  const id = route.params.id
  if (!id) {
    ElMessage.error('门店ID不存在')
    handleBack()
    return
  }

  loading.value = true
  try {
    const res = await getStoreById(id)
    if (res.code === 200) {
      storeDetail.value = res.data
    }
  } catch (error) {
    console.error('Failed to load store detail:', error)
    ElMessage.error('加载门店详情失败')
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
    name: 'StoreEdit',
    params: { id: storeDetail.value.id },
  })
}

// Handle enter - navigate to store products page
const handleEnter = () => {
  router.push({
    path: '/store/products',
    query: { storeId: storeDetail.value.id },
  })
}

onMounted(() => {
  loadStoreDetail()
})
</script>

<style scoped>
.store-detail-container {
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
