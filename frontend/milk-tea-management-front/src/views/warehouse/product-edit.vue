<template>
  <div class="product-edit-container">
    <el-page-header @back="handleBack" title="返回">
      <template #content>
        <span class="page-title">编辑商品</span>
      </template>
    </el-page-header>

    <el-card v-loading="loading" style="margin-top: 20px">
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="120px">
        <el-divider content-position="left">商品信息</el-divider>

        <!-- Display only fields -->
        <el-form-item label="商品编码">
          <el-input v-model="productInfo.productCode" disabled />
        </el-form-item>

        <el-form-item label="商品名称">
          <el-input v-model="productInfo.productName" disabled />
        </el-form-item>

        <el-form-item label="SKU编码">
          <el-input v-model="productInfo.skuCode" disabled />
        </el-form-item>

        <el-divider content-position="left">库存信息</el-divider>

        <el-form-item label="当前库存">
          <el-input v-model="productInfo.stockQuantity" disabled>
            <template #append>件</template>
          </el-input>
        </el-form-item>

        <!-- Editable fields -->
        <el-form-item label="安全库存" prop="safetyStock">
          <el-input-number v-model="form.safetyStock" :min="0" style="width: 100%" />
        </el-form-item>

        <el-divider content-position="left">价格信息</el-divider>

        <el-form-item label="采购价格" prop="purchasePrice">
          <el-input-number
            v-model="form.purchasePrice"
            :min="0.01"
            :max="99999.99"
            :precision="2"
            style="width: 100%"
            placeholder="请输入采购价格"
          />
        </el-form-item>

        <el-form-item label="销售价格" prop="sellingPrice">
          <el-input-number
            v-model="form.sellingPrice"
            :min="0.01"
            :max="99999.99"
            :precision="2"
            style="width: 100%"
            placeholder="请输入销售价格"
          />
        </el-form-item>

        <el-divider content-position="left">其他信息</el-divider>

        <el-form-item label="库位编码" prop="locationCode">
          <el-input v-model="form.locationCode" placeholder="请输入库位编码" style="width: 100%" />
        </el-form-item>

        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="form.remark"
            type="textarea"
            :rows="4"
            placeholder="请输入备注"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="submitLoading">保存</el-button>
          <el-button @click="handleBack">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getWarehouseProductById, updateWarehouseProduct } from '@/api/warehouse-product'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const submitLoading = ref(false)
const formRef = ref(null)

const productInfo = reactive({
  productCode: '',
  productName: '',
  skuCode: '',
  stockQuantity: 0,
})

const form = reactive({
  id: null,
  safetyStock: 0,
  purchasePrice: null,
  sellingPrice: null,
  locationCode: '',
  remark: '',
})

const formRules = {
  purchasePrice: [{ required: true, message: '请输入采购价格', trigger: 'blur' }],
  sellingPrice: [{ required: true, message: '请输入销售价格', trigger: 'blur' }],
}

// Load product detail
const loadProductDetail = async () => {
  const id = route.params.id
  if (!id) {
    ElMessage.error('商品ID不存在')
    handleBack()
    return
  }

  loading.value = true
  try {
    const res = await getWarehouseProductById(id)
    if (res.code === 200) {
      const data = res.data
      // Set display info
      productInfo.productCode = data.productCode
      productInfo.productName = data.productName
      productInfo.skuCode = data.skuCode
      productInfo.stockQuantity = data.stockQuantity

      // Set form data
      form.id = data.id
      form.safetyStock = data.safetyStock
      form.purchasePrice = data.purchasePrice
      form.sellingPrice = data.sellingPrice
      form.locationCode = data.locationCode || ''
      form.remark = data.remark || ''
    }
  } catch (error) {
    console.error('Failed to load product detail:', error)
    ElMessage.error('加载商品详情失败')
    handleBack()
  } finally {
    loading.value = false
  }
}

// Handle submit
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
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
          router.push({ name: 'WarehouseMyProducts' })
        }
      } catch (error) {
        console.error('Failed to update product:', error)
        ElMessage.error('更新失败')
      } finally {
        submitLoading.value = false
      }
    }
  })
}

// Handle back
const handleBack = () => {
  router.back()
}

onMounted(() => {
  loadProductDetail()
})
</script>

<style scoped>
.product-edit-container {
}

.page-title {
  font-size: 18px;
  font-weight: 600;
}

:deep(.el-form) {
  max-width: 800px;
  margin: 0 auto;
}

:deep(.el-divider__text) {
  font-weight: 600;
  color: #409eff;
}
</style>
