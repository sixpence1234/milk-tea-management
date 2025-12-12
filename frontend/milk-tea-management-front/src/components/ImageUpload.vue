<template>
  <div class="image-upload">
    <el-upload
      :action="uploadAction"
      :http-request="handleUpload"
      :show-file-list="false"
      :before-upload="beforeUpload"
      :disabled="disabled"
      accept="image/*"
    >
      <div v-if="!imageUrl" class="upload-placeholder">
        <el-icon :size="50"><Plus /></el-icon>
        <div class="upload-text">{{ placeholder }}</div>
      </div>
      <div v-else class="image-preview">
        <el-image :src="displayImageUrl" fit="cover" class="uploaded-image" />
        <div class="image-actions">
          <el-icon @click.stop="handlePreview"><ZoomIn /></el-icon>
          <el-icon @click.stop="handleRemove"><Delete /></el-icon>
        </div>
      </div>
    </el-upload>

    <el-dialog v-model="previewVisible" title="图片预览" width="800px">
      <el-image :src="displayImageUrl" fit="contain" style="width: 100%" />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, ZoomIn, Delete } from '@element-plus/icons-vue'
import { uploadImage } from '@/api/upload'
import { getImageUrl } from '@/utils/image'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  placeholder: {
    type: String,
    default: '点击上传图片',
  },
  maxSize: {
    type: Number,
    default: 5, // MB
  },
})

const emit = defineEmits(['update:modelValue', 'success'])

const imageUrl = ref(props.modelValue)
const previewVisible = ref(false)
const uploadAction = ref('#')

// 计算完整的图片 URL 用于显示
const displayImageUrl = computed(() => getImageUrl(imageUrl.value))

watch(
  () => props.modelValue,
  (val) => {
    imageUrl.value = val
  },
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
  return true
}

const handleUpload = async (options) => {
  try {
    const res = await uploadImage(options.file)
    if (res.code === 200 || res.code === 0) {
      // 保存原始的相对路径
      const originalUrl = res.data.url || res.data
      imageUrl.value = originalUrl
      emit('update:modelValue', originalUrl)
      emit('success', res.data)
      ElMessage.success('上传成功')
    } else {
      ElMessage.error(res.message || '上传失败')
    }
  } catch (error) {
    ElMessage.error('上传失败')
  }
}

const handlePreview = () => {
  previewVisible.value = true
}

const handleRemove = () => {
  imageUrl.value = ''
  emit('update:modelValue', '')
}
</script>

<style scoped>
.image-upload {
  display: inline-block;
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

.image-preview {
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

.image-preview:hover .image-actions {
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
</style>
