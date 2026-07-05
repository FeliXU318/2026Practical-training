import request from './request'

export function getAuditProducts(params) {
  return request.get('/admin/products/audit', { params })
}

export function getProductDetail(id) {
  return request.get(`/admin/products/${id}`)
}

export function approveProduct(id) {
  return request.post(`/admin/products/${id}/approve`)
}

export function rejectProduct(id, data) {
  return request.post(`/admin/products/${id}/reject`, data)
}

export { request }
