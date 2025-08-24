'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import BaseService from '@/@services/baseService'

let globalAccessToken = null
let globalUser = null
let isRefreshing = false
let refreshQueue = []

const decodeJWT = token => {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(atob(payload))
  } catch (err) {
    console.error('Invalid token', err)
    return null
  }
}

export default function useAuth() {
  const router = useRouter()
  const baseService = new BaseService()

  const [accessToken, setAccessTokenState] = useState(globalAccessToken)
  const [user, setUserState] = useState(globalUser)
  const [loading, setLoading] = useState(true)

  const setAccessToken = token => {
    globalAccessToken = token
    setAccessTokenState(token)

    if (token) {
      const decoded = decodeJWT(token)
      if (decoded) {
        globalUser = decoded
        setUserState(decoded)

        if (typeof window !== 'undefined') {
          sessionStorage.setItem('accessToken', token)
          sessionStorage.setItem('user', JSON.stringify(decoded))
          
          const expiresAt = decoded.exp
            ? new Date(decoded.exp * 1000).toISOString()
            : null
          if (expiresAt) sessionStorage.setItem('expiresAt', expiresAt)
        }
      } else {
        clearSession()
      }
    } else {
      clearSession()
    }
  }

  const clearSession = () => {
    globalAccessToken = null
    globalUser = null
    setUserState(null)
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('accessToken')
      sessionStorage.removeItem('user')
      sessionStorage.removeItem('refreshToken')
      sessionStorage.removeItem('expiresAt')
    }
  }

  const login = async (email, password) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_HEALTH_AND_SAFETY_API_ADDRESS}/Auth/Login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()
      if (!res.ok || !data?.data?.accessToken) throw new Error(data?.message || 'Login failed')

      const { accessToken, refreshToken } = data.data
      sessionStorage.setItem('accessToken', accessToken)
      sessionStorage.setItem('refreshToken', refreshToken)

      const decoded = decodeJWT(accessToken)
      const expiresAt = decoded?.exp ? new Date(decoded.exp * 1000).toISOString() : null
      if (expiresAt) sessionStorage.setItem('expiresAt', expiresAt)

      setAccessToken(accessToken)
      return true
    } catch (err) {
      console.error('Login failed', err)
      return false
    }
  }

  const refreshAccessToken = async () => {
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject })
      })
    }

    isRefreshing = true
    try {
      const newAccessToken = await baseService.refreshToken()
      if (newAccessToken) {
        setAccessToken(newAccessToken)
        refreshQueue.forEach(p => p.resolve(newAccessToken))
        refreshQueue = []
        return newAccessToken
      } else {
        clearSession()
        refreshQueue.forEach(p => p.reject(null))
        refreshQueue = []
        return null
      }
    } catch (err) {
      clearSession()
      refreshQueue.forEach(p => p.reject(err))
      refreshQueue = []
      return null
    } finally {
      isRefreshing = false
    }
  }

  const logout = () => {
    clearSession()
    router.push('/login')
  }

  useEffect(() => {
    if (typeof window === 'undefined') return

    const storedToken = sessionStorage.getItem('accessToken')
    const storedUser = sessionStorage.getItem('user')

    if (storedToken && storedUser) {
      globalAccessToken = storedToken
      globalUser = JSON.parse(storedUser)
      setAccessTokenState(storedToken)
      setUserState(globalUser)
    }

    const interval = setInterval(async () => {
      const expiresAt = sessionStorage.getItem('expiresAt')
      if (!expiresAt) return

      const timeLeft = new Date(expiresAt) - new Date()
      if (timeLeft < 15000) {
        await refreshAccessToken()
      }
    }, 10000)

    setLoading(false)
    return () => clearInterval(interval)
  }, [])

  return {
    user,
    accessToken,
    setAccessToken,
    login,
    logout,
    refreshAccessToken,
    loading,
    role: user?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || null
  }
}
