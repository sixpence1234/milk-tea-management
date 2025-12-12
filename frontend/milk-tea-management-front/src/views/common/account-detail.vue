<template>
  <div class="account-detail-container">
    <el-page-header @back="handleBack" title="返回">
      <template #content>
        <span class="page-title">账号详情</span>
      </template>
    </el-page-header>

    <el-card v-loading="loading" style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span>账号信息</span>
          <el-button type="primary" @click="handleEdit">编辑</el-button>
        </div>
      </template>

      <el-descriptions v-if="userDetail" :column="2" border>
        <el-descriptions-item label="用户ID">{{ userDetail.id }}</el-descriptions-item>
        <el-descriptions-item label="用户名">{{ userDetail.username }}</el-descriptions-item>
        <el-descriptions-item label="姓名">{{ userDetail.name || '-' }}</el-descriptions-item>
        <el-descriptions-item label="电话">{{ userDetail.phone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="性别">{{
          formatGender(userDetail.gender)
        }}</el-descriptions-item>
        <el-descriptions-item label="终端类型">{{
          formatTerminalType(userDetail.terminalType)
        }}</el-descriptions-item>
        <el-descriptions-item label="角色">{{
          formatRole(userDetail.userRole)
        }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="userDetail.status === 'ACTIVE' ? 'success' : 'danger'">
            {{ userDetail.status === 'ACTIVE' ? '启用' : '禁用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="邮箱地址" :span="2">
          <div v-if="userDetail.emails && userDetail.emails.length > 0">
            <div
              v-for="(email, index) in userDetail.emails"
              :key="index"
              style="margin-bottom: 4px"
            >
              {{ email }}
            </div>
          </div>
          <span v-else style="color: #909399">无</span>
        </el-descriptions-item>
        <el-descriptions-item label="管理员" :span="2" v-if="userDetail.managerName">
          {{ userDetail.managerName }} (ID: {{ userDetail.managerId }})
        </el-descriptions-item>
        <el-descriptions-item label="创建时间" :span="2">{{
          userDetail.createTime || '-'
        }}</el-descriptions-item>
        <el-descriptions-item label="更新时间" :span="2">{{
          userDetail.updateTime || '-'
        }}</el-descriptions-item>
      </el-descriptions>

      <div style="margin-top: 20px; text-align: right">
        <el-button @click="handleBack">返回</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getUserDetail } from '@/api/user'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const userDetail = ref(null)

const formatGender = (gender) => {
  const genderMap = {
    MALE: '男',
    FEMALE: '女',
    OTHER: '其他',
  }
  return genderMap[gender] || gender || '-'
}

const formatTerminalType = (type) => {
  const typeMap = {
    MANAGEMENT: '管理端',
    STORE: '门店',
    WAREHOUSE: '仓库',
    SUPPLIER: '供应商',
  }
  return typeMap[type] || type || '-'
}

const formatRole = (role) => {
  const roleMap = {
    MANAGER: '管理员',
    EMPLOYEE: '员工',
  }
  return roleMap[role] || role || '-'
}

const loadUserDetail = async () => {
  const userId = route.params.id
  if (!userId) {
    ElMessage.error('用户ID不存在')
    router.back()
    return
  }

  loading.value = true
  try {
    const response = await getUserDetail(userId)
    if (response.code === 200 && response.data) {
      userDetail.value = response.data
    } else {
      ElMessage.error(response.msg || '获取用户信息失败')
    }
  } catch (error) {
    ElMessage.error('获取用户信息失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleEdit = () => {
  router.push({ name: 'AccountEdit', params: { id: route.params.id } })
}

const handleBack = () => {
  router.back()
}

onMounted(() => {
  loadUserDetail()
})
</script>

<style scoped>
.account-detail-container {
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
