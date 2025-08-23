'use client'

import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react'
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
  const { accessToken } = useAuth()
  const [permissions, setPermissions] = useState({
    canView: false,
    canModify: false,
    canDelete: false,
    canViewReports: false
  })
  const [loading, setLoading] = useState(true)

  const authService = useMemo(() => new AuthService(), [])

  const fetchPermissions = useCallback(async () => {
    if (!accessToken) {
      setPermissions({
        canView: false,
        canModify: false,
        canDelete: false,
        canViewReports: false
      })
      setLoading(false)
      return
    }

    setLoading(true)
    try {
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
  }, [accessToken, authService])

  useEffect(() => {
    fetchPermissions()
  }, [fetchPermissions])

  return (
    <PermissionsContext.Provider value={{ permissions, loading, refreshPermissions: fetchPermissions }}>
      {children}
    </PermissionsContext.Provider>
  )
}

export const usePermissions = () => useContext(PermissionsContext)
