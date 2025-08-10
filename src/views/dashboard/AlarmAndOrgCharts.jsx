'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import AppReactApexCharts from '@/libs/styles/AppReactApexCharts'

import { Box, Grid, Typography, Paper } from '@mui/material'
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ReferenceArea
} from 'recharts'

const EntityType = {
  0: 'Organizations',
  1: 'Branches',
  2: 'Gateways',
  3: 'Sensors'
}

const AlarmAndOrgCharts = ({ onFiltersChange }) => {
  const { entityCounts, sensorData } = onFiltersChange

  const [pieSeries, setPieSeries] = useState([])
  const [pieLabels, setPieLabels] = useState([])

  const router = useRouter()
  const searchParams = useSearchParams()

  
  const currentOrgName = searchParams.get('orgName') || ''
  const currentBranchId = searchParams.get('branchId') || ''
  const currentOrgId = searchParams.get('organizationId') || ''

  useEffect(() => {
    if (!entityCounts || !Array.isArray(entityCounts)) {
      setPieSeries([])
      setPieLabels([])
      return
    }

    const series = []
    const labels = []

    entityCounts.forEach(item => {
      const entityLabel = EntityType[item.entity]
      if (entityLabel) {
        if (item.activeCount > 0) {
          series.push(item.activeCount)
          labels.push(`Active ${entityLabel}`)
        }
        if (item.inActiveCount > 0) {
          series.push(item.inActiveCount)
          labels.push(`Inactive ${entityLabel}`)
        }
      }
    })

    setPieSeries(series)
    setPieLabels(labels)
  }, [entityCounts])

  const isSensorDataValid = Array.isArray(sensorData) && sensorData.length > 0

  const grouped = {}
  let allTimes = []
  let chartData = []
  let minTemp, maxTemp

  const formatDateTime = isoString => {
    if (!isoString) return ''
    const d = new Date(isoString)
    return d.toLocaleString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  if (isSensorDataValid) {
    sensorData.forEach(item => {
      if (!grouped[item.sensorName]) grouped[item.sensorName] = []
      grouped[item.sensorName].push({
        ...item,
        time: formatDateTime(item.serverTime),
        serverTime: item.serverTime
      })
    })
    allTimes = Array.from(new Set(sensorData.map(item => formatDateTime(item.serverTime))))
    chartData = allTimes.map(time => {
      const entry = { time }
      Object.keys(grouped).forEach(sensor => {
        const found = grouped[sensor].find(d => d.time === time)
        entry[sensor] = found ? found.currentTemperature : null
      })
      return entry
    })
    minTemp = Math.min(...sensorData.map(d => d.minTemperature))
    maxTemp = Math.max(...sensorData.map(d => d.maxTemperature))
  }

 const handlePieClick = (_, index) => {
  const status = pieLabels[index]
  const urlParams = new URLSearchParams()
  urlParams.append('status', status)
  if (currentOrgId) urlParams.append('organizationId', currentOrgId)
  if (currentBranchId) urlParams.append('branchId', currentBranchId)
  if (currentOrgName) urlParams.append('orgName', currentOrgName)

  router.push(`/branch?${urlParams.toString()}`)
}


  return (
    <Grid container spacing={4}>
      <Grid item xs={12} md={6}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant='h6' mb={2}>
            Overview
          </Typography>
          <AppReactApexCharts
            type='donut'
            series={pieSeries}
            options={{
              labels: pieLabels,
              chart: {
                events: {
                  dataPointSelection: handlePieClick
                }
              }
            }}
            boxProps={{ sx: { maxWidth: 600, mx: 'auto' } }}
            height={385}
          />
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant='h6' mb={2}>
            Sensor
          </Typography>
          <ResponsiveContainer width='100%' height={387}>
            {isSensorDataValid ? (
              <ComposedChart data={chartData}>
                <CartesianGrid stroke='#eee' strokeDasharray='3 3' />
                <XAxis
                  dataKey='time'
                  minTickGap={20}
                  label={{ value: 'Date & Time', position: 'insideBottom', offset: -3 }}
                />
                <YAxis label={{ value: 'Temperature', angle: -90, position: 'insideLeft', offset: 10 }} />
                <Tooltip />
                <Legend />
                <ReferenceArea y1={minTemp} y2={maxTemp} fill='#b2fab4' fillOpacity={0.2} />
                <ReferenceLine y={minTemp} label='Min' stroke='#8884d8' strokeDasharray='3 3' />
                <ReferenceLine y={maxTemp} label='Max' stroke='#82ca9d' strokeDasharray='3 3' />
                {Object.keys(grouped).map((sensor, idx) => (
                  <Line
                    key={sensor}
                    type='monotone'
                    dataKey={sensor}
                    stroke={`hsl(${(idx * 60) % 360}, 70%, 50%)`}
                    dot={false}
                    name={sensor}
                  />
                ))}
              </ComposedChart>
            ) : (
              <Box display='flex' alignItems='center' justifyContent='center' height={300}>
                <Typography variant='body2' color='textSecondary'>
                  No sensor data available.
                </Typography>
              </Box>
            )}
          </ResponsiveContainer>
        </Paper>
      </Grid>
    </Grid>
  )
}

export default AlarmAndOrgCharts
