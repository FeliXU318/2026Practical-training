import { defineStore } from 'pinia'

const tokenKey = 'token'
const adminKey = 'adminInfo'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem(tokenKey) || '',
    adminInfo: JSON.parse(localStorage.getItem(adminKey) || 'null')
  }),
  actions: {
    setLogin(token, adminInfo) {
      this.token = token
      this.adminInfo = adminInfo
      localStorage.setItem(tokenKey, token)
      localStorage.setItem(adminKey, JSON.stringify(adminInfo))
    },
    logout() {
      this.token = ''
      this.adminInfo = null
      localStorage.removeItem(tokenKey)
      localStorage.removeItem(adminKey)
    }
  }
})
