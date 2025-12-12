<template>
  <div class="create-requisition-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>创建拿货单</span>
          <el-button @click="handleBack">返回</el-button>
        </div>
      </template>

      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="选择仓库" prop="toWarehouseId">
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
        </el-form-item>

        <el-form-item label="配送方式" prop="deliveryType">
          <el-radio-group v-model="form.deliveryType">
            <el-radio label="DELIVERY">配送</el-radio>
            <el-radio label="SELF_PICKUP">自提</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="form.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
            maxlength="500"
            show-word-limit
            style="width: 500px"
          />
        </el-form-item>

        <el-form-item label="商品列表" required>
          <el-button type="primary" @click="handleAddProduct" :disabled="!form.toWarehouseId">
            添加商品
          </el-button>
          <el-table :data="form.items" style="width: 100%; margin-top: 10px" border>
            <el-table-column label="封面" width="80">
              <template #default="scope">
                <el-image
                  v-if="scope.row.coverUrl"
                  :src="getImageUrl(scope.row.coverUrl)"
                  :preview-src-list="[getImageUrl(scope.row.coverUrl)]"
                  fit="cover"
                  style="width: 50px; height: 50px; border-radius: 4px"
                />
                <span v-else>无图片</span>
              </template>
            </el-table-column>
            <el-table-column prop="productName" label="商品名称" width="180" />
            <el-table-column prop="skuCode" label="SKU编码" width="150" />

            <el-table-column prop="stockQuantity" label="库存数量" width="120" />
            <el-table-column label="采购数量" width="150">
              <template #default="scope">
                <el-input-number
                  v-model="scope.row.quantity"
                  :min="1"
                  :max="Math.max(1, scope.row.stockQuantity)"
                  style="width: 120px"
                />
              </template>
            </el-table-column>
            <el-table-column prop="purchasePrice" label="单价" width="120">
              <template #default="scope">
                ¥{{ scope.row.purchasePrice?.toFixed(2) || '0.00' }}
              </template>
            </el-table-column>
            <el-table-column label="小计" width="120">
              <template #default="scope">
                ¥{{ ((scope.row.quantity || 0) * (scope.row.purchasePrice || 0)).toFixed(2) }}
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

          <div style="margin-top: 10px; text-align: right; font-size: 16px; font-weight: bold">
            总金额：¥{{ totalAmount.toFixed(2) }}
          </div>
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
      width="750px"
      :close-on-click-modal="false"
    >
      <div style="margin-bottom: 20px">
        <el-input
          v-model="productSearch"
          placeholder="搜索商品名称"
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
        <el-table-column label="封面" width="80">
          <template #default="scope">
            <el-image
              v-if="scope.row.coverUrl"
              :src="getImageUrl(scope.row.coverUrl)"
              :preview-src-list="[getImageUrl(scope.row.coverUrl)]"
              fit="cover"
              style="width: 50px; height: 50px; border-radius: 4px"
            />
            <span v-else>无图片</span>
          </template>
        </el-table-column>
        <el-table-column prop="productName" label="商品名称" width="180" />
        <el-table-column prop="skuCode" label="SKU编码" width="150" />

        <el-table-column prop="stockQuantity" label="库存数量" width="120" />
        <el-table-column prop="purchasePrice" label="单价" width="120">
          <template #default="scope">
            {{ scope.row.purchasePrice?.toFixed(2) || '0.00' }}
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
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getWarehouseList } from '@/api/warehouse'
import { getWarehouseProductList } from '@/api/warehouse-product'
import { createRequisition } from '@/api/requisition'
import { getImageUrl } from '@/utils/image'

const router = useRouter()
const formRef = ref(null)
const submitting = ref(false)

// 表单数据
const form = reactive({
  toWarehouseId: null,
  deliveryType: 'DELIVERY',
  remark: '',
  items: [],
})

// 表单验证规则
const rules = {
  toWarehouseId: [{ required: true, message: '请选择目标仓库', trigger: 'change' }],
  deliveryType: [{ required: true, message: '请选择配送方式', trigger: 'change' }],
}

// 仓库列表
const warehouseList = ref([])

// 商品对话框
const productDialogVisible = ref(false)
const productSearch = ref('')
const productLoading = ref(false)
const warehouseProducts = ref([])
const selectedProducts = ref([])
const productPagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
})

// 计算总金额
const totalAmount = computed(() => {
  return form.items.reduce((sum, item) => {
    return sum + (item.quantity || 0) * (item.purchasePrice || 0)
  }, 0)
})

// 加载仓库列表
const loadWarehouses = async () => {
  try {
    const res = await getWarehouseList({
      pageNum: 1,
      pageSize: 100,
      status: 1, // 只加载启用的仓库
    })
    if (res.code === 200 || res.code === 0) {
      warehouseList.value = res.data.records || []
    }
  } catch (error) {
    console.error('加载仓库列表失败:', error)
    ElMessage.error('加载仓库列表失败')
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
  productLoading.value = true
  try {
    const res = await getWarehouseProductList({
      pageNum: productPagination.pageNum,
      pageSize: productPagination.pageSize,
      warehouseId: form.toWarehouseId,
      productName: productSearch.value || undefined,
      status: 1, // 只加载启用的商品
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

  // 过滤掉库存为0的商品
  const validProducts = selectedProducts.value.filter((product) => product.stockQuantity > 0)
  const invalidCount = selectedProducts.value.length - validProducts.length

  if (validProducts.length === 0) {
    ElMessage.warning('所选商品库存均为0，无法添加')
    return
  }

  if (invalidCount > 0) {
    ElMessage.warning(`已过滤 ${invalidCount} 个库存为0的商品`)
  }

  // 添加到表单items，去重
  validProducts.forEach((product) => {
    const exists = form.items.find(
      (item) =>
        item.productTemplateId === product.productTemplateId && item.skuId === product.skuId,
    )
    if (!exists) {
      form.items.push({
        productTemplateId: product.productTemplateId,
        skuId: product.skuId,
        productName: product.productName,
        skuCode: product.skuCode,
        specInfo: product.specInfo,
        stockQuantity: product.stockQuantity,
        purchasePrice: product.purchasePrice,
        coverUrl: product.coverUrl,
        quantity: 1, // 默认数量为1
      })
    }
  })

  // 清空选中状态并关闭对话框
  selectedProducts.value = []
  productDialogVisible.value = false
}

// 删除商品
const handleRemoveProduct = (index) => {
  form.items.splice(index, 1)
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    if (form.items.length === 0) {
      ElMessage.warning('请至少添加一个商品')
      return
    }

    submitting.value = true
    try {
      const params = {
        toWarehouseId: form.toWarehouseId,
        deliveryType: form.deliveryType,
        remark: form.remark || undefined,
        items: form.items.map((item) => ({
          productTemplateId: item.productTemplateId,
          skuId: item.skuId,
          quantity: item.quantity,
        })),
      }

      const res = await createRequisition(params)
      if (res.code === 200 || res.code === 0) {
        ElMessage.success('创建拿货单成功')
        router.push({ name: 'StoreRequisitions' })
      } else {
        ElMessage.error(res.message || '创建失败')
      }
    } catch (error) {
      console.error('创建拿货单失败:', error)
      ElMessage.error('创建拿货单失败')
    } finally {
      submitting.value = false
    }
  })
}

// 返回
const handleBack = () => {
  router.back()
}

// 初始化
loadWarehouses()
</script>

<style scoped>
.create-requisition-container {
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
