// MUI Imports
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'

// Component Imports
import { Menu, MenuItem } from '@menu/vertical-menu'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Styled Component Imports
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'

const RenderExpandIcon = ({ open, transitionDuration }) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='ri-arrow-right-s-line' />
  </StyledVerticalNavExpandIcon>
)

const VerticalMenu = ({ scrollMenu }) => {
  // Hooks
  const theme = useTheme()
  const { isBreakpointReached, transitionDuration } = useVerticalNav()
  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  return (
    // eslint-disable-next-line lines-around-comment
    /* Custom scrollbar instead of browser scroll, remove if you want browser scroll only */

    <ScrollWrapper
      {...(isBreakpointReached
        ? {
            className: 'bs-full overflow-y-auto overflow-x-hidden',
            onScroll: container => scrollMenu(container, false)
          }
        : {
            options: { wheelPropagation: false, suppressScrollX: true },
            onScrollY: container => scrollMenu(container, true)
          })}
    >
      {/* Incase you also want to scroll NavHeader to scroll with Vertical Menu, remove NavHeader from above and paste it below this comment */}
      {/* Vertical Menu */}
      <Menu
        menuItemStyles={menuItemStyles(theme)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='ri-circle-line' /> }}
        menuSectionStyles={menuSectionStyles(theme)}
      >
        <MenuItem href='/' active='true' icon={<i className='ri-bar-chart-box-line' />}>
          Dashboard
        </MenuItem>
        <MenuItem
          href={`/organization`}
          icon={<i class='ri-organization-chart'></i>}
          // suffix={<Chip size='small' color='primary' variant='tonal' />} // need if need to show the notification count
        >
          Organization Manager
        </MenuItem>
        <MenuItem
          icon={<i class='ri-git-branch-line'></i>}
          // href={`${process.env.NEXT_PUBLIC_PRO_URL}/dashboards/crm`} // to be replaced with new pages
          // suffix={<Chip label='Pro' size='small' color='primary' variant='tonal' />} // need if need to show the notification count
        >
          Branch Manager
        </MenuItem>
        <MenuItem
          icon={<i class='ri-refund-line'></i>}
          // href={`${process.env.NEXT_PUBLIC_PRO_URL}/dashboards/crm`} // to be replaced with new pages
          // suffix={<Chip label='Pro' size='small' color='primary' variant='tonal' />} // need if need to show the notification count
        >
          Gateway Manager
        </MenuItem>
        <MenuItem
          icon={<i class='ri-sensor-line'></i>}
          // href={`${process.env.NEXT_PUBLIC_PRO_URL}/dashboards/crm`} // to be replaced with new pages
          // suffix={<Chip label='Pro' size='small' color='primary' variant='tonal' />} // need if need to show the notification count
        >
          Sensor Manager
        </MenuItem>
      </Menu>
    </ScrollWrapper>
  )
}

export default VerticalMenu
