<template>
  <div class="template-add-container">
    <el-page-header @back="handleBack" title="返回">
      <template #content>
        <span class="page-title">创建商品模板</span>
      </template>
    </el-page-header>

    <el-card v-loading="loading" style="margin-top: 20px">
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="120px">
        <el-divider content-position="left">基本信息</el-divider>

        <el-form-item label="商品编码" prop="productCode">
          <el-input v-model="form.productCode" placeholder="请输入商品编码" style="width: 100%" />
        </el-form-item>

        <el-form-item label="商品名称" prop="productName">
          <el-input v-model="form.productName" placeholder="请输入商品名称" style="width: 100%" />
        </el-form-item>

        <el-form-item label="封面图片" prop="coverUrl">
          <ImageUpload v-model="form.coverUrl" placeholder="点击上传封面图片" />
        </el-form-item>

        <el-form-item label="描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="请输入商品描述"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio value="ACTIVE">启用</el-radio>
            <el-radio value="DISABLED">禁用</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 商品规格 -->
        <el-divider content-position="left">自定义商品规格</el-divider>
        <el-form-item label="规格列表">
          <div style="width: 100%">
            <el-button size="small" @click="addSpec" style="margin-bottom: 10px">
              添加规格
            </el-button>
            <el-table :data="form.specs" border style="width: 100%">
              <el-table-column label="规格名称" width="250">
                <template #default="scope">
                  <el-input v-model="scope.row.specName" placeholder="如：尺寸" size="small" />
                </template>
              </el-table-column>
              <el-table-column label="规格值" width="250">
                <template #default="scope">
                  <el-input v-model="scope.row.specValue" placeholder="如：大杯" size="small" />
                </template>
              </el-table-column>
              <el-table-column label="排序" width="150">
                <template #default="scope">
                  <el-input-number
                    v-model="scope.row.sortOrder"
                    :min="0"
                    size="small"
                    style="width: 100%"
                  />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="100" fixed="right">
                <template #default="scope">
                  <el-button size="small" type="danger" @click="removeSpec(scope.$index)">
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-form-item>

        <!-- 商品SKU -->
        <el-divider content-position="left">商品SKU</el-divider>
        <el-form-item label="SKU列表" prop="skus">
          <div style="width: 100%">
            <el-button size="small" @click="addSku" style="margin-bottom: 10px">
              添加SKU
            </el-button>
            <el-table :data="form.skus" border style="width: 100%">
              <el-table-column label="规格单位" width="200">
                <template #default="scope">
                  <el-select
                    v-model="scope.row.specUnit"
                    placeholder="请选择"
                    size="small"
                    style="width: 100%"
                  >
                    <el-option label="件" value="PIECE" />
                    <el-option label="箱" value="BOX" />
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column label="价格" width="200">
                <template #default="scope">
                  <el-input-number
                    v-model="scope.row.price"
                    :precision="2"
                    :min="0"
                    size="small"
                    style="width: 100%"
                  />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="100" fixed="right">
                <template #default="scope">
                  <el-button size="small" type="danger" @click="removeSku(scope.$index)">
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
            创建模板
          </el-button>
          <el-button @click="handleBack">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import ImageUpload from '@/components/ImageUpload.vue'
import { createProductTemplate } from '@/api/product'

const router = useRouter()

const loading = ref(false)
const submitLoading = ref(false)
const formRef = ref(null)

const form = reactive({
  productCode: '',
  productName: '',
  coverUrl: '',
  description: '',
  status: 'ACTIVE',
  customFields: {},
  specs: [],
  skus: [],
})

const formRules = {
  productName: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  skus: [
    {
      validator: (rule, value, callback) => {
        if (!value || value.length === 0) {
          callback(new Error('至少需要添加一个SKU'))
        } else {
          callback()
        }
      },
      trigger: 'change',
    },
  ],
}

// 添加规格
const addSpec = () => {
  form.specs.push({
    specName: '',
    specValue: '',
    sortOrder: 0,
  })
}

// 删除规格
const removeSpec = (index) => {
  form.specs.splice(index, 1)
}

// 添加SKU
const addSku = () => {
  form.skus.push({
    specUnit: 'PIECE',
    price: 0,
  })
}

// 删除SKU
const removeSku = (index) => {
  form.skus.splice(index, 1)
}

// Handle submit
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        const submitData = {
          ...form,
          skus: form.skus.map((sku) => ({
            specUnit: sku.specUnit,
            price: Number(sku.price) || 0,
          })),
          specs: form.specs.map((spec) => ({
            specName: spec.specName,
            specValue: spec.specValue,
            sortOrder: Number(spec.sortOrder) || 0,
          })),
        }
        const res = await createProductTemplate(submitData)
        if (res.code === 200) {
          ElMessage.success('创建成功')
          router.push({ name: 'ProductTemplates' })
        }
      } catch (error) {
        console.error('Failed to create template:', error)
        ElMessage.error('创建失败')
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
.template-add-container {
}

.page-title {
  font-size: 18px;
  font-weight: 600;
}

:deep(.el-form) {
  max-width: 1000px;
  margin: 0 auto;
}

:deep(.el-divider__text) {
  font-weight: 600;
  color: #409eff;
}
</style>
