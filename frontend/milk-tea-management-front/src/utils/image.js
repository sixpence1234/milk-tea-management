/**
 * 获取完整的图片 URL
 * @param {string} url - 相对路径或完整 URL
 * @returns {string} 完整的图片 URL
 */
export function getImageUrl(url) {
  if (!url) return ''

  // 如果已经是完整的 URL（http:// 或 https://），直接返回
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }

  // 如果是相对路径，拼接静态资源基础地址
  const baseUrl = import.meta.env.VITE_STATIC_BASE_URL || ''
  return `${baseUrl}${url.startsWith('/') ? url : '/' + url}`
}

/**
 * 获取多个图片的完整 URL
 * @param {string[]} urls - 图片路径数组
 * @returns {string[]} 完整的图片 URL 数组
 */
export function getImageUrls(urls) {
  if (!Array.isArray(urls)) return []
  return urls.map((url) => getImageUrl(url))
}
