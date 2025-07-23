'use client'
import { useState } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'

// Components Imports
import WeeklyOverview from '@views/dashboard/WeeklyOverview'
import TotalEarning from '@views/dashboard/TotalEarning'
import LineChart from '@views/dashboard/LineChart'
import DistributedColumnChart from '@views/dashboard/DistributedColumnChart'
import CardStatVertical from '@components/card-statistics/Vertical'
import TopNav from '@/views/dashboard/TopNav'
import AlarmAndOrgCharts from '@/views/dashboard/AlarmAndOrgCharts'

const DashboardAnalytics = () => {
  const [filterData, setFilterData] = useState({})
  const filteredChanges = data => {
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
