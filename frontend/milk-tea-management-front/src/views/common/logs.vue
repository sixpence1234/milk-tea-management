<template>
  <div class="stock-logs-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>日志管理</span>
        </div>
      </template>

      <!-- Tabs -->
      <el-tabs v-model="activeTab" @tab-change="handleTabChange" style="margin-bottom: 20px">
        <el-tab-pane label="全部" name="" />
        <el-tab-pane label="登录日志" name="LOGIN" />
        <el-tab-pane label="订单日志" name="ORDER_STATUS" />
        <el-tab-pane label="库存日志" name="INVENTORY" />
        <el-tab-pane label="操作日志" name="OPERATION" />
      </el-tabs>

      <!-- Search Form -->
      <el-form :inline="true" :model="searchForm" style="margin-bottom: 20px">
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 400px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- Table -->
      <el-table :data="logList" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />

        <el-table-column prop="username" label="操作人" width="100" />
        <el-table-column prop="userRole" label="角色" width="100" />
        <el-table-column prop="ipAddress" label="IP地址" width="130" />
        <el-table-column label="日志类型" width="100">
          <template #default="scope">
            <el-tag :type="getLogTypeTagType(scope.row.logType)">
              {{ scope.row.logTypeDesc || scope.row.logType }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="description" label="操作描述" show-overflow-tooltip />
        <el-table-column label="状态" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.success === 1 ? 'success' : 'danger'" size="small">
              {{ scope.row.success === 1 ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="executionTime" label="耗时(ms)" width="100" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
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
import { ElMessage } from 'element-plus'
import { getLogList } from '@/api/log'

// Active tab
const activeTab = ref('')

// Search form
const searchForm = reactive({
  logType: '',
})

const dateRange = ref([])

// Pagination
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
})

// Table data
const logList = ref([])
const loading = ref(false)

// Load data
const loadData = async () => {
  try {
    loading.value = true
    const params = {
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      logType: searchForm.logType || undefined,
      startTime: dateRange.value?.[0] || undefined,
      endTime: dateRange.value?.[1] || undefined,
    }

    const res = await getLogList(params)
    if (res.code === 200) {
      logList.value = res.data.records || []
      pagination.total = res.data.total || 0
    } else {
      ElMessage.error(res.msg || '获取操作日志失败')
    }
  } catch (error) {
    console.error('Load operation logs error:', error)
    ElMessage.error('获取操作日志失败')
  } finally {
    loading.value = false
  }
}

// Handle tab change
const handleTabChange = () => {
  searchForm.logType = activeTab.value
  pagination.pageNum = 1
  loadData()
}

// Search
const handleSearch = () => {
  pagination.pageNum = 1
  loadData()
}

// Reset
const handleReset = () => {
  searchForm.logType = ''
  dateRange.value = []
  activeTab.value = ''
  pagination.pageNum = 1
  loadData()
}

// Get log type tag color
const getLogTypeTagType = (logType) => {
  const typeMap = {
    LOGIN: 'success',
    ORDER_STATUS: 'warning',
    INVENTORY: 'primary',
    GENERAL: 'info',
  }
  return typeMap[logType] || 'info'
}

// Handle page size change
const handleSizeChange = (val) => {
  pagination.pageSize = val
  pagination.pageNum = 1
  loadData()
}

// Handle current page change
const handleCurrentChange = (val) => {
  pagination.pageNum = val
  loadData()
}

// Mount
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.stock-logs-container {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
