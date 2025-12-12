import request from '@/utils/request'

// 分页查询商品模板库列表
export function getProductTemplateList(data) {
  return request({
    url: '/product-templates/list',
    method: 'post',
    data,
  })
}

// 分页查询可用商品模板列表（仅启用状态）
export function getAvailableProductTemplates(data) {
  return request({
    url: '/product-templates/available',
    method: 'post',
    data,
  })
}

/**
 * 创建商品模板
 * @param {Object} data - 创建参数
 * @param {string} data.productName - 商品名称（必填）
 * @param {string} data.coverUrl - 商品封面URL
 * @param {number} data.categoryId - 商品分类ID
 * @param {string} data.description - 商品描述
 * @param {Object} data.customFields - 自定义字段
 * @param {Array} data.specs - 商品规格列表
 * @param {Array} data.skus - 商品SKU列表（必填）
 */
export function createProductTemplate(data) {
  return request({
    url: '/product-templates',
    method: 'post',
    data,
  })
}

/**
 * 更新商品模板
 * @param {Object} data - 更新参数
 * @param {number} data.id - 商品ID（必填）
 * @param {string} data.productName - 商品名称
 * @param {string} data.coverUrl - 商品封面URL
 * @param {number} data.categoryId - 商品分类ID
 * @param {string} data.description - 商品描述
 * @param {number} data.status - 商品状态: 0-禁用, 1-启用
 * @param {Object} data.customFields - 自定义字段
 * @param {Array} data.specs - 商品规格列表
 * @param {Array} data.skus - 商品SKU列表
 */
export function updateProductTemplate(data) {
  return request({
    url: '/product-templates/update',
    method: 'post',
    data,
  })
}

// 删除商品模板
export function deleteProductTemplate(data) {
  return request({
    url: '/product-templates/delete',
    method: 'post',
    data,
  })
}

// 批量删除商品模板
export function batchDeleteProductTemplate(data) {
  return request({
    url: '/product-templates/batch-delete',
    method: 'post',
    data,
  })
}

// 获取商品模板详情
export function getProductTemplateDetail(data) {
  return request({
    url: '/product-templates/detail',
    method: 'post',
    data,
  })
}

// 批量更新商品模板状态
export function batchUpdateProductTemplateStatus(data) {
  return request({
    url: '/product-templates/batch-update-status',
    method: 'post',
    data,
  })
}
