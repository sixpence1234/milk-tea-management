<template>
  <div class="product-templates-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>商品模板库</span>
          <el-button type="primary" @click="handleAdd">创建商品模板</el-button>
        </div>
      </template>
      <!-- Search Form -->
      <el-form :inline="true" :model="searchForm" style="margin-bottom: 20px">
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="请输入商品名称、编码或描述"
            clearable
            style="width: 250px"
            @keyup.enter.native="handleSearch"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            style="width: 150px"
          >
            <el-option label="启用" :value="ProductStatus.ACTIVE" />
            <el-option label="禁用" :value="ProductStatus.DISABLED" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">search</el-button>
          <el-button @click="handleReset">reset</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="productList" style="width: 100%" v-loading="loading">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="productCode" label="商品编码" width="220" />
        <el-table-column prop="productName" label="商品名称" width="200" />
        <el-table-column label="商品封面" width="100">
          <template #default="scope">
            <el-image
              v-if="scope.row.coverUrl"
              :src="getImageUrl(scope.row.coverUrl)"
              style="width: 60px; height: 60px"
              fit="cover"
            />
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" width="160" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'ACTIVE' ? 'success' : 'danger'">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdTime" label="创建时间" width="180" />
        <el-table-column label="操作" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="handleView(scope.row)">查看</el-button>
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

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
import { getProductTemplateList, deleteProductTemplate } from '@/api/product'
import { getImageUrl } from '@/utils/image'

const router = useRouter()

// 商品状态枚举
const ProductStatus = {
  ACTIVE: 'ACTIVE',
  DISABLED: 'DISABLED',
}

const loading = ref(false)
const productList = ref([])

const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
})

const searchForm = reactive({
  keyword: '',
  status: '',
})

const fetchProducts = () => {
  loading.value = true
  const params = {
    pageNum: pagination.pageNum,
    pageSize: pagination.pageSize,
  }
  if (searchForm.keyword) params.keyword = searchForm.keyword
  if (searchForm.status !== '') params.status = searchForm.status

  getProductTemplateList(params)
    .then((res) => {
      if (res.data.records) {
        productList.value = res.data.records
        pagination.total = res.data.total || 0
      }
      loading.value = false
    })
    .catch(() => {
      loading.value = false
    })
}

const handleSizeChange = (val) => {
  pagination.pageSize = val
  pagination.pageNum = 1
  fetchProducts()
}

const handleCurrentChange = (val) => {
  pagination.pageNum = val
  fetchProducts()
}

const handleSearch = () => {
  pagination.pageNum = 1
  fetchProducts()
}

const handleReset = () => {
  searchForm.keyword = ''
  searchForm.status = ''
  pagination.pageNum = 1
  fetchProducts()
}

const handleAdd = () => {
  router.push({ name: 'ProductTemplateAdd' })
}

const handleView = (row) => {
  router.push({
    name: 'ProductTemplateDetail',
    params: { id: row.id },
  })
}

const handleEdit = (row) => {
  router.push({
    name: 'ProductTemplateEdit',
    params: { id: row.id },
  })
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该商品模板吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    deleteProductTemplate({ id: row.id }).then(() => {
      ElMessage.success('删除成功')
      fetchProducts()
    })
  })
}

onMounted(() => {
  fetchProducts()
})
</script>

<style scoped>
.product-templates-container {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
