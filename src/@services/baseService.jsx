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


    this.client.interceptors.request.use(config => {
      const token = sessionStorage.getItem('accessToken')
      if (token) config.headers['Authorization'] = `Bearer ${token}`
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

            const { accessToken: newAccessToken, refreshToken: newRefreshToken, expiresAt } = data.data

            sessionStorage.setItem('accessToken', newAccessToken)
            sessionStorage.setItem('refreshToken', newRefreshToken || refreshToken)
            sessionStorage.setItem('expiresAt', expiresAt)

            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`
            return this.client(originalRequest)
          } catch (refreshError) {
            sessionStorage.clear()
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
      if (!refreshToken) return null
 
      const headers = await this.assembleHeaders()
      const res = await this.client.post('/Auth/Refresh', { refreshToken }, { headers })

      if (!res?.data?.success){ 
      
        return null
        

          }    const { accessToken: newAccessToken, refreshToken: newRefreshToken, expiresAt } = res.data.data
        

      sessionStorage.setItem('accessToken', newAccessToken)
      sessionStorage.setItem('refreshToken', newRefreshToken || refreshToken)
      sessionStorage.setItem('expiresAt', expiresAt)



      return newAccessToken
    } catch {
         
      return null
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
    return await this.client.get(this.assembleEndpoint(action, params), { headers })
  }

  async Post(action, body) {
    const headers = await this.assembleHeaders()
    return await this.client.post(this.assembleEndpoint(action), body, { headers })
  }

  async Put(action, body) {
    const headers = await this.assembleHeaders()
    return await this.client.put(this.assembleEndpoint(action), body, { headers })
  }

  async Patch(action, body) {
    const headers = await this.assembleHeaders()
    return await this.client.patch(this.assembleEndpoint(action), body, { headers })
  }

  async Delete(action) {
    const headers = await this.assembleHeaders()
    return await this.client.delete(this.assembleEndpoint(action), { headers })
  }
}
