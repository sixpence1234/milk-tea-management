<template>
  <div class="account-edit-container">
    <el-page-header @back="handleBack" title="返回">
      <template #content>
        <span class="page-title">编辑账号</span>
      </template>
    </el-page-header>

    <el-card v-loading="loading" style="margin-top: 20px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-divider content-position="left">基本信息</el-divider>

        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" disabled placeholder="用户名" style="width: 100%" />
        </el-form-item>

        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" style="width: 100%" />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            show-password
            placeholder="留空表示不修改密码"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入电话" style="width: 100%" />
        </el-form-item>

        <el-form-item label="性别" prop="gender">
          <el-select v-model="form.gender" placeholder="请选择性别" style="width: 100%">
            <el-option label="男" value="MALE" />
            <el-option label="女" value="FEMALE" />
            <el-option label="其他" value="OTHER" />
          </el-select>
        </el-form-item>

        <el-divider content-position="left">邮箱信息</el-divider>

        <el-form-item label="邮箱地址" prop="emails">
          <div style="width: 100%">
            <div
              v-for="(email, index) in form.emails"
              :key="index"
              style="display: flex; margin-bottom: 8px"
            >
              <el-input
                v-model="form.emails[index]"
                placeholder="请输入邮箱"
                style="flex: 1; margin-right: 8px"
              />
              <el-button type="danger" @click="removeEmail(index)">删除</el-button>
            </div>
            <div style="display: flex; align-items: center">
              <el-button type="primary" @click="addEmail" :disabled="form.emails.length >= 3" plain>
                添加邮箱
              </el-button>
              <span style="font-size: 12px; color: #909399; margin-left: 8px"
                >最多可添加3个邮箱</span
              >
            </div>
          </div>
        </el-form-item>

        <el-divider content-position="left">权限信息</el-divider>

        <el-form-item label="终端类型" prop="terminalType">
          <el-select
            v-model="form.terminalType"
            placeholder="请选择终端类型"
            :disabled="terminalTypeDisabled"
            style="width: 100%"
          >
            <el-option label="管理端" value="MANAGEMENT" />
            <el-option label="门店" value="STORE" />
            <el-option label="仓库" value="WAREHOUSE" />
            <el-option label="供应商" value="SUPPLIER" />
          </el-select>
        </el-form-item>

        <el-form-item label="角色" prop="userRole">
          <el-select
            v-model="form.userRole"
            placeholder="请选择角色"
            :disabled="roleDisabled"
            style="width: 100%"
          >
            <el-option label="管理员" value="MANAGER" />
            <el-option label="员工" value="EMPLOYEE" />
          </el-select>
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getUserDetail, updateUser } from '@/api/user'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const formRef = ref(null)
const loading = ref(false)
const submitLoading = ref(false)

const form = reactive({
  userId: null,
  username: '',
  name: '',
  password: '',
  phone: '',
  gender: '',
  terminalType: '',
  userRole: '',
  emails: [],
})

const rules = reactive({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 50, message: '长度应在 3 到 50 个字符之间', trigger: 'blur' },
  ],
  name: [{ max: 100, message: '最大长度 100', trigger: 'blur' }],
  password: [
    {
      validator: (rule, value, callback) => {
        if (value && (value.length < 6 || value.length > 20)) {
          callback(new Error('密码长度必须在6-20个字符之间'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
  emails: [
    {
      validator: (rule, value, callback) => {
        if (!value || value.length === 0) {
          callback()
          return
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        for (let email of value) {
          if (email && !emailRegex.test(email)) {
            callback(new Error('请输入有效的邮箱地址'))
            return
          }
        }
        callback()
      },
      trigger: 'blur',
    },
  ],
  terminalType: [{ required: true, message: '请选择终端类型', trigger: 'change' }],
  userRole: [{ required: true, message: '请选择角色', trigger: 'change' }],
})

// 根据当前用户类型限制可创建的类型
const isManagement = computed(() => userStore.terminalType === 'MANAGEMENT')

// 终端类型是否禁用（门店和仓库负责人不能修改）
const terminalTypeDisabled = computed(() => !isManagement.value)

// 角色是否禁用（门店和仓库负责人只能创建员工）
const roleDisabled = computed(() => !isManagement.value)

const addEmail = () => {
  if (form.emails.length < 3) {
    form.emails.push('')
  }
}

const removeEmail = (index) => {
  form.emails.splice(index, 1)
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
      const data = response.data
      form.userId = data.id
      form.username = data.username
      form.name = data.name
      form.password = '' // 编辑时密码留空
      form.phone = data.phone
      form.gender = data.gender
      form.terminalType = data.terminalType
      form.userRole = data.userRole
      form.emails = data.emails ? [...data.emails] : []
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

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        // 编辑时如果密码为空则不传 password 字段
        const updateData = { ...form }
        if (!updateData.password) {
          delete updateData.password
        }
        const response = await updateUser(updateData)
        if (response.code === 200) {
          ElMessage.success('编辑成功')
          router.push({ name: 'Account' })
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
  loadUserDetail()
})
</script>

<style scoped>
.account-edit-container {
}

.page-title {
  font-size: 18px;
  font-weight: 600;
}
</style>
