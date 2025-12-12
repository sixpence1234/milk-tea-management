<template>
  <div class="stores-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>门店管理</span>
          <el-button type="primary" @click="handleCreate">创建门店</el-button>
        </div>
      </template>

      <!-- Search Form -->
      <el-form :inline="true" :model="searchForm" style="margin-bottom: 20px">
        <el-form-item label="门店名称">
          <el-input
            v-model="searchForm.storeName"
            placeholder="请输入门店名称"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="负责人名称">
          <el-input
            v-model="searchForm.managerName"
            placeholder="请输入负责人名称"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            style="width: 150px"
          >
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- Table -->
      <el-table :data="storeList" style="width: 100%" v-loading="loading">
        <el-table-column prop="storeCode" label="门店编码" width="150" />
        <el-table-column prop="storeName" label="门店名称" min-width="150" />
        <el-table-column label="地址" min-width="200">
          <template #default="{ row }">
            {{ row.address || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="门店联系人" width="120">
          <template #default="{ row }">
            {{ row.contactPerson || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="门店联系电话" width="130">
          <template #default="{ row }">
            {{ row.contactPhone || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="门店邮箱" width="180" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.email || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="负责人账号" width="130">
          <template #default="{ row }">
            {{ row.managerUsername || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="负责人姓名" width="130">
          <template #default="{ row }">
            {{ row.managerName || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-switch
              v-model="scope.row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="scope">
            <el-button size="small" type="primary" @click="handleEnter(scope.row)">进入</el-button>
            <el-button size="small" @click="handleView(scope.row)">查看</el-button>
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <el-pagination
        v-model:current-page="pagination.pageNum"
        v-model:page-size="pagination.pageSize"
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { getStoreList, deleteStore, updateStoreStatus } from '@/api/store'

const router = useRouter()

// 搜索表单
const searchForm = reactive({
  storeName: '',
  managerName: '',
  status: null,
})

// 分页参数
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
})

// 门店列表
const storeList = ref([])
const loading = ref(false)

// 查询门店列表
const fetchStoreList = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      storeName: searchForm.storeName || undefined,
      managerName: searchForm.managerName || undefined,
      status: searchForm.status !== null ? searchForm.status : undefined,
    }
    const res = await getStoreList(params)
    if (res.code === 200) {
      storeList.value = res.data.records || []
      pagination.total = res.data.total || 0
    }
  } catch (error) {
    ElMessage.error('查询门店列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.pageNum = 1
  fetchStoreList()
}

// 重置
const handleReset = () => {
  searchForm.storeName = ''
  searchForm.managerName = ''
  searchForm.status = null
  handleSearch()
}

// 进入 - navigate to store products page
const handleEnter = (row) => {
  router.push({
    path: '/store/products',
    query: { storeId: row.id },
  })
}

// 新增
const handleCreate = () => {
  router.push({ name: 'StoreAdd' })
}

// 编辑
const handleEdit = (row) => {
  router.push({ name: 'StoreEdit', params: { id: row.id } })
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除门店 "${row.storeName}" 吗?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        const res = await deleteStore(row.id)
        if (res.code === 200) {
          ElMessage.success('删除成功')
          fetchStoreList()
        }
      } catch (error) {
        ElMessage.error('删除失败')
      }
    })
    .catch(() => {})
}

// 查看详情
const handleView = (row) => {
  router.push({ name: 'StoreDetail', params: { id: row.id } })
}

// 状态切换
const handleStatusChange = async (row) => {
  try {
    const res = await updateStoreStatus({
      id: row.id,
      status: row.status,
    })
    if (res.code === 200) {
      ElMessage.success('状态更新成功')
    } else {
      // Revert status on failure
      row.status = row.status === 1 ? 0 : 1
    }
  } catch (error) {
    ElMessage.error('状态更新失败')
    // Revert status on failure
    row.status = row.status === 1 ? 0 : 1
  }
}

// Pagination handlers
const handleSizeChange = () => {
  fetchStoreList()
}

const handleCurrentChange = () => {
  fetchStoreList()
}

// 初始化
onMounted(() => {
  fetchStoreList()
})
</script>

<style lang="scss" scoped>
.stores-container {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
