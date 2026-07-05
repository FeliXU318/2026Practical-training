import axios from 'axios'
import { ElMessage } from 'element-plus'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
})

request.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

request.interceptors.response.use(
  (response) => {
    const result = response.data
    if (result && result.success === false) {
      ElMessage.error(result.message || '请求失败')
      return Promise.reject(result)
    }
    return result
  },
  (error) => {
    const status = error.response?.status
    if (status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('adminInfo')
      ElMessage.error('登录已失效，请重新登录')
      window.location.href = '/login'
    } else {
      ElMessage.error(error.response?.data?.message || '网络请求异常')
    }
    return Promise.reject(error)
  }
)

export default request
