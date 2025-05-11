// MUI Imports
import Chip from '@mui/material/Chip'
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'

// Component Imports
import { Menu, SubMenu, MenuItem, MenuSection } from '@menu/vertical-menu'

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
          Analytics
        </MenuItem>
        <MenuSection
          label='Managers'
          icon={<i className='ri-home-smile-line' />}
          suffix={<Chip label='4' size='small' color='error' />}
        >
          <MenuItem
            href={`/organization`} // to be replaced with new pages
            suffix={<Chip label='1' size='small' color='primary' variant='tonal' />} // need if need to show the notification count
            target='_blank'
          >
            Organization Manager
          </MenuItem>
          <MenuItem
            // href={`${process.env.NEXT_PUBLIC_PRO_URL}/dashboards/crm`} // to be replaced with new pages
            // suffix={<Chip label='Pro' size='small' color='primary' variant='tonal' />} // need if need to show the notification count
            target='_blank'
          >
            Branch Manager
          </MenuItem>
          <MenuItem
            // href={`${process.env.NEXT_PUBLIC_PRO_URL}/dashboards/crm`} // to be replaced with new pages
            // suffix={<Chip label='Pro' size='small' color='primary' variant='tonal' />} // need if need to show the notification count
            target='_blank'
          >
            Gateway Manager
          </MenuItem>
          <MenuItem
            // href={`${process.env.NEXT_PUBLIC_PRO_URL}/dashboards/crm`} // to be replaced with new pages
            // suffix={<Chip label='Pro' size='small' color='primary' variant='tonal' />} // need if need to show the notification count
            target='_blank'
          >
            Sensor Manager
          </MenuItem>
        </MenuSection>
      </Menu>
    </ScrollWrapper>
  )
}

export default VerticalMenu
