<template>
  <div class="profile-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>个人中心</span>
        </div>
      </template>

      <el-tabs v-model="activeTab">
        <!-- 个人信息 -->
        <el-tab-pane label="个人信息" name="info">
          <el-descriptions :column="2" border v-if="userInfo">
            <el-descriptions-item label="用户ID">{{ userInfo.id }}</el-descriptions-item>
            <el-descriptions-item label="用户名">{{ userInfo.username }}</el-descriptions-item>
            <el-descriptions-item label="姓名">{{ userInfo.name }}</el-descriptions-item>
            <el-descriptions-item label="手机号">{{ userInfo.phone }}</el-descriptions-item>
            <el-descriptions-item label="性别">{{ userInfo.gender }}</el-descriptions-item>
            <el-descriptions-item label="终端类型">{{
              userInfo.terminalType
            }}</el-descriptions-item>
            <el-descriptions-item label="角色">{{ userInfo.userRole }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="userInfo.status === 'ACTIVE' ? 'success' : 'danger'">
                {{ userInfo.status }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="邮箱列表" :span="2">
              <div v-if="userInfo.emails && userInfo.emails.length > 0">
                <div v-for="(email, index) in userInfo.emails" :key="index">{{ email }}</div>
              </div>
              <span v-else style="color: #909399">无</span>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间" :span="2">{{
              userInfo.createTime
            }}</el-descriptions-item>
            <el-descriptions-item label="更新时间" :span="2">{{
              userInfo.updateTime
            }}</el-descriptions-item>
          </el-descriptions>
          <div style="margin-top: 20px">
            <el-button type="primary" @click="showEditDialog">修改信息</el-button>
          </div>
        </el-tab-pane>

        <!-- 修改密码 -->
        <el-tab-pane label="修改密码" name="password">
          <el-form
            :model="passwordForm"
            :rules="passwordRules"
            ref="passwordFormRef"
            label-width="120px"
            style="max-width: 500px"
          >
            <el-form-item label="原密码" prop="oldPassword">
              <el-input
                v-model="passwordForm.oldPassword"
                type="password"
                show-password
                placeholder="请输入原密码"
              />
            </el-form-item>
            <el-form-item label="新密码" prop="newPassword">
              <el-input
                v-model="passwordForm.newPassword"
                type="password"
                show-password
                placeholder="请输入新密码"
              />
            </el-form-item>
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input
                v-model="passwordForm.confirmPassword"
                type="password"
                show-password
                placeholder="请再次输入新密码"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleChangePassword">修改密码</el-button>
              <el-button @click="resetPasswordForm">重置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 编辑信息对话框 -->
    <el-dialog v-model="editDialogVisible" title="修改个人信息" width="600px">
      <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="120px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="editForm.phone" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-select v-model="editForm.gender" placeholder="请选择性别">
            <el-option label="Male" value="MALE" />
            <el-option label="Female" value="FEMALE" />
            <el-option label="Other" value="OTHER" />
          </el-select>
        </el-form-item>
        <el-form-item label="邮箱列表" prop="emails">
          <div style="width: 100%">
            <div
              v-for="(email, index) in editForm.emails"
              :key="index"
              style="display: flex; margin-bottom: 8px"
            >
              <el-input
                v-model="editForm.emails[index]"
                placeholder="请输入邮箱"
                style="flex: 1; margin-right: 8px"
              />
              <el-button type="danger" @click="removeEmail(index)">删除</el-button>
            </div>
            <div style="display: flex; align-items: center">
              <el-button
                type="primary"
                @click="addEmail"
                :disabled="editForm.emails.length >= 3"
                plain
                >添加邮箱</el-button
              >
              <span style="font-size: 12px; color: #909399; margin-left: 8px"
                >最多可添加3个邮箱</span
              >
            </div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleUpdateInfo">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getCurrentUserInfo, updateCurrentUserInfo, changePassword } from '@/api/user'

const activeTab = ref('info')
const userInfo = ref(null)
const editDialogVisible = ref(false)
const passwordFormRef = ref(null)
const editFormRef = ref(null)

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const editForm = reactive({
  name: '',
  phone: '',
  gender: '',
  emails: [],
})

const passwordRules = reactive({
  oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度必须在6-20个字符之间', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
})

const editRules = reactive({
  name: [{ max: 100, message: '最大长度 100', trigger: 'blur' }],
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
})

const fetchUserInfo = () => {
  getCurrentUserInfo().then((res) => {
    userInfo.value = res.data
  })
}

const showEditDialog = () => {
  editForm.name = userInfo.value.name
  editForm.phone = userInfo.value.phone
  editForm.gender = userInfo.value.gender
  editForm.emails = userInfo.value.emails ? [...userInfo.value.emails] : []
  editDialogVisible.value = true
}

const addEmail = () => {
  if (editForm.emails.length < 3) {
    editForm.emails.push('')
  }
}

const removeEmail = (index) => {
  editForm.emails.splice(index, 1)
}

const handleUpdateInfo = () => {
  editFormRef.value.validate((valid) => {
    if (valid) {
      updateCurrentUserInfo(editForm).then(() => {
        ElMessage.success('修改成功')
        editDialogVisible.value = false
        fetchUserInfo()
      })
    }
  })
}

const handleChangePassword = () => {
  passwordFormRef.value.validate((valid) => {
    if (valid) {
      changePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      }).then(() => {
        ElMessage.success('密码修改成功，请重新登录')
        resetPasswordForm()
        // 可以跳转到登录页
        setTimeout(() => {
          window.location.href = '/login'
        }, 1500)
      })
    }
  })
}

const resetPasswordForm = () => {
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  passwordFormRef.value?.clearValidate()
}

onMounted(() => {
  fetchUserInfo()
})
</script>

<style scoped>
.profile-container {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
