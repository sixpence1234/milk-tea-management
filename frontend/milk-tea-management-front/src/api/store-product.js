import request from '@/utils/request'

/**
 * 分页查询门店商品列表
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码（必填）
 * @param {number} params.pageSize - 每页数量（必填）
 * @param {number} params.storeId - 门店ID（可选）
 * @param {string} params.keyword - 关键词（可选）
 */
export function getStoreProductList(params) {
  return request({
    url: '/store-products',
    method: 'get',
    params,
  })
}

/**
 * 根据ID查询门店商品详情
 * @param {number} id - 商品ID
 * @param {number} storeId - 门店ID（可选）
 */
export function getStoreProductById(id, storeId) {
  return request({
    url: `/store-products/${id}`,
    method: 'get',
    params: { storeId },
  })
}

/**
 * 添加门店商品
 * @param {Object} data - 创建参数
 * @param {number} data.storeId - 门店ID（必填）
 * @param {number} data.productTemplateId - 商品模板ID（必填）
 * @param {number} data.skuId - SKU ID（必填）
 * @param {number} data.stockQuantity - 初始库存（必填）
 * @param {number} data.safetyStock - 安全库存（可选）
 * @param {number} data.purchasePrice - 采购价格（可选）
 * @param {number} data.sellingPrice - 销售价格（可选）
 * @param {string} data.shelfLocation - 货架位置（可选）
 * @param {string} data.remark - 备注（可选）
 */
export function createStoreProduct(data) {
  return request({
    url: '/store-products',
    method: 'post',
    data,
  })
}

/**
 * 更新门店商品
 * @param {Object} data - 更新参数
 * @param {number} data.id - 商品ID（必填）
 * @param {number} data.storeId - 门店ID（可选）
 * @param {number} data.safetyStock - 安全库存（可选）
 * @param {number} data.purchasePrice - 采购价格（可选）
 * @param {number} data.sellingPrice - 销售价格（可选）
 * @param {string} data.shelfLocation - 货架位置（可选）
 * @param {string} data.remark - 备注（可选）
 */
export function updateStoreProduct(data) {
  return request({
    url: '/store-products/update',
    method: 'post',
    data,
  })
}

/**
 * 删除门店商品
 * @param {Object} data - 删除参数
 * @param {number} data.id - 商品ID（必填）
 * @param {number} data.storeId - 门店ID（可选）
 */
export function deleteStoreProduct(data) {
  return request({
    url: '/store-products/delete',
    method: 'post',
    data,
  })
}
