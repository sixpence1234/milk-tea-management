<template>
  <div class="warehouses-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>仓库管理</span>
          <el-button type="primary" @click="handleAdd">创建仓库</el-button>
        </div>
      </template>

      <!-- Search Form -->
      <el-form :inline="true" :model="searchForm" style="margin-bottom: 20px">
        <el-form-item label="仓库名称">
          <el-input
            v-model="searchForm.warehouseName"
            placeholder="请输入仓库名称"
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
      <el-table :data="warehouseList" style="width: 100%" v-loading="loading">
        <el-table-column prop="warehouseCode" label="仓库编码" width="150" />
        <el-table-column prop="warehouseName" label="仓库名称" width="180" />
        <el-table-column prop="address" label="地址" width="200" show-overflow-tooltip />
        <el-table-column prop="contactPerson" label="仓库联系人" width="120" />
        <el-table-column prop="contactPhone" label="仓库联系电话" width="140" />
        <el-table-column prop="email" label="仓库邮箱" width="180" show-overflow-tooltip />
        <el-table-column prop="managerUsername" label="负责人账号" width="180" />
        <el-table-column prop="managerName" label="负责人名称" width="150" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-switch
              v-model="scope.row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
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
import { getWarehouseList, deleteWarehouse, updateWarehouseStatus } from '@/api/warehouse'

const router = useRouter()

// Search form
const searchForm = reactive({
  warehouseName: '',
  managerName: '',
  status: null,
})

// Pagination
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
})

// Table data
const warehouseList = ref([])
const loading = ref(false)

// Load warehouse list
const loadWarehouseList = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      warehouseName: searchForm.warehouseName || undefined,
      managerName: searchForm.managerName || undefined,
      status: searchForm.status !== null ? searchForm.status : undefined,
    }
    const res = await getWarehouseList(params)
    if (res.code === 200) {
      warehouseList.value = res.data.records || []
      pagination.total = res.data.total || 0
    }
  } catch (error) {
    ElMessage.error('加载仓库列表失败')
  } finally {
    loading.value = false
  }
}

// Handle add - navigate to add page
const handleAdd = () => {
  router.push({ name: 'WarehouseAdd' })
}

// Handle enter - navigate to warehouse products page
const handleEnter = (row) => {
  router.push({
    path: '/warehouse/products',
    query: { warehouseId: row.id },
  })
}

// Handle edit - navigate to edit page
const handleEdit = (row) => {
  router.push({
    name: 'WarehouseEdit',
    params: { id: row.id },
  })
}

// Handle view - navigate to detail page
const handleView = (row) => {
  router.push({
    name: 'WarehouseDetail',
    params: { id: row.id },
  })
}

// Handle search
const handleSearch = () => {
  pagination.pageNum = 1
  loadWarehouseList()
}

// Handle reset
const handleReset = () => {
  searchForm.warehouseName = ''
  searchForm.managerName = ''
  searchForm.status = null
  pagination.pageNum = 1
  loadWarehouseList()
}

// Handle delete
const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该仓库吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        const res = await deleteWarehouse(row.id)
        if (res.code === 200) {
          ElMessage.success('删除成功')
          loadWarehouseList()
        }
      } catch (error) {
        ElMessage.error('删除失败')
      }
    })
    .catch(() => {})
}

// Handle status change
const handleStatusChange = async (row) => {
  try {
    const res = await updateWarehouseStatus({
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
  loadWarehouseList()
}

const handleCurrentChange = () => {
  loadWarehouseList()
}

// Initialize
onMounted(() => {
  loadWarehouseList()
})
</script>

<style lang="scss" scoped>
.warehouses-container {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
