'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

let globalAccessToken = null
let globalUser = null

const decodeJWT = (token) => {
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
  const [accessToken, setAccessTokenState] = useState(globalAccessToken)
  const [user, setUserState] = useState(globalUser)
  const [loading, setLoading] = useState(true)
const REFRESH_URL = process.env.NEXT_PUBLIC_REFRESH_URL

  const setAccessToken = (token) => {
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
      } else {
        globalAccessToken = null
        globalUser = null
        setUserState(null)
      }
    } else {
      globalUser = null
      setUserState(null)
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('accessToken')
        sessionStorage.removeItem('user')
      }
    }
  }


  const refreshAccessToken = async () => {
    try {
      if (typeof window === 'undefined') return
      const refreshToken = sessionStorage.getItem('refreshToken')
      if (!refreshToken) throw new Error('No refresh token available')

    const res = await fetch(REFRESH_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ refreshToken }),
})

      if (!res.ok) throw new Error('Refresh token failed')

      const data = await res.json()
      if (data?.data?.accessToken) {
        setAccessToken(data.data.accessToken)
      } else {
        throw new Error('No access token returned')
      }
    } catch (err) {
      console.error(err)
      logout()
    }
  }

  useEffect(() => {
    if (!accessToken && typeof window !== 'undefined') {
 
      const storedToken = sessionStorage.getItem('accessToken')
      const storedUser = sessionStorage.getItem('user')
      if (storedToken && storedUser) {
        globalAccessToken = storedToken
        globalUser = JSON.parse(storedUser)
        setAccessTokenState(storedToken)
        setUserState(globalUser)
      }
    }
    setLoading(false)
  }, [])

  const login = (token, refreshToken, userData) => {
    setAccessToken(token)
    const finalUser = { ...decodeJWT(token), ...userData }
    globalUser = finalUser
    setUserState(finalUser)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('user', JSON.stringify(finalUser))
      sessionStorage.setItem('refreshToken', refreshToken)
    }
  }

  const logout = () => {
    setAccessToken(null)
    setUserState(null)
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('refreshToken')
    }
    router.push('/login')
  }

  const hasPermission = (perm) => user?.permissions?.includes(perm)
  const isAdmin = () => user?.role === 'Admin'
const clearAuth = () => {
  setAccessToken(null)
  setUserState(null)
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('refreshToken')
  }
  router.push('/login') 
}

  return {
    user,
    accessToken,
    setAccessToken,
    login,
    logout,
     clearAuth,
    refreshAccessToken,
    loading,
    hasPermission,
    isAdmin,
  }
}
