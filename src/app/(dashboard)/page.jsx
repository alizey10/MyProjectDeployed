'use client'
import { useState } from 'react'

import Grid from '@mui/material/Grid'

import WeeklyOverview from '@views/dashboard/WeeklyOverview'
import TotalEarning from '@views/dashboard/TotalEarning'
import LineChart from '@views/dashboard/LineChart'
import DistributedColumnChart from '@views/dashboard/DistributedColumnChart'
import CardStatVertical from '@components/card-statistics/Vertical'
import TopNav from '@/views/dashboard/TopNav'
import AlarmAndOrgCharts from '@/views/dashboard/AlarmAndOrgCharts'

const DashboardAnalytics = () => {
  const [entityCount, setEnityCount] = useState([])
  const filteredChanges = data => {
    setEnityCount(data?.entityCounts)
  }
  return (
    <>
      <Grid item xs={12} md={12} lg={12}>
        <TopNav onFiltersChange={filteredChanges} />
      </Grid>
      <Grid item xs={12} md={12} lg={12}>
        <AlarmAndOrgCharts entityCounts={entityCount} />
      </Grid>
    </>
  )
}

export default DashboardAnalytics
