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
        }
        fetchPermissions(token)
      } else {
        globalAccessToken = null
        globalUser = null
        globalPermissions = null
        setUserState(null)
        setPermissions(null)
      }
    } else {
      globalUser = null
      globalPermissions = null
      setUserState(null)
      setPermissions(null)
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('accessToken')
        sessionStorage.removeItem('user')
      }
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

  const refreshAccessToken = async () => {
    try {
      const newAccessToken = await baseService.refreshToken()
      setAccessToken(newAccessToken)
    } catch (err) {
      console.error('Refresh failed', err)
      clearAuth()
    }
  }

  const logout = () => {
    setAccessToken(null)
    setUserState(null)
    globalPermissions = null
    setPermissions(null)
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('refreshToken')
      sessionStorage.removeItem('accessToken')
      sessionStorage.removeItem('user')
      sessionStorage.removeItem('expiresAt')
    }
    router.push('/login')
  }

  const clearAuth = () => {
    logout()
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
    }

    setLoading(false)
  }, [])

  return {
    user,
    accessToken,
    permissions,
    setAccessToken,
    login,
    logout,
    clearAuth,
    refreshAccessToken,
    loading,
    fetchPermissions
  }
}
