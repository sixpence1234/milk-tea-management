<template>
  <div class="store-edit-container">
    <el-page-header @back="handleBack" title="返回">
      <template #content>
        <span class="page-title">编辑门店</span>
      </template>
    </el-page-header>

    <el-card v-loading="loading" style="margin-top: 20px">
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="120px">
        <el-divider content-position="left">基本信息</el-divider>

        <el-form-item label="门店编码" prop="storeCode">
          <el-input v-model="form.storeCode" disabled placeholder="门店编码" style="width: 100%" />
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
            保存
          </el-button>
          <el-button @click="handleBack">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getStoreById, updateStore } from '@/api/store'
import { getManagerOptions } from '@/api/user'

const router = useRouter()
const route = useRoute()
const formRef = ref(null)
const loading = ref(false)
const submitLoading = ref(false)

const form = reactive({
  id: null,
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

const loadStoreDetail = async () => {
  const storeId = route.params.id
  if (!storeId) {
    ElMessage.error('门店ID不存在')
    router.back()
    return
  }

  loading.value = true
  try {
    const response = await getStoreById(storeId)
    if (response.code === 200 && response.data) {
      Object.assign(form, response.data)
    } else {
      ElMessage.error(response.msg || '获取门店信息失败')
    }
  } catch (error) {
    ElMessage.error('获取门店信息失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const loadManagerOptions = async () => {
  try {
    const response = await getManagerOptions()
    if (response.code === 200 && response.data) {
      managerList.value = response.data
    }
  } catch (error) {
    console.error('获取负责人列表失败:', error)
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        const data = {
          id: form.id,
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
        const response = await updateStore(data)
        if (response.code === 200) {
          ElMessage.success('编辑成功')
          router.push({ name: 'Stores' })
        } else {
          ElMessage.error(response.msg || '编辑失败')
        }
      } catch (error) {
        ElMessage.error('编辑失败')
        console.error(error)
      } finally {
        submitLoading.value = false
      }
    }
  })
}

const handleBack = () => {
  router.back()
}

onMounted(() => {
  loadManagerOptions()
  loadStoreDetail()
})
</script>

<style scoped>
.store-edit-container {
}

.page-title {
  font-size: 18px;
  font-weight: 600;
}
</style>
