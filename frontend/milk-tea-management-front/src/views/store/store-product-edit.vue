<template>
  <div class="store-product-edit-container">
    <el-page-header @back="handleBack" title="返回">
      <template #content>
        <span class="page-title">编辑商品</span>
      </template>
    </el-page-header>

    <el-card v-loading="loading" style="margin-top: 20px">
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="120px">
        <el-divider content-position="left">商品信息</el-divider>

        <el-form-item label="商品编码">
          <el-input v-model="productInfo.productCode" disabled />
        </el-form-item>

        <el-form-item label="商品名称">
          <el-input v-model="productInfo.productName" disabled />
        </el-form-item>

        <el-form-item label="SKU编码">
          <el-input v-model="productInfo.skuCode" disabled />
        </el-form-item>

        <el-form-item label="规格信息">
          <el-input v-model="productInfo.specInfo" disabled />
        </el-form-item>

        <el-divider content-position="left">库存信息</el-divider>

        <el-form-item label="当前库存">
          <el-input v-model.number="productInfo.stockQuantity" disabled />
        </el-form-item>

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

        <el-form-item label="货架位置" prop="shelfLocation">
          <el-input v-model="form.shelfLocation" placeholder="请输入货架位置" style="width: 100%" />
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
          <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
            保存
          </el-button>
          <el-button @click="handleBack">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getStoreProductById, updateStoreProduct } from '@/api/store-product'

const router = useRouter()
const route = useRoute()
const formRef = ref(null)
const loading = ref(false)
const submitLoading = ref(false)

const form = reactive({
  id: null,
  safetyStock: 0,
  purchasePrice: null,
  sellingPrice: null,
  shelfLocation: '',
  remark: '',
})

const productInfo = reactive({
  productCode: '',
  productName: '',
  skuCode: '',
  specInfo: '',
  stockQuantity: 0,
})

const formRules = {}

const loadProductDetail = async () => {
  const productId = route.params.id
  if (!productId) {
    ElMessage.error('商品ID不存在')
    router.back()
    return
  }

  loading.value = true
  try {
    const res = await getStoreProductById(productId)
    if (res.code === 200 && res.data) {
      const data = res.data
      form.id = data.id
      form.safetyStock = data.safetyStock
      form.purchasePrice = data.purchasePrice
      form.sellingPrice = data.sellingPrice
      form.shelfLocation = data.shelfLocation || ''
      form.remark = data.remark || ''

      productInfo.productCode = data.productCode
      productInfo.productName = data.productName
      productInfo.skuCode = data.skuCode
      productInfo.specInfo = data.specInfo || '-'
      productInfo.stockQuantity = data.stockQuantity
    } else {
      ElMessage.error(res.msg || '获取商品信息失败')
    }
  } catch (error) {
    ElMessage.error('获取商品信息失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

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
          shelfLocation: form.shelfLocation,
          remark: form.remark,
        }
        const res = await updateStoreProduct(data)
        if (res.code === 200) {
          ElMessage.success('更新成功')
          router.push({ name: 'StoreMyProducts' })
        } else {
          ElMessage.error(res.msg || '更新失败')
        }
      } catch (error) {
        ElMessage.error('更新失败')
        console.error(error)
      } finally {
        submitLoading.value = false
      }
    }
  })
}

const handleBack = () => {
  router.back()
}

onMounted(() => {
  loadProductDetail()
})
</script>

<style scoped>
.store-product-edit-container {
}

.page-title {
  font-size: 18px;
  font-weight: 600;
}
</style>
