'use client'
import { useEffect, useState, useRef } from 'react'

import { Box, Grid, Typography, Paper, Popover, Button } from '@mui/material'

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
  Legend,
  ReferenceLine,
  ReferenceArea
} from 'recharts'

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

const AlarmAndOrgCharts = ({ onFiltersChange }) => {
  const { entityCounts, sensorData } = onFiltersChange
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

  // Validate sensorData before computations
  const isSensorDataValid = Array.isArray(sensorData) && sensorData.length > 0

  // Only compute chart data if sensorData is valid
  const grouped = {}
  let allTimes = []
  let chartData = []
  let minTemp, maxTemp

  if (isSensorDataValid) {
    sensorData.forEach(item => {
      if (!grouped[item.sensorName]) grouped[item.sensorName] = []
      grouped[item.sensorName].push({
        ...item,
        time: new Date(item.serverTime).toLocaleTimeString()
      })
    })
    allTimes = Array.from(new Set(sensorData.map(item => new Date(item.serverTime).toLocaleTimeString())))
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
            Sensor
          </Typography>
          <ResponsiveContainer width='100%' height={387}>
            {isSensorDataValid ? (
              <ComposedChart data={chartData}>
                <CartesianGrid stroke='#eee' strokeDasharray='3 3' />
                <XAxis dataKey='time' minTickGap={20} label={{ value: 'Time', position: 'insideBottom', offset: -3 }} />
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
