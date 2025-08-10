'use client'

import { useState } from 'react'


import Grid from '@mui/material/Grid'


import TopNav from '@/views/dashboard/TopNav'
import AlarmAndOrgCharts from '@/views/dashboard/AlarmAndOrgCharts'

const DashboardAnalytics = () => {
 
  const [filterData, setFilterData] = useState({
    entityCounts: [],
    sensorData: []
  })

  const filteredChanges = (data) => {
    console.log('Filtered changes received in DashboardAnalytics:', data)
    setFilterData(data)
  }

  return (
    <>
      <Grid item xs={12} md={12} lg={12}>
      
        <TopNav onFiltersChange={filteredChanges} />
      </Grid>

      <Grid item xs={12} md={12} lg={12}>
    
        <AlarmAndOrgCharts onFiltersChange={filterData} />
      </Grid>
    </>
  )
}

export default DashboardAnalytics
