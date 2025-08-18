
'use client'
import ReportServices from '@/@services/reportService'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
   Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'
import { Box, Grid, Typography, Paper, Popover , CircularProgress, Tooltip as MuiTooltip } from '@mui/material'

const COLORS = ['#4CAF50', '#F44336', '#2196F3', '#FF9800', '#9C27B0', '#795548', '#00BCD4', '#E91E63']

const EntityType = { 0: 'Organizations', 1: 'Branches', 2: 'Gateways', 3: 'Sensors' }
const StatusEnum = { ACTIVE: 'active', INACTIVE: 'inactive' }

const AlarmAndOrgCharts = ({ entityCounts }) => {

  const [groupedData, setGroupedData] = useState({})

useEffect(() => {
  const fetchData = async () => {
    try {
      const res = await ReportServices.getSensorSummary()
      const grouped = {}

      res?.data?.data?.forEach(item => {
        const dateObj = new Date(item.serverTime)
        const day = !isNaN(dateObj.getTime()) ? dateObj.toLocaleDateString('en-GB') : null
        if (!day) return

        if (!grouped[item.sensorId]) grouped[item.sensorId] = []
        grouped[item.sensorId].push({
          day,
          temperature: Number(item.currentTemperature) || 0,
          sensorData: item
        })
      })

      setGroupedData(grouped)
    } catch (err) {
      console.error('Error fetching sensor summary:', err)
    } finally {
      setLoading(false)
    }
  }

  fetchData()
}, [])

  const [pieData, setPieData] = useState([])
  const router = useRouter()
const [loading, setLoading] = useState(true);
const [showTooltip, setShowTooltip] = useState(false)

  const chartRef = useRef(null)
  const [anchorPosition, setAnchorPosition] = useState(null)
  const [selectedSensor, setSelectedSensor] = useState(null)

  const handleLineClick = (sensorData) => {
    if (!chartRef.current) return
    const chartRect = chartRef.current.getBoundingClientRect()
    setSelectedSensor(sensorData)
    setAnchorPosition({
      top: chartRect.top + chartRect.height / 2,
      left: chartRect.left + chartRect.width / 2
    })
  }

  const handleClose = () => {
    setAnchorPosition(null)
    setSelectedSensor(null)
  }

  const open = Boolean(anchorPosition)
  const id = open ? 'sensor-popover' : undefined


  const handleSliceClick = (label) => {
    let status = ''
    let path = ''
    const urlParams = new URLSearchParams()
    switch (label) {
      case 'Active Organizations': status = StatusEnum.ACTIVE; path = '/organization'; break
      case 'Inactive Organizations': status = StatusEnum.INACTIVE; path = '/organization'; break
      case 'Active Branches': status = StatusEnum.ACTIVE; path = '/branch'; break
      case 'Inactive Branches': status = StatusEnum.INACTIVE; path = '/branch'; break
      case 'Active Gateways': status = StatusEnum.ACTIVE; path = '/gateway'; break
      case 'Inactive Gateways': status = StatusEnum.INACTIVE; path = '/gateway'; break
      case 'Active Sensors': status = StatusEnum.ACTIVE; path = '/sensor'; break
      case 'Inactive Sensors': status = StatusEnum.INACTIVE; path = '/sensor'; break
      default: return
    }
    urlParams.set('status', status)
    router.push(`${path}?${urlParams.toString()}`)
  }


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
    setPieData(formatted.filter(entry => entry.value > 0))
  }, [entityCounts])

  const renderLabel = ({ value }) => (value === 0 ? null : `${value}`)
 useEffect(() => {
  setLoading(true);

  const fetchData = async () => {
    try {
      const res = await ReportServices.getSensorSummary()
      const grouped = {}

      res?.data?.data?.forEach(item => {
        const dateObj = new Date(item.serverTime)
        const day = !isNaN(dateObj.getTime()) ? dateObj.toLocaleDateString('en-GB') : null
        if (!day) return

        if (!grouped[item.sensorId]) grouped[item.sensorId] = []
        grouped[item.sensorId].push({
          day,
          temperature: Number(item.currentTemperature) || 0,
          sensorData: item
        })
      })

      setGroupedData(grouped)
    } catch (err) {
      console.error('Error fetching sensor summary:', err)
    } finally {
      setLoading(false)
    }
  }

  fetchData()
}, [])



  return (
    <Grid container spacing={4}>
     {/* Pie Chart */}
<Grid item xs={12} md={6}>
  <Paper elevation={3} sx={{ p: 2 }}>
    <Typography variant='h6' mb={2}>Overview</Typography>
    <Box sx={{ height: 387 }}>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress size={40} />
        </Box>
      ) : (
        <ResponsiveContainer width='100%' height='100%'>
         <PieChart>
  <Pie
    data={pieData}
    cx='50%'
    cy='50%'
    innerRadius={60}
    outerRadius={100}
    paddingAngle={5}
    dataKey='value'
    labelLine={false}
    label={renderLabel}
    onClick={(data) => handleSliceClick(data.name)}
  >
    {pieData.map((entry, index) => (
      <Cell
        key={`cell-${index}`}
        fill={COLORS[index % COLORS.length]}
        style={{ cursor: 'pointer' }}
      />
    ))}
  </Pie>
<Tooltip
  content={({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0].payload;
    const total = pieData.reduce((sum, entry) => sum + entry.value, 0) || 1;
    const percent = ((data.value / total) * 100).toFixed(1);
    return (
      <Box sx={{ p: 1, bgcolor: '#fff', border: '1px solid #ccc', borderRadius: 1 }}>
        <Typography variant='body2' fontWeight='bold'>{data.name}</Typography>
        <Typography variant='body2'>Count: {data.value}</Typography>
        <Typography variant='body2'>Percent: {percent}%</Typography>
      </Box>
    )
  }}
/>

  <Legend />
</PieChart>

        </ResponsiveContainer>
      )}
    </Box>
  </Paper>
</Grid>


      {/* Line Chart */}
      <Grid item xs={12} md={6}>
       <Paper elevation={3} sx={{ p: 2 }} ref={chartRef}>
  <Typography variant='h6' mb={2}>Alarm Metrics</Typography>
  <Box sx={{ height: 300 }}> 
    {loading ? (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress size={40} />
      </Box>
    ) : (
      <ResponsiveContainer width='100%' height='100%'>
        <LineChart>
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
         {Object.keys(groupedData).map((sensorId, index) => (
  <Line
    key={sensorId}
    data={groupedData[sensorId]}
    type="monotone"
    dataKey="temperature"
    stroke={COLORS[index % COLORS.length]}
    dot={(props) => {
      const { cx, cy, payload } = props;
      const temp = payload.temperature;
      const min = payload.sensorData.minTemperature;
      const max = payload.sensorData.maxTemperature;
      const fillColor = (temp < min || temp > max) ? '#FF4D6D' : COLORS[index % COLORS.length];

      return (
        <circle cx={cx} cy={cy} r={4} fill={fillColor} stroke="#fff" strokeWidth={1} />
      );
    }}
    activeDot={{
      r: 8,
      onClick: (_, payload) => handleLineClick(payload.payload.sensorData),
    }}
  />
))}

        </LineChart>
      </ResponsiveContainer>
    )}
  </Box>
  <Box mt={1}>
    <Typography variant='body2'>
    Active Alarms <span style={{ color: '#FF4D6D', fontWeight: 'bold' }}>(Red dots = Active)</span>
  </Typography>
    <Typography variant='body2'>High Temp Alarms</Typography>
    <Typography variant='body2'>Low Temp Alarms</Typography>
    <Typography variant='caption'>(All alarms time based)</Typography>
  </Box>
</Paper>

      </Grid>

      {/* Popover */}
    <Popover
  id={id}
  open={open}
  anchorReference='anchorPosition'
  anchorPosition={anchorPosition}
  onClose={handleClose}
>
  {selectedSensor && (
    <Box
      sx={{ p: 2, maxWidth: 250 }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <Typography variant='subtitle2' fontWeight="bold">
        Sensor Name: {selectedSensor.sensorName}
      </Typography>

      <MuiTooltip
  title="Click on Sensor ID to see more details"
  arrow
  open={showTooltip} 
>

        <Typography
          variant='body2'
          onClick={() => router.push(`/sensor?sensorId=${selectedSensor.sensorId}`)}
          sx={{ cursor: 'pointer' }}
        >
          Sensor ID: {selectedSensor.sensorId}
        </Typography>
      </MuiTooltip>

      <Typography variant='body2'>Gateway Id: {selectedSensor.gatewayId}</Typography>
      <Typography variant='body2'>Current Temp: {selectedSensor.currentTemperature}°C</Typography>
      <Typography variant='body2'>Min Temp: {selectedSensor.minTemperature}°C</Typography>
      <Typography variant='body2'>Max Temp: {selectedSensor.maxTemperature}°C</Typography>

      <Typography variant='caption' display="block" mt={1}>
        {new Date(selectedSensor.serverTime).toLocaleString()}
      </Typography>
    </Box>
  )}
</Popover>


    </Grid>
  )
}

export default AlarmAndOrgCharts
