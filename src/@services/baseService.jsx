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

    this.client.interceptors.request.use(async config => {
      const token = sessionStorage.getItem('accessToken')
      const expiresAt = sessionStorage.getItem('expiresAt')

      if (token) {
        if (expiresAt) {
          const now = new Date()
          const expiryDate = new Date(expiresAt)
          const timeLeft = expiryDate - now

          if (timeLeft < 60000) {
            await this.refreshToken()
          }
        }
        config.headers['Authorization'] = `Bearer ${sessionStorage.getItem('accessToken')}`
      }
      return config
    })

    this.client.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config

        if (error.response?.status === HttpStatus.Unauthorized && !originalRequest._retry) {
          originalRequest._retry = true

          try {
            const refreshToken = sessionStorage.getItem('refreshToken')
            const accessToken = sessionStorage.getItem('accessToken')

            if (!refreshToken) throw new Error('No refresh token available')

            const res = await fetch(`${process.env.NEXT_PUBLIC_HEALTH_AND_SAFETY_API_ADDRESS}/Auth/Refresh`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${sessionStorage.getItem('accessToken')}`
              },
              body: JSON.stringify({ refreshToken })
            })

            const data = await res.json()

            if (!data?.success) throw new Error('Token refresh failed')

            const newAccessToken = res.data.data.accessToken
            const newRefreshToken = res.data.data.refreshToken || refreshToken

            sessionStorage.setItem('accessToken', newAccessToken)
            sessionStorage.setItem('refreshToken', newRefreshToken)

            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`
            return this.client(originalRequest)
          } catch (refreshError) {
            console.error('Refresh token expired. Please login again.', refreshError)

            sessionStorage.removeItem('accessToken')
            sessionStorage.removeItem('refreshToken')
            sessionStorage.removeItem('expiresAt')

            return Promise.reject(refreshError)
          }
        }

        return Promise.reject(error)
      }
    )
  }
  async refreshToken() {
    try {
      const refreshToken = sessionStorage.getItem('refreshToken')
      if (!refreshToken) throw new Error('No refresh token available')

      const headers = await this.assembleHeaders()

      const res = await this.client.post('/Auth/Refresh', { refreshToken }, { headers })

      if (!res?.data?.success) throw new Error('Token refresh failed')

      const { accessToken: newAccessToken, refreshToken: newRefreshToken, expiresAt } = res.data.data

      sessionStorage.setItem('accessToken', newAccessToken)
      sessionStorage.setItem('refreshToken', newRefreshToken || refreshToken)
      sessionStorage.setItem('expiresAt', expiresAt)

      return newAccessToken
    } catch (err) {
      console.error('Silent refresh failed', err)
      sessionStorage.removeItem('accessToken')
      sessionStorage.removeItem('refreshToken')
      sessionStorage.removeItem('expiresAt')
      throw err
    }
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
