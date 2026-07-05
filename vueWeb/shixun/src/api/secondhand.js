import request from './request'

export function getSecondHandAuditList(params) {
  return request.get('/admin/secondhand/audit', { params })
}

export function getSecondHandDetail(id) {
  return request.get(`/admin/secondhand/${id}`)
}

export function approveSecondHand(id) {
  return request.post(`/admin/secondhand/${id}/approve`)
}

export function rejectSecondHand(id, data) {
  return request.post(`/admin/secondhand/${id}/reject`, data)
}

export { request }
