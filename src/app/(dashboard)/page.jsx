'use client'

import { useState, useEffect } from 'react'
import useAuth from '../hooks/useAuth'
import Grid from '@mui/material/Grid'
import TopNav from '../../views/dashboard/TopNav'
import { usePermissions } from '../hooks/permissionContext'
import AlarmAndOrgCharts from '../../views/dashboard/AlarmAndOrgCharts'
import { useRouter } from 'next/navigation'

const DashboardAnalytics = () => {
  const router = useRouter()
  const [entityCount, setEnityCount] = useState([])
  const  {user} = useAuth()   
    const { permissions } = usePermissions() 

  const filteredChanges = data => {
    setEnityCount(data?.entityCounts)
  }


  useEffect(() => {
    if (!user) {
      router.replace('/login')
    }
  }, [user, router])


  if (!user) return null

  return (
    <>
      <Grid item xs={12} md={12} lg={12}>
        <TopNav onFiltersChange={filteredChanges} />
      </Grid>
      <Grid item xs={12} md={12} lg={12}>
        <AlarmAndOrgCharts entityCounts={entityCount}  permissions={permissions}/>
      </Grid>
    </>
  )
}

export default DashboardAnalytics
