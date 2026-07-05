import request from './request'

export function login(data) {
  return request.post('/admin/login', data)
}

export function changePassword(data) {
  return request.post('/admin/change-password', data)
}

export function resetPassword(data) {
  return request.post('/admin/reset-password', data)
}

export function logout() {
  return request.post('/admin/logout')
}

export function getAdminInfo() {
  return request.get('/admin/profile')
}

export { request }
