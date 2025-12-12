<template>
  <div class="warehouse-add-container">
    <el-page-header @back="handleBack" title="返回">
      <template #content>
        <span class="page-title">创建仓库</span>
      </template>
    </el-page-header>

    <el-card v-loading="loading" style="margin-top: 20px">
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="120px">
        <el-divider content-position="left">基本信息</el-divider>

        <el-form-item label="仓库编码" prop="warehouseCode">
          <el-input v-model="form.warehouseCode" placeholder="请输入仓库编码" style="width: 100%" />
        </el-form-item>

        <el-form-item label="仓库名称" prop="warehouseName">
          <el-input v-model="form.warehouseName" placeholder="请输入仓库名称" style="width: 100%" />
        </el-form-item>

        <el-form-item label="地址" prop="address">
          <el-input v-model="form.address" placeholder="请输入地址" style="width: 100%" />
        </el-form-item>

        <el-divider content-position="left">联系信息</el-divider>

        <el-form-item label="仓库联系人" prop="contactPerson">
          <el-input v-model="form.contactPerson" placeholder="请输入联系人" style="width: 100%" />
        </el-form-item>

        <el-form-item label="联系电话" prop="contactPhone">
          <el-input v-model="form.contactPhone" placeholder="请输入联系电话" style="width: 100%" />
        </el-form-item>

        <el-form-item label="仓库邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" style="width: 100%" />
        </el-form-item>

        <el-divider content-position="left">负责人信息</el-divider>

        <el-form-item label="负责人" prop="managerId">
          <el-select
            v-model="form.managerId"
            placeholder="请选择负责人"
            style="width: 100%"
            filterable
          >
            <el-option
              v-for="user in managerList"
              :key="user.value"
              :label="`${user.name} (${user.username})`"
              :value="user.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="form.remark"
            type="textarea"
            :rows="4"
            placeholder="请输入备注"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
            创建仓库
          </el-button>
          <el-button @click="handleBack">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { createWarehouse } from '@/api/warehouse'
import { getManagerOptions } from '@/api/user'

const router = useRouter()

const loading = ref(false)
const submitLoading = ref(false)
const formRef = ref(null)

const form = reactive({
  warehouseCode: '',
  warehouseName: '',
  address: '',
  contactPerson: '',
  contactPhone: '',
  email: '',
  managerId: null,
  remark: '',
})

const formRules = {
  warehouseCode: [{ required: true, message: '请输入仓库编码', trigger: 'blur' }],
  warehouseName: [{ required: true, message: '请输入仓库名称', trigger: 'blur' }],
  managerId: [{ required: true, message: '请选择负责人', trigger: 'change' }],
}

const managerList = ref([])

// Load manager list
const loadManagerList = async () => {
  loading.value = true
  try {
    const res = await getManagerOptions()
    if (res.code === 200) {
      managerList.value = res.data || []
    }
  } catch (error) {
    console.error('Failed to load manager list:', error)
    ElMessage.error('加载负责人列表失败')
  } finally {
    loading.value = false
  }
}

// Handle submit
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        const data = {
          warehouseCode: form.warehouseCode,
          warehouseName: form.warehouseName,
          address: form.address,
          contactPerson: form.contactPerson,
          contactPhone: form.contactPhone,
          email: form.email,
          managerId: form.managerId,
          remark: form.remark,
        }
        const res = await createWarehouse(data)
        if (res.code === 200) {
          ElMessage.success('创建成功')
          router.push({ name: 'Warehouses' })
        }
      } catch (error) {
        console.error('Failed to create warehouse:', error)
        ElMessage.error('创建失败')
      } finally {
        submitLoading.value = false
      }
    }
  })
}

// Handle back
const handleBack = () => {
  router.back()
}

onMounted(() => {
  loadManagerList()
})
</script>

<style scoped>
.warehouse-add-container {
}

.page-title {
  font-size: 18px;
  font-weight: 600;
}

:deep(.el-form) {
  max-width: 800px;
  margin: 0 auto;
}

:deep(.el-divider__text) {
  font-weight: 600;
  color: #409eff;
}
</style>
