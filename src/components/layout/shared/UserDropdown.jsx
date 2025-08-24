'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { styled } from '@mui/material/styles'
import Badge from '@mui/material/Badge'
import Avatar from '@mui/material/Avatar'
import Popper from '@mui/material/Popper'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import MenuList from '@mui/material/MenuList'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import useAuth from '@/app/hooks/useAuth'
import CircularProgress from '@mui/material/CircularProgress'

const BadgeContentSpan = styled('span')({
  width: 8,
  height: 8,
  borderRadius: '50%',
  cursor: 'pointer',
  backgroundColor: 'var(--mui-palette-success-main)',
  boxShadow: '0 0 0 2px var(--mui-palette-background-paper)'
})

const UserDropdown = () => {
  const { user, accessToken} = useAuth()
  const [open, setOpen] = useState(false)
  const anchorRef = useRef(null)
  const router = useRouter()
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const imgSrc = user?.avatar || undefined

  const displayName = user?.fullName || user?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || 'User'

  const avatarInitial = !user?.avatar && displayName ? displayName[0].toUpperCase() : undefined

  // const decodeJWT = (token) => {
  //   try {
  //     const payload = token.split('.')[1]
  //     return JSON.parse(atob(payload))
  //   } catch (err) {
  //     console.error('Invalid token', err)
  //     return null
  //   }
  // }
  // const tokenPayload = accessToken ? decodeJWT(accessToken) : null
  // const displayName = tokenPayload?.fullName || tokenPayload?.name || 'User'
  // const avatarInitial = !tokenPayload?.avatar && displayName
  //   ? displayName[0].toUpperCase()
  //   : tokenPayload?.avatar
  // const imgSrc = tokenPayload?.avatar || undefined

  const confirmLogout = async () => {
    setLoggingOut(true)
    try {
      if (accessToken) {
        const { default: AuthService } = await import('@/views/authservice')
        const authApi = new AuthService()

        const response = await authApi.logout()
      }
    } catch (err) {
      console.error('Logout failed', err)
    } finally {
    
      setLogoutDialogOpen(false)
      setLoggingOut(false)
      router.push('/login')
    }
  }

  return (
    <>
      <Badge
        ref={anchorRef}
        overlap='circular'
        badgeContent={<BadgeContentSpan onClick={() => setOpen(prev => !prev)} />}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        className='mis-2'
      >
        <Avatar
          alt={displayName || 'User'}
          src={imgSrc}
          children={avatarInitial}
          onClick={() => setOpen(prev => !prev)}
          className='cursor-pointer bs-[38px] is-[38px]'
        />
      </Badge>

      <Popper
        open={open}
        transition
        disablePortal
        placement='bottom-end'
        anchorEl={anchorRef.current}
        className='min-is-[240px] !mbs-4 z-[1]'
        style={{ zIndex: 100 }}
      >
        {({ TransitionProps, placement }) => (
          <Fade {...TransitionProps} style={{ transformOrigin: placement === 'bottom-end' ? 'right top' : 'left top' }}>
            <Paper className='shadow-lg p-2'>
              <ClickAwayListener onClickAway={() => setOpen(false)}>
                <MenuList>
                  {user ? (
                    <>
                      <div className='flex items-center plb-2 pli-4 gap-2'>
                        <Avatar src={imgSrc} children={avatarInitial} />
                        <div className='flex flex-col items-start'>
                          <Typography className='font-medium'>{displayName}</Typography>
                          <Typography variant='caption'>{user.role}</Typography>
                        </div>
                      </div>
                      <Divider className='mlb-1' />
                      <Link href='/account-settings'>
                        <MenuItem className='gap-3' onClick={() => setOpen(false)}>
                          <i className='ri-user-3-line' />
                          <Typography>My Profile</Typography>
                        </MenuItem>
                      </Link>
                      <Divider />
                      <div className='flex flex-col items-center p-2 gap-1'>
                        <Button
                          fullWidth
                          variant='contained'
                          color='error'
                          size='small'
                          onClick={() => setLogoutDialogOpen(true)}
                        >
                          Logout
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className='flex flex-col items-center p-3 gap-2'>
                      <Typography variant='caption' color='text.secondary'>
                        Not logged in
                      </Typography>
                      <Button fullWidth variant='contained' size='small' onClick={() => router.push('/login')}>
                        Login
                      </Button>
                    </div>
                  )}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>

      <Dialog open={logoutDialogOpen} onClose={() => setLogoutDialogOpen(false)}>
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to logout?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogoutDialogOpen(false)} disabled={loggingOut}>
            Cancel
          </Button>
          <Button color='error' onClick={confirmLogout} disabled={loggingOut}>
            {loggingOut ? <CircularProgress size={20} /> : 'Logout'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default UserDropdown
