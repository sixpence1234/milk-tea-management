<template>
  <div class="store-add-container">
    <el-page-header @back="handleBack" title="返回">
      <template #content>
        <span class="page-title">创建门店</span>
      </template>
    </el-page-header>

    <el-card v-loading="loading" style="margin-top: 20px">
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="120px">
        <el-divider content-position="left">基本信息</el-divider>

        <el-form-item label="门店编码" prop="storeCode">
          <el-input v-model="form.storeCode" placeholder="请输入门店编码" style="width: 100%" />
        </el-form-item>

        <el-form-item label="门店名称" prop="storeName">
          <el-input v-model="form.storeName" placeholder="请输入门店名称" style="width: 100%" />
        </el-form-item>

        <el-form-item label="门店邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" style="width: 100%" />
        </el-form-item>

        <el-form-item label="地址" prop="address">
          <el-input v-model="form.address" placeholder="请输入地址" style="width: 100%" />
        </el-form-item>

        <el-form-item label="描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入描述"
            style="width: 100%"
          />
        </el-form-item>

        <el-divider content-position="left">联系信息</el-divider>

        <el-form-item label="门店联系人" prop="contactPerson">
          <el-input v-model="form.contactPerson" placeholder="请输入联系人" style="width: 100%" />
        </el-form-item>

        <el-form-item label="联系电话" prop="contactPhone">
          <el-input v-model="form.contactPhone" placeholder="请输入联系电话" style="width: 100%" />
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
            创建门店
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
import { createStore } from '@/api/store'
import { getManagerOptions } from '@/api/user'

const router = useRouter()

const loading = ref(false)
const submitLoading = ref(false)
const formRef = ref(null)

const form = reactive({
  storeCode: '',
  storeName: '',
  email: '',
  description: '',
  address: '',
  contactPerson: '',
  contactPhone: '',
  managerId: null,
  remark: '',
})

const formRules = {
  storeCode: [{ required: true, message: '请输入门店编码', trigger: 'blur' }],
  storeName: [{ required: true, message: '请输入门店名称', trigger: 'blur' }],
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
          storeCode: form.storeCode,
          storeName: form.storeName,
          email: form.email,
          description: form.description,
          address: form.address,
          contactPerson: form.contactPerson,
          contactPhone: form.contactPhone,
          managerId: form.managerId,
          remark: form.remark,
        }
        const res = await createStore(data)
        if (res.code === 200) {
          ElMessage.success('创建成功')
          router.push({ name: 'Stores' })
        }
      } catch (error) {
        console.error('Failed to create store:', error)
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
.store-add-container {
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
