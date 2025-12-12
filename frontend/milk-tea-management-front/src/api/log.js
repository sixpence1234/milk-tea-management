import request from '@/utils/request'

/**
 * 查询日志列表
 */
export function getLogList(params) {
  return request({
    url: '/operation-logs',
    method: 'get',
    params,
  })
}
