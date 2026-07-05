import request from './request'

export function getComplaintList(params) {
  return request.get('/admin/complaints', { params })
}

export function getComplaintDetail(id) {
  return request.get(`/admin/complaints/${id}`)
}

export function handleComplaint(id, data) {
  return request.put(`/admin/complaints/${id}/handle`, data)
}

export { request }
