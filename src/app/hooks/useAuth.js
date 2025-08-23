'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import BaseService from '@/@services/baseService'
import AuthService from '@/views/authservice'

let globalAccessToken = null
let globalUser = null
let globalPermissions = null

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

  const [permissions, setPermissions] = useState(globalPermissions)
  const [accessToken, setAccessTokenState] = useState(globalAccessToken)
  const [user, setUserState] = useState(globalUser)
  const [loading, setLoading] = useState(true)

  let refreshTimeout = null

  const clearSession = () => {
    globalAccessToken = null
    globalUser = null
    globalPermissions = null
    setUserState(null)
    setPermissions(null)
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('accessToken')
      sessionStorage.removeItem('user')
      sessionStorage.removeItem('refreshToken')
      sessionStorage.removeItem('expiresAt')
    }
    if (refreshTimeout) clearTimeout(refreshTimeout)
  }

  const setAccessToken = token => {
    globalAccessToken = token
    setAccessTokenState(token)

    if (!token) return clearSession()

    const decoded = decodeJWT(token)
    if (!decoded) return clearSession()

    globalUser = decoded
    setUserState(decoded)

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('accessToken', token)
      sessionStorage.setItem('user', JSON.stringify(decoded))
    }

    fetchPermissions(token)
    scheduleRefresh()
  }

  const scheduleRefresh = () => {
    if (typeof window === 'undefined') return

    const expiresAt = sessionStorage.getItem('expiresAt')
    if (!expiresAt) return

    const timeLeft = new Date(expiresAt) - new Date()
    const refreshTime = Math.max(timeLeft - 15000, 0) 

    if (refreshTimeout) clearTimeout(refreshTimeout)
    refreshTimeout = setTimeout(async () => {
      const newToken = await baseService.refreshToken()
      if (newToken) setAccessToken(newToken)
      else logout() 
    }, refreshTime)
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

      const { accessToken, refreshToken, expiresAt } = data.data
      sessionStorage.setItem('accessToken', accessToken)
      sessionStorage.setItem('refreshToken', refreshToken)
      sessionStorage.setItem('expiresAt', expiresAt)

      setAccessToken(accessToken)
      return true
    } catch (err) {
      console.error('Login failed', err)
      return false
    }
  }

  const fetchPermissions = async tokenParam => {
    try {
      const tokenToUse = tokenParam || accessToken
      if (!tokenToUse) return

      const authService = new AuthService()
      const res = await authService.Get('Permissions')
      if (res.data?.success) {
        globalPermissions = res.data.data
        setPermissions(res.data.data)
      }
    } catch (err) {
      console.error('Failed to fetch permissions', err)
      globalPermissions = null
      setPermissions(null)
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
      fetchPermissions(storedToken)
      scheduleRefresh()
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
    return () => {
      if (refreshTimeout) clearTimeout(refreshTimeout)
    }
  }, [])

  return {
    
    user,
    accessToken,
    permissions,
    setAccessToken,
    login,
    logout,
    loading,
    fetchPermissions
  }
}
