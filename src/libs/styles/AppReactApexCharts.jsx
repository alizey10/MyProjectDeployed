'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import Swal from 'sweetalert2'
import Box from '@mui/material/Box'
import { styled, useTheme } from '@mui/material/styles'
import dynamic from 'next/dynamic'

const ReactApexcharts = dynamic(() => import('react-apexcharts'), { ssr: false })

const ApexChartWrapper = styled(Box)(() => ({
  '& .apexcharts-menu-item, & .apexcharts-toolbar': {
    color: '#000 !important',
  },
  '& .apexcharts-menu-item:hover': {
    color: '#333 !important',
  },
  '& .apexcharts-toolbar svg': {
    fill: '#000 !important',
  }
}))

const AppReactApexCharts = props => {
  const { boxProps, ...rest } = props
  const router = useRouter()
  const searchParams = useSearchParams()
  const theme = useTheme()

  const currentOrgId = searchParams.get('organizationId') || ''
  const currentBranchId = searchParams.get('branchId') || ''
  const currentOrgName = searchParams.get('orgName') || ''

  const textColor = theme.palette.mode === 'dark' ? '#fff' : '#000'

  const handleSliceClick = label => {
    let status = ''
    let path = ''
    const urlParams = new URLSearchParams()

    switch (label) {
      case 'Active Organizations':
        status = 'active'
        path = '/organization'
        break
      case 'Inactive Organizations':
        status = 'inactive'
        path = '/organization'
        break
      case 'Active Branches':
        status = 'active'
        path = '/branch'
        break
      case 'Inactive Branches':
        status = 'inactive'
        path = '/branch'
        break
      case 'Active Gateways':
        status = 'active'
        path = '/gateway'
        break
      case 'Inactive Gateways':
        status = 'inactive'
        path = '/gateway'
        break
      case 'Active Sensors':
        status = 'active'
        path = '/sensor'
        break
      case 'Inactive Sensors':
        status = 'inactive'
        path = '/sensor'
        break
      default:
        return
    }

  
    urlParams.append('status', status)
    if (currentOrgId) urlParams.append('organizationId', currentOrgId)
    if (currentBranchId) urlParams.append('branchId', currentBranchId)
    if (currentOrgName) urlParams.append('orgName', currentOrgName)

    Swal.fire({
      title: `Redirecting to ${label}...`,
      icon: 'info',
      timer: 1000,
      showConfirmButton: false,
      didClose: () => {
        router.push(`${path}?${urlParams.toString()}`)
      }
    })
  }

  const optionsWithClick = {
    ...rest.options,
    chart: {
      ...rest.options?.chart,
      toolbar: { show: true },
      foreColor: textColor,
      events: {
        ...rest.options?.chart?.events,
        dataPointSelection: (event, chartContext, config) => {
          const clickedLabel = config.w.config.labels[config.dataPointIndex]
          handleSliceClick(clickedLabel)
        }
      }
    },
    dataLabels: {
      enabled: true,
      style: {
        colors: ['#fff']
      }
    },
    legend: {
      labels: {
        colors: textColor
      }
    },
    xaxis: {
      ...rest.options?.xaxis,
      labels: {
        ...rest.options?.xaxis?.labels,
        style: {
          colors: textColor
        }
      }
    },
    yaxis: {
      ...rest.options?.yaxis,
      labels: {
        ...rest.options?.yaxis?.labels,
        style: {
          colors: textColor
        }
      }
    }
  }

  return (
    <ApexChartWrapper {...boxProps}>
      <ReactApexcharts {...rest} options={optionsWithClick} />
    </ApexChartWrapper>
  )
}

export default AppReactApexCharts
