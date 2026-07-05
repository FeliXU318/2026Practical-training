import request from './request'

export function getPhoneCardConfig() {
  return request.get('/admin/phone-card')
}

export function updatePhoneCardConfig(data) {
  return request.put('/admin/phone-card', data)
}

export { request }
