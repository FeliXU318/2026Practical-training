import request from './request'

export function getActivityList(params = {}) {
  return request.get('/admin/activities', { params })
}

export function createActivity(data) {
  return request.post('/admin/activities', data)
}

export function updateActivity(id, data) {
  return request.put(`/admin/activities/${id}`, data)
}

export function deleteActivity(id) {
  return request.delete(`/admin/activities/${id}`)
}

export function getNoticeList(params = {}) {
  return request.get('/admin/notices', { params })
}

export function createNotice(data) {
  return request.post('/admin/notices', data)
}

export function updateNotice(id, data) {
  return request.put(`/admin/notices/${id}`, data)
}

export function deleteNotice(id) {
  return request.delete(`/admin/notices/${id}`)
}

export { request }
