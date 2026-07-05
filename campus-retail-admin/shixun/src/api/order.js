import request from './request'

export function getOrderList(params) {
  return request.get('/admin/orders', { params })
}

export function getOrderDetail(id) {
  return request.get(`/admin/orders/${id}`)
}

export function updateOrderStatus(id, data) {
  return request.put(`/admin/orders/${id}/status`, data)
}

export { request }
