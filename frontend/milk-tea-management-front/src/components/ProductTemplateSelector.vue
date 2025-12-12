<template>
  <el-dialog
    v-model="visible"
    title="选择商品模板"
    width="800px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <!-- 搜索表单 -->
    <el-form :inline="true" :model="searchForm" style="margin-bottom: 20px" @submit.prevent>
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

    <!-- 商品模板列表 -->
    <el-table
      :data="templateList"
      style="width: 100%"
      v-loading="loading"
      highlight-current-row
      @row-click="handleRowClick"
    >
      <el-table-column label="封面图片" width="100">
        <template #default="{ row }">
          <el-image
            v-if="row.coverUrl"
            :src="getImageUrl(row.coverUrl)"
            fit="cover"
            style="width: 60px; height: 60px; border-radius: 4px"
          />
          <span v-else>无图片</span>
        </template>
      </el-table-column>
      <el-table-column prop="productCode" label="商品编码" width="150" />
      <el-table-column prop="productName" label="商品名称" min-width="180" />
      <el-table-column prop="description" label="描述" min-width="200" />
      <el-table-column label="操作" width="100" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleSelect(row)"> 选择 </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-model:current-page="pagination.pageNum"
      v-model:page-size="pagination.pageSize"
      :page-sizes="[10, 20, 50]"
      :total="pagination.total"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      style="margin-top: 20px; justify-content: flex-end"
    />

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getAvailableProductTemplates } from '@/api/product'
import { getImageUrl } from '@/utils/image'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'select'])

const visible = ref(false)
const loading = ref(false)
const templateList = ref([])

const searchForm = reactive({
  keyword: '',
})

const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
})

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  (val) => {
    visible.value = val
    if (val) {
      loadTemplateList()
    }
  },
  { immediate: true },
)

// 监听 visible 变化，同步到父组件
watch(visible, (val) => {
  emit('update:modelValue', val)
})

// 加载商品模板列表
const loadTemplateList = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword || undefined,
    }
    const res = await getAvailableProductTemplates(params)
    if (res.code === 200) {
      templateList.value = res.data.records || []
      pagination.total = res.data.total || 0
    }
  } catch (error) {
    ElMessage.error('加载商品模板失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.pageNum = 1
  loadTemplateList()
}

// 重置
const handleReset = () => {
  searchForm.keyword = ''
  pagination.pageNum = 1
  loadTemplateList()
}

// 行点击
const handleRowClick = (row) => {
  // 可选：点击行也触发选择
}

// 选择商品模板
const handleSelect = (row) => {
  emit('select', row)
  handleClose()
}

// 关闭弹窗
const handleClose = () => {
  visible.value = false
}

// 分页处理
const handleSizeChange = () => {
  loadTemplateList()
}

const handleCurrentChange = () => {
  loadTemplateList()
}
</script>

<style scoped>
:deep(.el-table__row) {
  cursor: pointer;
}
</style>
