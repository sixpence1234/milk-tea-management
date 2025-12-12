import request from '@/utils/request'

/**
 * 分页查询仓库列表
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码（必填）
 * @param {number} params.pageSize - 每页数量（必填）
 * @param {string} params.warehouseName - 仓库名称（可选）
 * @param {string} params.managerName - 负责人名称（可选）
 * @param {number} params.status - 状态（可选）
 */
export function getWarehouseList(params) {
  return request({
    url: '/warehouses/list',
    method: 'get',
    params,
  })
}

/**
 * 根据ID查询仓库
 * @param {number} id - 仓库ID
 */
export function getWarehouseById(id) {
  return request({
    url: `/warehouses/${id}`,
    method: 'get',
  })
}

/**
 * 创建仓库（必须绑定负责人）
 * @param {Object} data - 创建参数
 * @param {string} data.warehouseName - 仓库名称（必填）
 * @param {string} data.warehouseCode - 仓库编码（必填）
 * @param {string} data.address - 地址
 * @param {string} data.contactPerson - 联系人
 * @param {string} data.contactPhone - 联系电话
 * @param {string} data.email - 邮箱
 * @param {number} data.managerId - 负责人ID（必填）
 * @param {string} data.remark - 备注
 */
export function createWarehouse(data) {
  return request({
    url: '/warehouses',
    method: 'post',
    data,
  })
}

/**
 * 更新仓库（可替换负责人）
 * @param {Object} data - 更新参数
 * @param {number} data.id - 仓库ID（必填）
 * @param {string} data.warehouseName - 仓库名称
 * @param {string} data.warehouseCode - 仓库编码
 * @param {string} data.address - 地址
 * @param {string} data.contactPerson - 联系人
 * @param {string} data.contactPhone - 联系电话
 * @param {string} data.email - 邮箱
 * @param {number} data.managerId - 负责人ID
 * @param {string} data.remark - 备注
 */
export function updateWarehouse(data) {
  return request({
    url: '/warehouses/update',
    method: 'post',
    data,
  })
}

/**
 * 删除仓库（软删除）
 * @param {number} id - 仓库ID
 */
export function deleteWarehouse(id) {
  return request({
    url: `/warehouses/delete/${id}`,
    method: 'post',
  })
}

/**
 * 更新仓库状态
 * @param {Object} data - 更新参数
 * @param {number} data.id - 仓库ID（必填）
 * @param {number} data.status - 状态: 0-禁用, 1-启用（必填）
 */
export function updateWarehouseStatus(data) {
  return request({
    url: '/warehouses/status',
    method: 'post',
    data,
  })
}
