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
import { Box, Grid, Typography, Paper, Popover, Button } from '@mui/material'
import React, { useRef } from 'react'

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
  const [legendPopover, setLegendPopover] = useState({ open: false, anchor: null, entity: null, status: null })
  const [popover, setPopover] = useState({ open: false, anchor: null, entry: null })
  const pieChartRef = useRef(null)

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

  // Handle legend color click
  const handleLegendClick = (event, entity, status) => {
    console.log('Legend clicked:', entity, status)
    setLegendPopover({ open: true, anchor: { mouseX: event.clientX, mouseY: event.clientY }, entity, status })
  }

  const handleLegendPopoverClose = () => {
    console.log('Legend clicked:', entity, status)

    setLegendPopover({ open: false, anchor: null, entity: null, status: null })
  }

  // Helper to get filtered data for legend popover
  const getLegendData = () => {
    if (!legendPopover.entity || !legendPopover.status) return []
    return pieData.filter(entry => {
      const isActive = legendPopover.status === 'active'
      return (
        (isActive ? entry.name.startsWith('Active') : entry.name.startsWith('Inactive')) &&
        entry.name.includes(legendPopover.entity)
      )
    })
  }

  const handleCellClick = (event, entry) => {
    setPopover({
      open: true,
      anchor: { mouseX: event.clientX, mouseY: event.clientY },
      entry
    })
  }

  const handleCellMouseEnter = (event, entry) => {
    setPopover({
      open: true,
      anchor: { mouseX: event.clientX, mouseY: event.clientY },
      entry
    })
  }

  const handleCellMouseLeave = () => {
    setPopover({ open: false, anchor: null, entry: null })
  }

  const handlePopoverClose = () => {
    setPopover({ open: false, anchor: null, entry: null })
  }

  // Add a handler for mouse leave on the PieChart area
  const handlePieChartMouseLeave = () => {
    setPopover({ open: false, anchor: null, entry: null })
  }

  return (
    <Grid container spacing={4}>
      {/* Left Chart */}
      <Grid item xs={12} md={6}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant='h6' mb={2}>
            Overview
          </Typography>
          <ResponsiveContainer width='100%' height={387}>
            <PieChart ref={pieChartRef} onMouseLeave={handlePieChartMouseLeave}>
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
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    onClick={e => handleCellClick(e, entry)}
                    onMouseMove={e => handleCellMouseEnter(e, entry)}
                    onMouseLeave={handleCellMouseLeave}
                    style={{ cursor: 'pointer' }}
                  />
                ))}
              </Pie>
              {/* Custom Legend with clickable colors */}
              <Box display='flex' flexWrap='wrap' mt={2}>
                {Object.values(EntityType).map((entity, i) => (
                  <Box key={entity} display='flex' alignItems='center' mr={2} mb={1}>
                    {/* Active color */}
                    <Box
                      sx={{ width: 20, height: 20, bgcolor: COLORS[i * 2], cursor: 'pointer', borderRadius: '50%' }}
                      onClick={e => handleLegendClick(e, entity, 'active')}
                      mr={1}
                    />
                    <Typography variant='body2' mr={1}>
                      Active {entity}
                    </Typography>
                    {/* Inactive color */}
                    <Box
                      sx={{ width: 20, height: 20, bgcolor: COLORS[i * 2 + 1], cursor: 'pointer', borderRadius: '50%' }}
                      onClick={e => handleLegendClick(e, entity, 'inactive')}
                      mr={1}
                    />
                    <Typography variant='body2'>Inactive {entity}</Typography>
                  </Box>
                ))}
              </Box>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          {/* Popover for legend color click */}
          <Popover
            open={legendPopover.open}
            anchorReference='anchorPosition'
            anchorPosition={
              legendPopover.anchor ? { top: legendPopover.anchor.mouseY, left: legendPopover.anchor.mouseX } : undefined
            }
            onClose={handleLegendPopoverClose}
            disableRestoreFocus
          >
            <Box p={2} minWidth={200}>
              <Typography variant='subtitle1' mb={1}>
                {legendPopover.status === 'active' ? 'Active' : 'Inactive'} {legendPopover.entity} Data
              </Typography>
              {getLegendData().length > 0 ? (
                getLegendData().map((entry, idx) => (
                  <Box key={idx} mb={1}>
                    <Typography variant='body2'>
                      {entry.name}: {entry.value}
                    </Typography>
                    {/* Show more details if needed */}
                  </Box>
                ))
              ) : (
                <Typography variant='body2'>No data available.</Typography>
              )}
              <Box mt={1} textAlign='right'>
                <Button size='small' onClick={handleLegendPopoverClose}>
                  Close
                </Button>
              </Box>
            </Box>
          </Popover>
          {/* Popover for Pie section click */}
          <Popover
            open={popover.open}
            anchorReference='anchorPosition'
            anchorPosition={popover.anchor ? { top: popover.anchor.mouseY, left: popover.anchor.mouseX } : undefined}
            onClose={handlePopoverClose}
            disableRestoreFocus
          >
            {popover.entry && (
              <Box p={2}>
                <Typography variant='subtitle2'>{popover.entry.name}</Typography>
                <Typography variant='body2'>Active: {popover.entry.value}</Typography>
                <Typography variant='body2'>Inactive: {0}</Typography>
              </Box>
            )}
          </Popover>
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
