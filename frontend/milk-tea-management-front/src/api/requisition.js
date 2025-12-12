import request from '@/utils/request'

/**
 * 创建拿货单
 */
export function createRequisition(data) {
  return request({
    url: '/store/requisitions/create',
    method: 'post',
    data,
  })
}

/**
 * 查询拿货单列表
 */
export function getRequisitionList(params) {
  return request({
    url: '/store/requisitions/list',
    method: 'get',
    params,
  })
}

/**
 * 查询拿货单详情
 */
export function getRequisitionDetail(orderId) {
  return request({
    url: `/store/requisitions/${orderId}`,
    method: 'get',
  })
}

/**
 * 确认收货
 */
export function confirmReceipt(data) {
  return request({
    url: '/store/requisitions/confirm-receipt',
    method: 'post',
    data,
  })
}

/**
 * 拒绝收货
 */
export function rejectReceipt(data) {
  return request({
    url: '/store/requisitions/reject-receipt',
    method: 'post',
    data,
  })
}

/**
 * 申请售后
 */
export function applyAfterSale(data) {
  return request({
    url: '/store/requisitions/after-sale',
    method: 'post',
    data,
  })
}
