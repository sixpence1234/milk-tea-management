import request from '@/utils/request'

/**
 * 创建调货单（发起方）
 */
export function createTransferOrder(data) {
  return request({
    url: '/warehouse/transfer/create',
    method: 'post',
    data,
  })
}

/**
 * 确认调货单（目标仓库修改数量并确认）
 */
export function confirmTransferOrder(data) {
  return request({
    url: '/warehouse/transfer/confirm',
    method: 'post',
    data,
  })
}

/**
 * 拒绝调货单（目标仓库拒绝）
 */
export function rejectTransferOrder(data) {
  return request({
    url: '/warehouse/transfer/reject',
    method: 'post',
    data,
  })
}

/**
 * 发货（目标仓库确认后发货）
 */
export function shipTransferOrder(data) {
  return request({
    url: '/warehouse/transfer/ship',
    method: 'post',
    data,
  })
}

/**
 * 确认收货（发起方确认收货）
 */
export function receiveTransferOrder(params) {
  return request({
    url: '/warehouse/transfer/receive',
    method: 'post',
    params,
  })
}

/**
 * 查询收到的调货单列表（别人向我申请调货的）
 */
export function getReceivedTransferList(params) {
  return request({
    url: '/warehouse/transfer/received-list',
    method: 'get',
    params,
  })
}

/**
 * 查询发起的调货单列表（我向别人申请调货的）
 */
export function getSentTransferList(params) {
  return request({
    url: '/warehouse/transfer/sent-list',
    method: 'get',
    params,
  })
}

/**
 * 查询调货单详情
 */
export function getTransferOrderDetail(id) {
  return request({
    url: `/warehouse/transfer/${id}`,
    method: 'get',
  })
}

/**
 * 申请售后（发起方）
 */
export function applyAfterSale(data) {
  return request({
    url: '/warehouse/transfer/after-sale/apply',
    method: 'post',
    data,
  })
}

/**
 * 处理售后（发货方修改价格和数量）
 */
export function handleAfterSale(data) {
  return request({
    url: '/warehouse/transfer/after-sale/handle',
    method: 'post',
    data,
  })
}

/**
 * 售后后重新发货（发货方）
 */
export function reshipAfterSale(data) {
  return request({
    url: '/warehouse/transfer/after-sale/reship',
    method: 'post',
    data,
  })
}
