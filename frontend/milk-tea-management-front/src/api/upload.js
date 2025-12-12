import request from '@/utils/request'

/**
 * 上传单个图片
 * @param {File} file - 图片文件
 * @returns {Promise} 返回 { code, message, data: { url, filePath, originalFilename, fileSize, fileSizeDesc, fileType, uploadTime } }
 */
export function uploadImage(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: '/upload/image',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

/**
 * 上传多个图片（批量上传）
 * @param {File[]} files - 图片文件数组
 * @returns {Promise} 返回 { code, message, data: [{ url, filePath, originalFilename, fileSize, fileSizeDesc, fileType, uploadTime }] }
 */
export function uploadImages(files) {
  const formData = new FormData()
  files.forEach((file) => {
    formData.append('files', file)
  })
  return request({
    url: '/upload/images',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}
