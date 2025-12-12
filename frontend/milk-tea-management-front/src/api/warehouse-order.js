import request from '@/utils/request'

/**
 * 查询订单列表
 */
export function getWarehouseOrderList(params) {
  return request({
    url: '/warehouse/orders/list',
    method: 'get',
    params,
  })
}

/**
 * 查询订单详情
 */
export function getWarehouseOrderDetail(orderId) {
  return request({
    url: `/warehouse/orders/${orderId}`,
    method: 'get',
  })
}

/**
 * 查询待处理订单数量
 */
export function getPendingOrderCount() {
  return request({
    url: '/warehouse/orders/pending-count',
    method: 'get',
  })
}

/**
 * 确认处理订单
 */
export function confirmOrder(data) {
  return request({
    url: '/warehouse/orders/confirm',
    method: 'post',
    data,
  })
}

/**
 * 拒绝订单
 */
export function rejectOrder(data) {
  return request({
    url: '/warehouse/orders/reject',
    method: 'post',
    data,
  })
}

/**
 * 确认清点完成
 */
export function confirmInventoryCheck(data) {
  return request({
    url: '/warehouse/orders/confirm-inventory-check',
    method: 'post',
    data,
  })
}

/**
 * 发货
 */
export function deliverOrder(data) {
  return request({
    url: '/warehouse/orders/deliver',
    method: 'post',
    data,
  })
}

/**
 * 修改订单明细
 */
export function updateOrderItems(data) {
  return request({
    url: '/warehouse/orders/update-items',
    method: 'post',
    data,
  })
}

/**
 * 上传商品照片
 */
export function uploadOrderPhoto(data) {
  return request({
    url: '/warehouse/orders/upload-photo',
    method: 'post',
    data,
  })
}

/**
 * 确认送达
 */
export function confirmDelivery(data) {
  return request({
    url: '/warehouse/orders/confirm-delivery',
    method: 'post',
    data,
  })
}

/**
 * 审批门店拒绝收货申请（同意）
 */
export function approveRejectReceipt(data) {
  return request({
    url: '/warehouse/orders/approve-reject-receipt',
    method: 'post',
    data,
  })
}

/**
 * 拒绝门店的拒绝收货申请
 */
export function rejectRejectReceipt(data) {
  return request({
    url: '/warehouse/orders/reject-reject-receipt',
    method: 'post',
    data,
  })
}

/**
 * 处理售后申请
 */
export function handleAfterSale(data) {
  return request({
    url: '/warehouse/orders/handle-after-sale',
    method: 'post',
    data,
  })
}

/**
 * 更新配送方式
 */
export function updateDeliveryType(data) {
  return request({
    url: '/warehouse/orders/update-delivery-type',
    method: 'post',
    data,
  })
}
