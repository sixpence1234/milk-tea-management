import { defineStore } from 'pinia'
import { login, logout } from '@/api/auth'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    name: localStorage.getItem('name') || '',
    avatar: '',
    roles: localStorage.getItem('roles') ? JSON.parse(localStorage.getItem('roles')) : [], // userRole
    terminalType: localStorage.getItem('terminalType') || '', // terminalType
    userInfo: localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : {},
  }),
  actions: {
    // Login
    login(userInfo) {
      const { username, password, captcha, key } = userInfo
      return new Promise((resolve, reject) => {
        login({ username: username.trim(), password: password, captcha: captcha, key: key })
          .then((response) => {
            const { data } = response
            this.token = data.token
            localStorage.setItem('token', data.token)

            // Save user info
            const user = data.user
            this.name = user.name
            this.roles = [user.userRole]
            this.terminalType = user.terminalType
            this.userInfo = user

            localStorage.setItem('name', user.name)
            localStorage.setItem('roles', JSON.stringify(this.roles))
            localStorage.setItem('terminalType', user.terminalType)
            localStorage.setItem('userInfo', JSON.stringify(user))

            resolve()
          })
          .catch((error) => {
            reject(error)
          })
      })
    },

    // Logout
    logout() {
      return new Promise((resolve, reject) => {
        logout(this.token)
          .then(() => {
            this.token = ''
            this.roles = []
            this.name = ''
            this.terminalType = ''
            this.userInfo = {}
            localStorage.removeItem('token')
            localStorage.removeItem('name')
            localStorage.removeItem('roles')
            localStorage.removeItem('terminalType')
            localStorage.removeItem('userInfo')
            resolve()
          })
          .catch((error) => {
            reject(error)
          })
      })
    },

    // Remove token
    resetToken() {
      return new Promise((resolve) => {
        this.token = ''
        this.roles = []
        this.name = ''
        this.terminalType = ''
        this.userInfo = {}
        localStorage.removeItem('token')
        localStorage.removeItem('name')
        localStorage.removeItem('roles')
        localStorage.removeItem('terminalType')
        localStorage.removeItem('userInfo')
        resolve()
      })
    },
  },
})
