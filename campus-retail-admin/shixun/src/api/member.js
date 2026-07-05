import request from './request'

export function getMemberList(params) {
  return request.get('/admin/members', { params })
}

export function getMemberDetail(id) {
  return request.get(`/admin/members/${id}`)
}

export function getMemberRecordList(params) {
  return request.get('/admin/member-records', { params })
}

export { request }
