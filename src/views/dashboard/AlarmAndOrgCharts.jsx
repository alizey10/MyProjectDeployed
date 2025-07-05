'use client'
import { useEffect, useState } from 'react'

import {
  ResponsiveContainer,
  ComposedChart,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  Tooltip,
  Scatter,
  ScatterChart,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'
import { Box, Grid, Typography, Paper } from '@mui/material'

const barLineScatterData = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  activeAlarms: Math.floor(20 + Math.random() * 100),
  trend: 530 + i * 3 + Math.random() * 20,
  tempSpike: 90 + Math.floor(Math.random() * 15)
}))

const COLORS = [
  '#4CAF50', // Active Organizations - green
  '#F44336', // Inactive Organizations - red
  '#2196F3', // Active Branches - blue
  '#FF9800', // Inactive Branches - orange
  '#9C27B0', // Active Gateways - purple
  '#795548', // Inactive Gateways - brown
  '#00BCD4', // Active Sensors - teal
  '#E91E63' // Inactive Sensors - pink
]

const EntityType = {
  0: 'Organizations',
  1: 'Branches',
  2: 'Gateways',
  3: 'Sensors'
}

const AlarmAndOrgCharts = ({ entityCounts }) => {
  const [pieData, setPieData] = useState([])

  useEffect(() => {
    if (!entityCounts || !Array.isArray(entityCounts)) return

    const formatted = []
    entityCounts.forEach(item => {
      const entityLabel = EntityType[item.entity]
      if (entityLabel) {
        formatted.push({ name: `Active ${entityLabel}`, value: item.activeCount })
        formatted.push({ name: `Inactive ${entityLabel}`, value: item.inActiveCount })
      }
    })
    formatted.filter(entry => entry.value > 0)
    setPieData(formatted)
  }, [entityCounts])

  const filteredPieData = pieData.filter(entry => entry.value > 0)
  const renderLabel = ({ value }) => (value === 0 ? null : `${value}`)

  return (
    <Grid container spacing={4}>
      {/* Left Chart */}
      <Grid item xs={12} md={6}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant='h6' mb={2}>
            Overview
          </Typography>
          <ResponsiveContainer width='100%' height={387}>
            <PieChart>
              <Pie
                data={filteredPieData}
                cx='50%'
                cy='50%'
                innerRadius={60}
                outerRadius={100}
                fill='#8884d8'
                paddingAngle={5}
                dataKey='value'
                labelLine={false}
                label={renderLabel}
              >
                {filteredPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
      {/* Right Chart */}
      <Grid item xs={12} md={6}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant='h6' mb={2}>
            Alarm Metrics
          </Typography>
          <ResponsiveContainer width='100%' height={300}>
            <ComposedChart data={barLineScatterData}>
              <CartesianGrid stroke='#eee' strokeDasharray='3 3' />
              <XAxis dataKey='day' />
              <YAxis yAxisId='left' />
              <YAxis yAxisId='right' orientation='right' />
              <Tooltip />
              <Bar yAxisId='left' dataKey='activeAlarms' fill='#8884d8' />
              <Line yAxisId='right' type='monotone' dataKey='trend' stroke='#2c82c9' strokeWidth={2} />
              <Scatter yAxisId='left' dataKey='tempSpike' fill='red' />
            </ComposedChart>
          </ResponsiveContainer>
          <Box mt={1}>
            <Typography variant='body2'>Active Alarms</Typography>
            <Typography variant='body2'>High Temp Alarms</Typography>
            <Typography variant='body2'>Low Temp Alarms</Typography>
            <Typography variant='caption'>(All alarms time based)</Typography>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  )
}

export default AlarmAndOrgCharts
