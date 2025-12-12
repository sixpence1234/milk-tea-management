<template>
  <div class="warehouse-products-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>仓库商品管理</span>
          <div>
            <el-button @click="$router.back()">返回</el-button>
            <el-button type="primary" @click="handleAdd">添加商品</el-button>
          </div>
        </div>
      </template>

      <!-- Search Form -->
      <el-form :inline="true" :model="searchForm" style="margin-bottom: 20px">
        <el-form-item label="商品名称">
          <el-input
            v-model="searchForm.productName"
            placeholder="请输入商品名称"
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
        <el-table-column prop="stockQuantity" label="库存数量" width="100" />
        <el-table-column prop="safetyStock" label="安全库存" width="100" />
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
        <el-table-column prop="locationCode" label="库位编码" width="120" />
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
        <el-table-column label="操作" fixed="right">
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

    <!-- Add/Edit Dialog -->
    <el-dialog
      v-model="formDialogVisible"
      :title="isEdit ? '编辑商品' : '添加商品'"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px">
        <template v-if="!isEdit">
          <el-form-item label="商品模板" prop="productTemplateId">
            <el-select
              v-model="form.productTemplateId"
              placeholder="请选择商品模板"
              style="width: 100%"
              filterable
              @change="handleProductTemplateChange"
            >
              <el-option
                v-for="template in productTemplates"
                :key="template.id"
                :label="`${template.productName} (${template.productCode})`"
                :value="template.id"
              />
            </el-select>
            <el-button type="text" @click="showTemplateSelector = true" style="margin-left: 10px"
              >选择模板</el-button
            >
          </el-form-item>
          <el-form-item label="SKU" prop="skuId" v-if="form.productTemplateId">
            <el-select v-model="form.skuId" placeholder="请选择SKU" style="width: 100%">
              <el-option
                v-for="sku in availableSkus"
                :key="sku.id"
                :label="`${sku.skuCode} - ${sku.specUnit || '默认规格'}`"
                :value="sku.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="初始库存" prop="stockQuantity">
            <el-input-number v-model="form.stockQuantity" :min="0" style="width: 100%" />
          </el-form-item>
        </template>
        <el-form-item label="安全库存" prop="safetyStock">
          <el-input-number v-model="form.safetyStock" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="采购价格" prop="purchasePrice">
          <el-input-number
            v-model="form.purchasePrice"
            :min="0.01"
            :max="99999.99"
            :precision="2"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="销售价格" prop="sellingPrice">
          <el-input-number
            v-model="form.sellingPrice"
            :min="0.01"
            :max="99999.99"
            :precision="2"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="库位编码" prop="locationCode">
          <el-input v-model="form.locationCode" placeholder="请输入库位编码" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
      </template>
    </el-dialog>

    <!-- Product Template Selector Dialog -->
    <el-dialog v-model="showTemplateSelector" title="选择商品模板" width="750px">
      <el-form
        :inline="true"
        :model="templateSearchForm"
        style="margin-bottom: 20px"
        @submit.prevent
      >
        <el-form-item label="关键词">
          <el-input
            v-model="templateSearchForm.keyword"
            placeholder="商品名称或编码"
            clearable
            style="width: 200px"
            @keyup.enter="loadProductTemplates"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadProductTemplates">搜索</el-button>
        </el-form-item>
      </el-form>
      <el-table
        :data="productTemplates"
        style="width: 100%"
        v-loading="templateLoading"
        @row-click="handleTemplateSelect"
        highlight-current-row
      >
        <el-table-column prop="productCode" label="商品编码" width="150" />
        <el-table-column prop="productName" label="商品名称" width="200" />
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'ACTIVE' ? 'success' : 'danger'">
              {{ scope.row.status === 'ACTIVE' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-model:current-page="templatePagination.pageNum"
        v-model:page-size="templatePagination.pageSize"
        :page-sizes="[10, 20, 50]"
        :total="templatePagination.total"
        layout="total, sizes, prev, pager, next"
        @size-change="loadProductTemplates"
        @current-change="loadProductTemplates"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-dialog>

    <!-- Detail Dialog -->
    <el-dialog v-model="detailDialogVisible" title="商品详情" width="600px">
      <div v-if="productDetail">
        <div v-if="productDetail.coverUrl" style="text-align: center; margin-bottom: 20px">
          <el-image
            :src="getImageUrl(productDetail.coverUrl)"
            :preview-src-list="[getImageUrl(productDetail.coverUrl)]"
            fit="contain"
            style="max-width: 300px; max-height: 300px; border-radius: 8px"
          />
        </div>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="商品编码">{{
            productDetail.productCode
          }}</el-descriptions-item>
          <el-descriptions-item label="商品名称">{{
            productDetail.productName
          }}</el-descriptions-item>
          <el-descriptions-item label="SKU编码">{{ productDetail.skuCode }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="productDetail.status === 1 ? 'success' : 'danger'">
              {{ productDetail.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="库存数量">{{
            productDetail.stockQuantity
          }}</el-descriptions-item>
          <el-descriptions-item label="安全库存">{{
            productDetail.safetyStock
          }}</el-descriptions-item>
          <el-descriptions-item label="采购价格"
            >¥{{ productDetail.purchasePrice?.toFixed(2) || '0.00' }}</el-descriptions-item
          >
          <el-descriptions-item label="销售价格"
            >¥{{ productDetail.sellingPrice?.toFixed(2) || '0.00' }}</el-descriptions-item
          >
          <el-descriptions-item label="库位编码">{{
            productDetail.locationCode || '-'
          }}</el-descriptions-item>

          <el-descriptions-item label="备注" :span="2">{{
            productDetail.remark || '-'
          }}</el-descriptions-item>
          <el-descriptions-item label="创建时间" :span="2">{{
            productDetail.createdTime
          }}</el-descriptions-item>
          <el-descriptions-item label="更新时间" :span="2">{{
            productDetail.updatedTime
          }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getWarehouseProductList,
  getWarehouseProductById,
  createWarehouseProduct,
  updateWarehouseProduct,
  deleteWarehouseProduct,
  updateWarehouseProductStatus,
} from '@/api/warehouse-product'
import { getAvailableProductTemplates, getProductTemplateDetail } from '@/api/product'
import { getImageUrl } from '@/utils/image'

const route = useRoute()
const warehouseId = ref(route.query.warehouseId)

// Search form
const searchForm = reactive({
  productName: '',
  status: null,
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

// Detail dialog
const detailDialogVisible = ref(false)
const productDetail = ref(null)

// Form dialog
const formDialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const submitLoading = ref(false)
const form = reactive({
  id: null,
  productTemplateId: null,
  skuId: null,
  stockQuantity: 0,
  safetyStock: 0,
  purchasePrice: null,
  sellingPrice: null,
  locationCode: '',
  remark: '',
})

const formRules = {
  productTemplateId: [{ required: true, message: '请选择商品模板', trigger: 'change' }],
  skuId: [{ required: true, message: '请选择SKU', trigger: 'change' }],
}

// Product template selector
const showTemplateSelector = ref(false)
const productTemplates = ref([])
const templateLoading = ref(false)
const templateSearchForm = reactive({
  keyword: '',
})
const templatePagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
})
const availableSkus = ref([])
const selectedTemplateDetail = ref(null)

// Load product list
const loadProductList = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      warehouseId: warehouseId.value,
      productName: searchForm.productName || undefined,
      status: searchForm.status !== null ? searchForm.status : undefined,
    }
    const res = await getWarehouseProductList(params)
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
  searchForm.productName = ''
  searchForm.status = null
  pagination.pageNum = 1
  loadProductList()
}

// Handle add
const handleAdd = () => {
  isEdit.value = false
  resetForm()
  formDialogVisible.value = true
  loadProductTemplates()
}

// Handle edit
const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(form, {
    id: row.id,
    safetyStock: row.safetyStock,
    purchasePrice: row.purchasePrice,
    sellingPrice: row.sellingPrice,
    locationCode: row.locationCode,
    remark: row.remark,
  })
  formDialogVisible.value = true
}

// Handle view
const handleView = async (row) => {
  try {
    const res = await getWarehouseProductById(row.id)
    if (res.code === 200) {
      productDetail.value = res.data
      detailDialogVisible.value = true
    }
  } catch (error) {
    ElMessage.error('加载商品详情失败')
  }
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
        const res = await deleteWarehouseProduct(row.id)
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

// Handle status change
const handleStatusChange = async (row) => {
  try {
    const res = await updateWarehouseProductStatus({
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
  loadProductList()
}

const handleCurrentChange = () => {
  loadProductList()
}

// Load product templates
const loadProductTemplates = async () => {
  templateLoading.value = true
  try {
    const res = await getAvailableProductTemplates({
      pageNum: templatePagination.pageNum,
      pageSize: templatePagination.pageSize,
      keyword: templateSearchForm.keyword || undefined,
    })
    if (res.code === 200) {
      productTemplates.value = res.data.records || []
      templatePagination.total = res.data.total || 0
    }
  } catch (error) {
    ElMessage.error('加载商品模板失败')
  } finally {
    templateLoading.value = false
  }
}

// Handle template select
const handleTemplateSelect = async (row) => {
  form.productTemplateId = row.id
  showTemplateSelector.value = false
  await loadTemplateDetail(row.id)
}

// Handle product template change
const handleProductTemplateChange = async (templateId) => {
  if (templateId) {
    await loadTemplateDetail(templateId)
  } else {
    availableSkus.value = []
    form.skuId = null
  }
}

// Load template detail
const loadTemplateDetail = async (templateId) => {
  try {
    const res = await getProductTemplateDetail({ id: templateId })
    if (res.code === 200) {
      selectedTemplateDetail.value = res.data
      availableSkus.value = res.data.skus || []
      form.skuId = null
    }
  } catch (error) {
    ElMessage.error('加载模板详情失败')
  }
}

// Handle submit
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        if (isEdit.value) {
          const data = {
            id: form.id,
            safetyStock: form.safetyStock,
            purchasePrice: form.purchasePrice,
            sellingPrice: form.sellingPrice,
            locationCode: form.locationCode,
            remark: form.remark,
          }
          const res = await updateWarehouseProduct(data)
          if (res.code === 200) {
            ElMessage.success('更新成功')
            formDialogVisible.value = false
            loadProductList()
          }
        } else {
          const data = {
            warehouseId: warehouseId.value,
            productTemplateId: form.productTemplateId,
            skuId: form.skuId,
            stockQuantity: form.stockQuantity,
            safetyStock: form.safetyStock,
            purchasePrice: form.purchasePrice,
            sellingPrice: form.sellingPrice,
            locationCode: form.locationCode,
            remark: form.remark,
          }
          const res = await createWarehouseProduct(data)
          if (res.code === 200) {
            ElMessage.success('添加成功')
            formDialogVisible.value = false
            loadProductList()
          }
        }
      } catch (error) {
        ElMessage.error(isEdit.value ? '更新失败' : '添加失败')
      } finally {
        submitLoading.value = false
      }
    }
  })
}

// Reset form
const resetForm = () => {
  Object.assign(form, {
    id: null,
    productTemplateId: null,
    skuId: null,
    stockQuantity: 0,
    safetyStock: 0,
    purchasePrice: null,
    sellingPrice: null,
    locationCode: '',
    remark: '',
  })
  availableSkus.value = []
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// Initialize
onMounted(() => {
  if (!warehouseId.value) {
    ElMessage.warning('缺少仓库ID参数')
    return
  }
  loadProductList()
})
</script>

<style lang="scss" scoped>
.warehouse-products-container {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
