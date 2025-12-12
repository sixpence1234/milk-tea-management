<template>
  <div class="account-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>Account Management</span>
          <el-button type="primary" @click="handleAdd">Create Account</el-button>
        </div>
      </template>

      <!-- Search Form -->
      <el-form :inline="true" :model="searchForm" style="margin-bottom: 20px">
        <el-form-item label="Username">
          <el-input
            v-model="searchForm.username"
            placeholder="请输入用户名"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="Terminal Type">
          <el-select
            v-model="searchForm.terminalType"
            placeholder="请选择终端类型"
            clearable
            style="width: 150px"
          >
            <el-option label="Management" value="MANAGEMENT" />
            <el-option label="Store" value="STORE" />
            <el-option label="Warehouse" value="WAREHOUSE" />
            <el-option label="Supplier" value="SUPPLIER" />
          </el-select>
        </el-form-item>
        <el-form-item label="Role">
          <el-select
            v-model="searchForm.userRole"
            placeholder="请选择角色"
            clearable
            style="width: 150px"
          >
            <el-option label="Manager" value="MANAGER" />
            <el-option label="Employee" value="EMPLOYEE" />
          </el-select>
        </el-form-item>
        <el-form-item label="Status">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            style="width: 150px"
          >
            <el-option label="启用" value="ACTIVE" />
            <el-option label="禁用" value="DISABLED" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">search</el-button>
          <el-button @click="handleReset">reset</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="userList" style="width: 100%" v-loading="loading" :table-layout="fixed">
        <el-table-column prop="username" label="Username" width="160" />
        <el-table-column prop="name" label="Name" width="160" />
        <el-table-column prop="phone" label="Phone" width="160" />
        <el-table-column prop="gender" label="Gender" width="140" />
        <el-table-column prop="terminalType" label="Terminal Type" width="140" />
        <el-table-column prop="userRole" label="Role" width="140" />
        <el-table-column prop="status" label="Status" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'ACTIVE' ? 'success' : 'danger'">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Operations" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="handleView(scope.row)">View</el-button>
            <el-button size="small" @click="handleEdit(scope.row)">Edit</el-button>
            <el-button
              size="small"
              :type="scope.row.status === 'ACTIVE' ? 'warning' : 'success'"
              @click="handleToggleStatus(scope.row)"
            >
              {{ scope.row.status }}
            </el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)"
              >Delete</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.size"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getUsers, deleteUser, updateUserStatus } from '@/api/user'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const loading = ref(false)
const userList = ref([])

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0,
})

const searchForm = reactive({
  username: '',
  terminalType: '',
  userRole: '',
  status: '',
})

const fetchUsers = () => {
  loading.value = true
  const params = {
    pageNum: pagination.page,
    pageSize: pagination.size,
  }
  // 添加搜索条件
  if (searchForm.username) params.username = searchForm.username
  if (searchForm.terminalType) params.terminalType = searchForm.terminalType
  if (searchForm.userRole) params.userRole = searchForm.userRole
  if (searchForm.status) params.status = searchForm.status

  getUsers(params)
    .then((res) => {
      // 处理分页响应：records + total
      if (res.data.records) {
        userList.value = res.data.records
        pagination.total = res.data.total || 0
      } else if (res.data.list) {
        userList.value = res.data.list
        pagination.total = res.data.total || 0
      } else {
        userList.value = res.data
        pagination.total = res.data.length
      }
      loading.value = false
    })
    .catch(() => {
      loading.value = false
    })
}

const handleSizeChange = (val) => {
  pagination.size = val
  pagination.page = 1
  fetchUsers()
}

const handleCurrentChange = (val) => {
  pagination.page = val
  fetchUsers()
}

const handleSearch = () => {
  pagination.page = 1
  fetchUsers()
}

const handleReset = () => {
  searchForm.username = ''
  searchForm.terminalType = ''
  searchForm.userRole = ''
  searchForm.status = ''
  pagination.page = 1
  fetchUsers()
}

const handleAdd = () => {
  router.push({ name: 'AccountAdd' })
}

const handleView = (row) => {
  router.push({ name: 'AccountDetail', params: { id: row.id } })
}

const handleEdit = (row) => {
  router.push({ name: 'AccountEdit', params: { id: row.id } })
}

const handleDelete = (row) => {
  ElMessageBox.confirm('Are you sure to delete this user?', 'Warning', {
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
    type: 'warning',
  }).then(() => {
    deleteUser(row.id).then(() => {
      ElMessage.success('Delete completed')
      fetchUsers()
    })
  })
}

const handleToggleStatus = (row) => {
  const newStatus = row.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE'
  const actionText = newStatus === 'ACTIVE' ? '启用' : '禁用'

  ElMessageBox.confirm(`确定要${actionText}该用户吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    updateUserStatus(row.id, newStatus).then(() => {
      ElMessage.success(`${actionText}成功`)
      fetchUsers()
    })
  })
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
