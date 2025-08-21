import axios from 'axios'
import { HttpStatus } from '@/utils/getStatusCode'

export default class BaseService {
  constructor(controllerName = 'Account') {
    this.controllerName = controllerName
    this.baseHeaders = { 'Content-Type': 'application/json' }

    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_HEALTH_AND_SAFETY_API_ADDRESS,
      timeout: 60000
    })


    this.client.interceptors.request.use(
      config => {

        const token = typeof window !== 'undefined' ? sessionStorage.getItem('accessToken') : null
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`
        }
        return config
      },
      error => Promise.reject(error)
    )

   
    this.client.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config
        const refreshToken = typeof window !== 'undefined' ? sessionStorage.getItem('refreshToken') : null

        if (error.response?.status === HttpStatus.Unauthorized && refreshToken && !originalRequest._retry) {
          originalRequest._retry = true
          try {
            const res = await axios.post(
              `${process.env.NEXT_PUBLIC_HEALTH_AND_SAFETY_API_ADDRESS}/Auth/Refresh`,
              { refreshToken }
            )

            if (!res?.data?.success) throw new Error('Token refresh failed')

            const newAccessToken = res.data.data.accessToken
            const newRefreshToken = res.data.data.refreshToken || refreshToken

            sessionStorage.setItem('accessToken', newAccessToken)
            sessionStorage.setItem('refreshToken', newRefreshToken)

            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`
            return this.client(originalRequest)
          } catch (refreshError) {
            console.error('Refresh token expired. Please login again.', refreshError)
            return Promise.reject(refreshError)
          }
        }

        return Promise.reject(error)
      }
    )
  }


  async assembleHeaders() {
    const headers = { ...this.baseHeaders }
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('accessToken') : null
    if (token) headers['Authorization'] = `Bearer ${token}`
    return headers
  }

  assembleEndpoint(action, data) {
    const apiAddress = process.env.NEXT_PUBLIC_HEALTH_AND_SAFETY_API_ADDRESS
    let endpoint = action ? `${apiAddress}/${this.controllerName}/${action}` : `${apiAddress}/${this.controllerName}`
    if (data) endpoint = `${endpoint}?${new URLSearchParams(data).toString()}`
    return endpoint
  }

  async Get(action, params) {
    const headers = await this.assembleHeaders()
    return this.client.get(this.assembleEndpoint(action, params), { headers })
  }

  async Post(action, body) {
    const headers = await this.assembleHeaders()
    return this.client.post(this.assembleEndpoint(action), body, { headers })
  }

  async Put(action, body) {
    const headers = await this.assembleHeaders()
    return this.client.put(this.assembleEndpoint(action), body, { headers })
  }

  async Patch(action, body) {
    const headers = await this.assembleHeaders()
    return this.client.patch(this.assembleEndpoint(action), body, { headers })
  }

  async Delete(action) {
    const headers = await this.assembleHeaders()
    return this.client.delete(this.assembleEndpoint(action), { headers })
  }
}
