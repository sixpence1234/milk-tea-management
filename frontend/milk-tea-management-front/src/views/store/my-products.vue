<template>
  <div class="store-products-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>门店商品管理</span>
          <el-button type="primary" @click="handleAdd">添加商品</el-button>
        </div>
      </template>

      <!-- Search Form -->
      <el-form :inline="true" :model="searchForm" style="margin-bottom: 20px">
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="商品名称或编码"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- Table -->
      <el-table :data="productList" style="width: 100%" v-loading="loading">
        <el-table-column label="封面图片" width="100">
          <template #default="scope">
            <el-image
              v-if="scope.row.coverUrl"
              :src="getImageUrl(scope.row.coverUrl)"
              fit="cover"
              style="width: 60px; height: 60px; border-radius: 4px"
            />
            <span v-else>无图片</span>
          </template>
        </el-table-column>
        <el-table-column prop="productCode" label="商品编码" width="150" />
        <el-table-column prop="productName" label="商品名称" width="180" />
        <el-table-column prop="skuCode" label="SKU编码" width="150" />
        <el-table-column prop="specInfo" label="规格信息" width="150" />
        <el-table-column prop="stockQuantity" label="库存数量" width="100" />
        <!-- <el-table-column prop="safetyStock" label="安全库存" width="100" /> -->
        <el-table-column prop="purchasePrice" label="采购价格" width="100">
          <template #default="scope">
            ¥{{ scope.row.purchasePrice?.toFixed(2) || '0.00' }}
          </template>
        </el-table-column>
        <el-table-column prop="sellingPrice" label="销售价格" width="100">
          <template #default="scope">
            ¥{{ scope.row.sellingPrice?.toFixed(2) || '0.00' }}
          </template>
        </el-table-column>
        <el-table-column prop="shelfLocation" label="货架位置" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
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
import { getStoreProductList, deleteStoreProduct } from '@/api/store-product'
import { getImageUrl } from '@/utils/image'

const router = useRouter()

// Search form
const searchForm = reactive({
  keyword: '',
})

// Pagination
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
})

// Table data
const productList = ref([])
const loading = ref(false)

// Load product list
const loadProductList = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword || undefined,
    }
    const res = await getStoreProductList(params)
    if (res.code === 200) {
      productList.value = res.data.records || []
      pagination.total = res.data.total || 0
    }
  } catch (error) {
    ElMessage.error('加载商品列表失败')
  } finally {
    loading.value = false
  }
}

// Handle search
const handleSearch = () => {
  pagination.pageNum = 1
  loadProductList()
}

// Handle reset
const handleReset = () => {
  searchForm.keyword = ''
  pagination.pageNum = 1
  loadProductList()
}

// Handle add
const handleAdd = () => {
  router.push({ name: 'StoreProductAdd' })
}

// Handle edit
const handleEdit = (row) => {
  router.push({ name: 'StoreProductEdit', params: { id: row.id } })
}

// Handle view
const handleView = (row) => {
  router.push({ name: 'StoreProductDetail', params: { id: row.id } })
}

// Handle delete
const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该商品吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        const res = await deleteStoreProduct({ id: row.id })
        if (res.code === 200) {
          ElMessage.success('删除成功')
          loadProductList()
        }
      } catch (error) {
        ElMessage.error('删除失败')
      }
    })
    .catch(() => {})
}

// Pagination handlers
const handleSizeChange = () => {
  loadProductList()
}

const handleCurrentChange = () => {
  loadProductList()
}

// Initialize
onMounted(() => {
  loadProductList()
})
</script>

<style lang="scss" scoped>
.store-products-container {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
