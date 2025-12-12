<template>
  <div class="images-upload-inline">
    <el-upload
      :action="''"
      :auto-upload="false"
      :on-change="handleChange"
      :on-remove="handleRemove"
      :file-list="fileList"
      list-type="picture-card"
      :limit="limit"
      accept="image/*"
      :disabled="disabled"
      :class="{ 'hide-upload-btn': uploadedUrls.length >= limit }"
    >
      <el-icon><Plus /></el-icon>
    </el-upload>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { uploadImage } from '@/api/upload'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  limit: {
    type: Number,
    default: 3,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const fileList = ref([])
const uploadedUrls = ref([])

// 监听外部传入的值变化
watch(
  () => props.modelValue,
  (newVal) => {
    uploadedUrls.value = newVal || []
  },
  { immediate: true },
)

// 处理文件选择
const handleChange = async (file) => {
  if (!file.raw) return

  // 检查数量限制
  if (uploadedUrls.value.length >= props.limit) {
    ElMessage.warning(`最多上传${props.limit}张照片`)
    // 移除超出的文件
    const index = fileList.value.findIndex((f) => f.uid === file.uid)
    if (index > -1) {
      fileList.value.splice(index, 1)
    }
    return
  }

  try {
    const res = await uploadImage(file.raw)
    if (res.code === 200 || res.code === 0) {
      uploadedUrls.value.push(res.data.url)
      emit('update:modelValue', uploadedUrls.value)
      ElMessage.success('照片上传成功')
    } else {
      ElMessage.error(res.message || '照片上传失败')
      // 从文件列表中移除上传失败的文件
      const index = fileList.value.findIndex((f) => f.uid === file.uid)
      if (index > -1) {
        fileList.value.splice(index, 1)
      }
    }
  } catch (error) {
    console.error('照片上传失败:', error)
    ElMessage.error('照片上传失败')
    // 从文件列表中移除上传失败的文件
    const index = fileList.value.findIndex((f) => f.uid === file.uid)
    if (index > -1) {
      fileList.value.splice(index, 1)
    }
  }
}

// 处理文件移除
const handleRemove = (file) => {
  const index = fileList.value.findIndex((f) => f.uid === file.uid)
  if (index > -1 && index < uploadedUrls.value.length) {
    uploadedUrls.value.splice(index, 1)
    emit('update:modelValue', uploadedUrls.value)
  }
}
</script>

<style scoped>
.images-upload-inline :deep(.el-upload-list--picture-card) {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
}

.images-upload-inline :deep(.el-upload--picture-card) {
  width: 80px;
  height: 80px;
}

.images-upload-inline :deep(.el-upload-list__item) {
  width: 80px;
  height: 80px;
  margin-right: 8px;
  margin-bottom: 0;
}

/* 隐藏上传按钮 */
.images-upload-inline.hide-upload-btn :deep(.el-upload--picture-card) {
  display: none;
}
</style>
