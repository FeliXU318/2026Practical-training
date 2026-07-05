import request from './request'

export function getDashboardSummary() {
  return request.get('/admin/dashboard/summary')
}

export function getOrderTrend() {
  return request.get('/admin/dashboard/order-trend')
}

export function getUserPortrait() {
  return request.get('/admin/dashboard/user-portrait')
}

export function getTodoList() {
  return request.get('/admin/dashboard/todos')
}

export { request }
