import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const service = axios.create({
  baseURL: '/api', // Use relative path to trigger Vite proxy
  timeout: 5000,
})

// Request interceptor
service.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers['Authorization'] = `Bearer ${userStore.token}`
    }
    return config
  },
  (error) => {
    console.log(error)
    return Promise.reject(error)
  },
)

// Response interceptor
service.interceptors.response.use(
  (response) => {
    const res = response.data
    // Adjust the condition based on your API's success code
    if (res.code !== 200 && res.code !== 0) {
      // Assuming 200 or 0 is success
      ElMessage({
        message: res.message || 'Error',
        type: 'error',
        duration: 5 * 1000,
      })

      // Handle token expiration or illegal token
      if (res.code === 401 || res.code === 403) {
        const userStore = useUserStore()
        userStore.logout().then(() => {
          location.reload()
        })
      }
      return Promise.reject(new Error(res.message || 'Error'))
    } else {
      return res
    }
  },
  (error) => {
    console.log('err' + error)
    ElMessage({
      message: error.message,
      type: 'error',
      duration: 5 * 1000,
    })
    return Promise.reject(error)
  },
)

export default service
