import request from '@/utils/request'

export function getUsers(params) {
  return request({
    url: '/users',
    method: 'get',
    params,
  })
}

export function createUser(data) {
  return request({
    url: '/users',
    method: 'post',
    data,
  })
}

export function updateUser(data) {
  return request({
    url: '/users/update',
    method: 'post',
    data,
  })
}

export function deleteUser(userId) {
  return request({
    url: `/users/${userId}`,
    method: 'delete',
  })
}

export function getUserDetail(userId) {
  return request({
    url: `/users/${userId}`,
    method: 'get',
  })
}

export function resetPassword(userId) {
  return request({
    url: `/users/${userId}/reset-password`,
    method: 'post',
  })
}

export function updateUserStatus(userId, status) {
  return request({
    url: `/users/${userId}/status`,
    method: 'post',
    params: { status },
  })
}

// 获取当前用户信息
export function getCurrentUserInfo() {
  return request({
    url: '/users/me',
    method: 'get',
  })
}

// 修改当前用户信息
export function updateCurrentUserInfo(data) {
  return request({
    url: '/users/me/update',
    method: 'post',
    data,
  })
}

// 修改密码
export function changePassword(data) {
  return request({
    url: '/users/me/change-password',
    method: 'post',
    data,
  })
}

// 获取负责人下拉框选项
export function getManagerOptions() {
  return request({
    url: '/users/managers/options',
    method: 'get',
  })
}
