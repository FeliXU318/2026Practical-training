import request from './request'

export function getDeliveryList(params) {
  return request.get('/admin/deliveries', { params })
}

export function assignDelivery(id, data) {
  return request.put(`/admin/deliveries/${id}/assign`, data)
}

export function updateDeliveryStatus(id, data) {
  return request.put(`/admin/deliveries/${id}/status`, data)
}

export { request }
