<template>
  <div class="product-add-container">
    <el-page-header @back="handleBack" title="返回">
      <template #content>
        <span class="page-title">添加商品</span>
      </template>
    </el-page-header>

    <el-card v-loading="loading" style="margin-top: 20px">
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="120px">
        <el-form-item label="商品模板" prop="productTemplateId">
          <div style="display: flex; gap: 10px; width: 100%">
            <el-input
              :value="selectedTemplateName"
              placeholder="请点击选择商品模板"
              readonly
              style="flex: 1"
            />
            <el-button type="primary" @click="showTemplateSelector = true">选择商品</el-button>
            <el-button v-if="selectedTemplate" @click="clearTemplate">清除</el-button>
          </div>
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
          <el-button type="primary" @click="handleSubmit" :loading="submitLoading">提交</el-button>
          <el-button @click="handleBack">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 商品模板选择器 -->
    <ProductTemplateSelector v-model="showTemplateSelector" @select="handleTemplateSelect" />
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { createWarehouseProduct } from '@/api/warehouse-product'
import { getProductTemplateDetail } from '@/api/product'
import ProductTemplateSelector from '@/components/ProductTemplateSelector.vue'

const router = useRouter()

const loading = ref(false)
const submitLoading = ref(false)
const formRef = ref(null)

// 商品模板选择器
const showTemplateSelector = ref(false)
const selectedTemplate = ref(null)

const selectedTemplateName = computed(() => {
  if (!selectedTemplate.value) return ''
  const { productCode, productName, brand, category } = selectedTemplate.value
  return `${productCode} - ${productName} (${brand} / ${category})`
})

const form = reactive({
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
  purchasePrice: [{ required: true, message: '请输入采购价格', trigger: 'blur' }],
  sellingPrice: [{ required: true, message: '请输入销售价格', trigger: 'blur' }],
}

const availableSkus = ref([])

// 处理商品模板选择
const handleTemplateSelect = async (template) => {
  selectedTemplate.value = template
  form.productTemplateId = template.id
  showTemplateSelector.value = false
  // 加载SKU列表
  await loadTemplateDetail(template.id)
}

// 清除选择
const clearTemplate = () => {
  selectedTemplate.value = null
  form.productTemplateId = null
  form.skuId = null
  availableSkus.value = []
}

// Load template detail
// Load template detail
const loadTemplateDetail = async (templateId) => {
  try {
    const res = await getProductTemplateDetail({ id: templateId })
    if (res.code === 200) {
      availableSkus.value = res.data.skus || []
      form.skuId = null
    }
  } catch (error) {
    console.error('Failed to load template detail:', error)
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
        const data = {
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
          router.push({ name: 'WarehouseMyProducts' })
        }
      } catch (error) {
        console.error('Failed to create product:', error)
        ElMessage.error('添加失败')
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
</script>

<style scoped>
.product-add-container {
}

.page-title {
  font-size: 18px;
  font-weight: 600;
}

:deep(.el-form) {
  max-width: 800px;
  margin: 0 auto;
}
</style>
