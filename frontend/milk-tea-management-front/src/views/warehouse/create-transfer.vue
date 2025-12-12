<template>
  <div class="create-transfer-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>创建调货单</span>
          <el-button @click="handleBack">返回</el-button>
        </div>
      </template>

      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="目标仓库" prop="toWarehouseId">
          <el-select
            v-model="form.toWarehouseId"
            placeholder="请选择目标仓库"
            style="width: 300px"
            @change="handleWarehouseChange"
          >
            <el-option
              v-for="warehouse in warehouseList"
              :key="warehouse.id"
              :label="warehouse.warehouseName"
              :value="warehouse.id"
            />
          </el-select>
          <el-alert
            title="请选择您要从哪个仓库调货"
            type="info"
            :closable="false"
            style="margin-top: 10px; width: 500px"
          />
        </el-form-item>

        <el-form-item label="调货原因" prop="reason">
          <el-input
            v-model="form.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入调货原因"
            maxlength="500"
            show-word-limit
            style="width: 500px"
          />
        </el-form-item>

        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="form.remark"
            type="textarea"
            :rows="2"
            placeholder="请输入备注信息（可选）"
            maxlength="500"
            show-word-limit
            style="width: 500px"
          />
        </el-form-item>

        <el-form-item label="调货商品" required>
          <el-button type="primary" @click="handleAddProduct" :disabled="!form.toWarehouseId">
            添加商品
          </el-button>
          <el-alert
            v-if="!form.toWarehouseId"
            title="请先选择目标仓库"
            type="warning"
            :closable="false"
            style="margin-top: 10px; width: 500px"
          />
          <el-table
            v-if="form.items.length > 0"
            :data="form.items"
            style="width: 100%; margin-top: 10px"
            border
          >
            <el-table-column type="index" label="序号" width="60" />
            <el-table-column prop="productCode" label="商品编码" width="150" />
            <el-table-column prop="productName" label="商品名称" width="200" />
            <el-table-column prop="skuCode" label="SKU编码" width="150" />
            <el-table-column prop="specInfo" label="规格信息" width="150" />
            <el-table-column prop="stockQuantity" label="可调数量" width="120">
              <template #default="scope">
                {{ scope.row.stockQuantity || 0 }}
              </template>
            </el-table-column>
            <el-table-column label="申请数量" width="150">
              <template #default="scope">
                <el-input-number
                  v-model="scope.row.requestQuantity"
                  :min="1"
                  :max="Math.max(1, scope.row.stockQuantity || 0)"
                  style="width: 120px"
                />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" fixed="right">
              <template #default="scope">
                <el-button type="danger" size="small" @click="handleRemoveProduct(scope.$index)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">提交</el-button>
          <el-button @click="handleBack">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 选择商品对话框 -->
    <el-dialog
      v-model="productDialogVisible"
      title="选择商品"
      width="900px"
      :close-on-click-modal="false"
    >
      <div style="margin-bottom: 20px">
        <el-input
          v-model="productSearch"
          placeholder="搜索商品名称或编码"
          style="width: 300px; margin-right: 10px"
          clearable
        />
        <el-button type="primary" @click="loadWarehouseProducts">搜索</el-button>
      </div>

      <el-table
        :data="warehouseProducts"
        v-loading="productLoading"
        @selection-change="handleProductSelectionChange"
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="productCode" label="商品编码" width="150" />
        <el-table-column prop="productName" label="商品名称" width="180" />
        <el-table-column prop="skuCode" label="SKU编码" width="150" />
        <el-table-column prop="specInfo" label="规格信息" width="150" />
        <el-table-column prop="stockQuantity" label="可调数量" width="120">
          <template #default="scope">
            {{ scope.row.stockQuantity || 0 }}
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="productPagination.pageNum"
        v-model:page-size="productPagination.pageSize"
        :total="productPagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadWarehouseProducts"
        @current-change="loadWarehouseProducts"
        style="margin-top: 20px; justify-content: center"
      />

      <template #footer>
        <el-button @click="productDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmProducts">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getWarehouseList } from '@/api/warehouse'
import { getWarehouseProductList } from '@/api/warehouse-product'
import { createTransferOrder } from '@/api/warehouse-transfer'

const router = useRouter()
const formRef = ref(null)
const submitting = ref(false)

// 表单数据
const form = reactive({
  toWarehouseId: null,
  reason: '',
  remark: '',
  items: [],
})

// 表单验证规则
const rules = {
  toWarehouseId: [{ required: true, message: '请选择目标仓库', trigger: 'change' }],
  reason: [{ required: true, message: '请输入调货原因', trigger: 'blur' }],
}

// 仓库列表
const warehouseList = ref([])

// 商品对话框
const productDialogVisible = ref(false)
const productSearch = ref('')
const productLoading = ref(false)
const warehouseProducts = ref([])
const selectedProducts = ref([])

// 商品分页
const productPagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
})

// 加载仓库列表
const loadWarehouses = async () => {
  try {
    const res = await getWarehouseList({
      pageNum: 1,
      pageSize: 100,
      status: 1, // 只加载启用状态的仓库
    })
    if (res.code === 200 || res.code === 0) {
      warehouseList.value = res.data.records || []
    }
  } catch (error) {
    console.error('加载仓库列表失败:', error)
  }
}

// 仓库变更
const handleWarehouseChange = () => {
  // 清空已选商品
  form.items = []
}

// 添加商品
const handleAddProduct = () => {
  if (!form.toWarehouseId) {
    ElMessage.warning('请先选择目标仓库')
    return
  }
  productDialogVisible.value = true
  loadWarehouseProducts()
}

// 加载仓库商品列表
const loadWarehouseProducts = async () => {
  if (!form.toWarehouseId) {
    return
  }

  productLoading.value = true
  try {
    const res = await getWarehouseProductList({
      warehouseId: form.toWarehouseId,
      pageNum: productPagination.pageNum,
      pageSize: productPagination.pageSize,
      productName: productSearch.value || undefined,
      status: 1, // 只加载启用状态的商品
    })

    if (res.code === 200 || res.code === 0) {
      warehouseProducts.value = res.data.records || []
      productPagination.total = res.data.total || 0
    }
  } catch (error) {
    console.error('加载商品列表失败:', error)
    ElMessage.error('加载商品列表失败')
  } finally {
    productLoading.value = false
  }
}

// 商品选择变更
const handleProductSelectionChange = (selection) => {
  selectedProducts.value = selection
}

// 确认选择商品
const handleConfirmProducts = () => {
  if (selectedProducts.value.length === 0) {
    ElMessage.warning('请至少选择一个商品')
    return
  }

  // 添加商品到表单，避免重复
  selectedProducts.value.forEach((product) => {
    const exists = form.items.find((item) => item.warehouseProductId === product.id)
    if (!exists) {
      form.items.push({
        warehouseProductId: product.id,
        productTemplateId: product.productTemplateId,
        productCode: product.productCode,
        productName: product.productName,
        skuId: product.skuId,
        skuCode: product.skuCode,
        specInfo: product.specInfo,
        stockQuantity: product.stockQuantity || 0,
        requestQuantity: 1,
      })
    }
  })

  productDialogVisible.value = false
  selectedProducts.value = []
}

// 删除商品
const handleRemoveProduct = (index) => {
  form.items.splice(index, 1)
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    if (form.items.length === 0) {
      ElMessage.warning('请至少添加一个商品')
      return
    }

    submitting.value = true

    const data = {
      toWarehouseId: form.toWarehouseId,
      reason: form.reason,
      remark: form.remark || undefined,
      items: form.items.map((item) => ({
        warehouseProductId: item.warehouseProductId,
        requestQuantity: item.requestQuantity,
      })),
    }

    const res = await createTransferOrder(data)

    if (res.code === 200 || res.code === 0) {
      ElMessage.success('创建调货单成功')
      router.push({ name: 'WarehouseTransfers' })
    } else {
      ElMessage.error(res.message || '创建调货单失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('创建调货单失败:', error)
      ElMessage.error('创建调货单失败')
    }
  } finally {
    submitting.value = false
  }
}

// 返回
const handleBack = () => {
  router.back()
}

// 初始化
loadWarehouses()
</script>

<style lang="scss" scoped>
.create-transfer-container {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
