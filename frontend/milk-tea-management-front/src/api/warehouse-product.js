import request from '@/utils/request'

// 分页查询仓库商品列表
export function getWarehouseProductList(params) {
  return request({
    url: '/warehouse-products/list',
    method: 'get',
    params,
  })
}

// 根据ID查询仓库商品
export function getWarehouseProductById(id) {
  return request({
    url: `/warehouse-products/${id}`,
    method: 'get',
  })
}

// 添加仓库商品
export function createWarehouseProduct(data) {
  return request({
    url: '/warehouse-products',
    method: 'post',
    data,
  })
}

// 更新仓库商品
export function updateWarehouseProduct(data) {
  return request({
    url: '/warehouse-products/update',
    method: 'post',
    data,
  })
}

// 删除仓库商品
export function deleteWarehouseProduct(id) {
  return request({
    url: `/warehouse-products/delete/${id}`,
    method: 'post',
  })
}

// 更新仓库商品状态
export function updateWarehouseProductStatus(data) {
  return request({
    url: '/warehouse-products/status',
    method: 'post',
    data,
  })
}
