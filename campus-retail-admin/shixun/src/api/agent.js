import request from './request'

const agentRequestConfig = {
  timeout: 90000
}

export function runDashboardAgent(data) {
  return request.post('/admin/agent/dashboard', data, agentRequestConfig)
}

export function runComplaintAgent(data) {
  return request.post('/admin/agent/complaint', data, agentRequestConfig)
}

export function runAuditAgent(data) {
  return request.post('/admin/agent/audit', data, agentRequestConfig)
}
