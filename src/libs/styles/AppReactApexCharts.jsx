'use client'

import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'
import { useRouter } from 'next/navigation'
import ReactApexcharts from '@/libs/ApexCharts'

const ApexChartWrapper = styled(Box)(({ theme }) => ({
  '& .apexcharts-canvas': {
    "& line[stroke='transparent']": {
      display: 'none'
    },
    '& .apexcharts-tooltip': {
      boxShadow: 'var(--mui-shadows-3)',
      borderColor: 'var(--mui-palette-divider)',
      background: 'var(--mui-palette-background-paper)',
      ...(theme.direction === 'rtl' && {
        '.apexcharts-tooltip-marker': {
          marginInlineEnd: 10,
          marginInlineStart: 0
        },
        '.apexcharts-tooltip-text-y-value': {
          marginInlineStart: 5,
          marginInlineEnd: 0
        }
      }),
      '& .apexcharts-tooltip-title': {
        fontWeight: 600,
        borderColor: 'var(--mui-palette-divider)',
        background: 'var(--mui-palette-background-paper)'
      },
      '&.apexcharts-theme-light': {
        color: 'var(--mui-palette-text-primary)'
      },
      '&.apexcharts-theme-dark': {
        color: 'var(--mui-palette-common-white)'
      },
      '& .apexcharts-tooltip-series-group:first-of-type': {
        paddingBottom: 0
      },
      '& .bar-chart': {
        padding: theme.spacing(2, 2.5)
      }
    },
    '& .apexcharts-xaxistooltip': {
      borderColor: 'var(--mui-palette-divider)',
      '&:before': {
        borderBottomColor: 'var(--mui-palette-divider)'
      }
    },
    '& .apexcharts-yaxistooltip': {
      borderColor: 'var(--mui-palette-divider)',
      '&:before': {
        borderLeftColor: 'var(--mui-palette-divider)'
      }
    },
    '& .apexcharts-xaxistooltip-text, & .apexcharts-yaxistooltip-text': {
      color: 'var(--mui-palette-text-primary)'
    },
    '& .apexcharts-yaxis .apexcharts-yaxis-texts-g .apexcharts-yaxis-label': {
      textAnchor: theme.direction === 'rtl' ? 'start' : undefined
    },
    '& .apexcharts-text, & .apexcharts-tooltip-text, & .apexcharts-datalabel-label, & .apexcharts-datalabel, & .apexcharts-xaxistooltip-text, & .apexcharts-yaxistooltip-text, & .apexcharts-legend-text':
      {
        fontFamily: `${theme.typography.fontFamily} !important`
      },
    '& .apexcharts-pie-label': {
      filter: 'none'
    },
    '& .apexcharts-marker': {
      boxShadow: 'none'
    }
  }
}))

// ✅ Added StatusEnum for active/inactive
const StatusEnum = {
  ACTIVE: 'active',
  INACTIVE: 'inactive'
}

const AppReactApexCharts = props => {
  const { boxProps, ...rest } = props
  const router = useRouter()

  const handleSliceClick = label => {
    let status = ''
    let path = ''
    const urlParams = new URLSearchParams()

    switch (label) {
      case 'Active Organizations':
        status = StatusEnum.ACTIVE
        path = '/organization'
        break
      case 'Inactive Organizations':
        status = StatusEnum.INACTIVE
        path = '/organization'
        break
      case 'Active Branches':
        status = StatusEnum.ACTIVE
        path = '/branch'
        break
      case 'Inactive Branches':
        status = StatusEnum.INACTIVE
        path = '/branch'
        break
      case 'Active Gateways':
        status = StatusEnum.ACTIVE
        path = '/gateway'
        break
      case 'Inactive Gateways':
        status = StatusEnum.INACTIVE
        path = '/gateway'
        break
      case 'Active Sensors':
        status = StatusEnum.ACTIVE
        path = '/sensor'
        break
      case 'Inactive Sensors':
        status = StatusEnum.INACTIVE
        path = '/sensor'
        break
      default:
        return
    }

    urlParams.set('status', status)
    router.push(`${path}?${urlParams.toString()}`)
  }

  const optionsWithClick = {
    ...rest.options,
    chart: {
      ...rest.options?.chart,
      toolbar: { show: true },
      foreColor: rest.options?.chart?.foreColor || undefined,
      events: {
        ...rest.options?.chart?.events,
        dataPointSelection: (event, chartContext, config) => {
          const clickedLabel = config.w.config.labels[config.dataPointIndex]
          handleSliceClick(clickedLabel)
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
