<template>
  <div class="images-upload">
    <el-upload
      :action="uploadAction"
      :http-request="handleUpload"
      :show-file-list="false"
      :before-upload="beforeUpload"
      :disabled="disabled || (maxCount > 0 && imageList.length >= maxCount)"
      accept="image/*"
      multiple
    >
      <div class="upload-list">
        <div v-for="(url, index) in displayImageList" :key="index" class="image-item">
          <el-image :src="url" fit="cover" class="uploaded-image" />
          <div class="image-actions">
            <el-icon @click.stop="handlePreview(index)"><ZoomIn /></el-icon>
            <el-icon @click.stop="handleRemove(index)"><Delete /></el-icon>
          </div>
        </div>
        <div v-if="maxCount === 0 || imageList.length < maxCount" class="upload-placeholder">
          <el-icon :size="30"><Plus /></el-icon>
          <div class="upload-text">上传图片</div>
          <div v-if="maxCount > 0" class="upload-count">{{ imageList.length }}/{{ maxCount }}</div>
        </div>
      </div>
    </el-upload>

    <el-dialog v-model="previewVisible" title="图片预览" width="800px">
      <el-image :src="previewUrl" fit="contain" style="width: 100%" />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, ZoomIn, Delete } from '@element-plus/icons-vue'
import { uploadImages } from '@/api/upload'
import { getImageUrl } from '@/utils/image'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  maxCount: {
    type: Number,
    default: 0, // 0 表示不限制
  },
  maxSize: {
    type: Number,
    default: 5, // MB
  },
})

const emit = defineEmits(['update:modelValue', 'success'])

const imageList = ref([...props.modelValue])
const previewVisible = ref(false)
const previewUrl = ref('')
const uploadAction = ref('#')

// 计算完整的图片 URL 列表用于显示
const displayImageList = computed(() => imageList.value.map((url) => getImageUrl(url)))

watch(
  () => props.modelValue,
  (val) => {
    imageList.value = [...val]
  },
  { deep: true },
)

const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLtMaxSize = file.size / 1024 / 1024 < props.maxSize

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLtMaxSize) {
    ElMessage.error(`图片大小不能超过 ${props.maxSize}MB!`)
    return false
  }
  if (props.maxCount > 0 && imageList.value.length >= props.maxCount) {
    ElMessage.error(`最多只能上传 ${props.maxCount} 张图片!`)
    return false
  }
  return true
}

const handleUpload = async (options) => {
  try {
    // 如果是单个文件，转换为数组
    const files = options.file ? [options.file] : []

    const res = await uploadImages(files)
    if (res.code === 200 || res.code === 0) {
      // 保存原始的相对路径
      const urls = Array.isArray(res.data)
        ? res.data.map((item) => item.url || item)
        : [res.data.url || res.data]

      imageList.value.push(...urls)
      emit('update:modelValue', imageList.value)
      emit('success', res.data)
      ElMessage.success('上传成功')
    } else {
      ElMessage.error(res.message || '上传失败')
    }
  } catch (error) {
    ElMessage.error('上传失败')
  }
}

const handlePreview = (index) => {
  previewUrl.value = displayImageList.value[index]
  previewVisible.value = true
}

const handleRemove = (index) => {
  imageList.value.splice(index, 1)
  emit('update:modelValue', imageList.value)
}
</script>

<style scoped>
.images-upload {
  display: inline-block;
}

.upload-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.image-item {
  position: relative;
  width: 148px;
  height: 148px;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
}

.uploaded-image {
  width: 100%;
  height: 100%;
}

.image-actions {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition: opacity 0.3s;
}

.image-item:hover .image-actions {
  opacity: 1;
}

.image-actions .el-icon {
  font-size: 20px;
  color: #fff;
  cursor: pointer;
  transition: transform 0.3s;
}

.image-actions .el-icon:hover {
  transform: scale(1.2);
}

.upload-placeholder {
  width: 148px;
  height: 148px;
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.upload-placeholder:hover {
  border-color: var(--el-color-primary);
}

.upload-text {
  margin-top: 8px;
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.upload-count {
  margin-top: 4px;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}
</style>
