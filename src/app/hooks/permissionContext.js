
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import useAuth from '@/app/hooks/useAuth'
import AuthService from '@/views/authservice'

const PermissionsContext = createContext({
  permissions: {
    canView: false,
    canModify: false,
    canDelete: false,
    canViewReports: false
  },
  loading: true,
  refreshPermissions: () => {}
})

export const PermissionsProvider = ({ children }) => {
  const { accessToken, logout } = useAuth()
  const [permissions, setPermissions] = useState({
    canView: false,
    canModify: false,
    canDelete: false,
    canViewReports: false
  })
  const [loading, setLoading] = useState(true)

  const fetchPermissions = async () => {
    if (!accessToken) return

    setLoading(true)
    try {
      const authService = new AuthService()
      const response = await authService.GetPermissions()
      if (response?.success && response.data) {
        setPermissions({
          canView: response.data.canView || false,
          canModify: response.data.canModify || false,
          canDelete: response.data.canDelete || false,
          canViewReports: response.data.canViewReports || false
        })
      } else {
        setPermissions({
          canView: false,
          canModify: false,
          canDelete: false,
          canViewReports: false
        })
      }
    } catch (err) {
      console.error('Error fetching permissions:', err)
      setPermissions({
        canView: false,
        canModify: false,
        canDelete: false,
        canViewReports: false
      })
     
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPermissions()
  }, [accessToken])

  return (
    <PermissionsContext.Provider value={{ permissions, loading, refreshPermissions: fetchPermissions }}>
      {children}
    </PermissionsContext.Provider>
  )
}

export const usePermissions = () => useContext(PermissionsContext)
