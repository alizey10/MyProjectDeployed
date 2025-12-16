// MUI Imports
import { useTheme } from '@mui/material/styles'
import Chip from '@mui/material/Chip'

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
import useAuth from '@/app/hooks/useAuth'
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
  const { role } = useAuth()

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
          icon={<i className='ri-organization-chart'></i>}

          // suffix={<Chip label='5' size='small' color='primary' variant='tonal' />}
        >
          Organization Manager
        </MenuItem>
        <MenuItem
          icon={<i className='ri-git-branch-line'></i>}
          href={`/branch`}

          // suffix={<Chip label='new' size='small' color='primary' variant='tonal' />}
        >
          Branch Manager
        </MenuItem>
        <MenuItem
          icon={<i className='ri-refund-line'></i>}
          href={`/gateway`}

          // suffix={<Chip label='new' size='small' color='primary' variant='tonal' />}
        >
          Gateway Manager
        </MenuItem>
        <MenuItem
          icon={<i className='ri-sensor-line'></i>}
          href={`/sensor`}

          // suffix={<Chip label='new' size='small' color='primary' variant='tonal' />}
        >
          Sensor Manager
        </MenuItem>
        {role === 'Admin' && (
          <>
            <MenuItem
              icon={<i className='ri-building-2-line'></i>}
              href={`/floor`}

              // suffix={<Chip label='new' size='small' color='primary' variant='tonal' />}
            >
              Floor Manager
            </MenuItem>
            <MenuItem icon={<i className='ri-user-line'></i>} href='/user'>
              User Manager
            </MenuItem>
            <MenuItem
              icon={<i className='ri-file-list-line'></i>}
              href={`/grid-form`}
              // suffix={<Chip label='new' size='small' color='primary' variant='tonal' />} // Optional
            >
              Form
            </MenuItem>
          </>
        )}
      </Menu>
    </ScrollWrapper>
  )
}

export default VerticalMenu
