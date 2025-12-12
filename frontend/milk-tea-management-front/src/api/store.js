import request from '@/utils/request'

/**
 * 分页查询门店列表
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码（必填）
 * @param {number} params.pageSize - 每页数量（必填）
 * @param {string} params.storeName - 门店名称（可选）
 * @param {number} params.status - 状态（可选）
 */
export function getStoreList(params) {
  return request({
    url: '/stores/list',
    method: 'get',
    params,
  })
}

/**
 * 根据ID查询门店
 * @param {number} id - 门店ID
 */
export function getStoreById(id) {
  return request({
    url: `/stores/${id}`,
    method: 'get',
  })
}

/**
 * 创建门店
 * @param {Object} data - 创建参数
 */
export function createStore(data) {
  return request({
    url: '/stores',
    method: 'post',
    data,
  })
}

/**
 * 更新门店
 * @param {Object} data - 更新参数
 */
export function updateStore(data) {
  return request({
    url: '/stores/update',
    method: 'post',
    data,
  })
}

/**
 * 删除门店（软删除）
 * @param {number} id - 门店ID
 */
export function deleteStore(id) {
  return request({
    url: `/stores/delete/${id}`,
    method: 'post',
  })
}

/**
 * 更新门店状态
 * @param {Object} data - 更新参数
 * @param {number} data.id - 门店ID（必填）
 * @param {number} data.status - 状态: 0-禁用, 1-启用（必填）
 */
export function updateStoreStatus(data) {
  return request({
    url: '/stores/status',
    method: 'post',
    data,
  })
}
