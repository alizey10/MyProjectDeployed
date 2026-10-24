        'use client'

        import { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
        import IconButton from '@mui/material/IconButton'
        import Badge from '@mui/material/Badge'
        import NotificationsIcon from '@mui/icons-material/Notifications'
        import Menu from '@mui/material/Menu'
        import MenuItem from '@mui/material/MenuItem'
        import { useRouter } from 'next/navigation'
        import formService from '@/@services/formService'

        const NotificationBell = forwardRef((props, ref) => {
        const [assignments, setAssignments] = useState([])
        const [anchorEl, setAnchorEl] = useState(null)
        const router = useRouter()

        const loadAssignments = async () => {
            try {
            const res = await formService.getMyAssignments(1, 50)
            if (res?.data?.success) {
                const pending = res.data.data.filter(a => a.status !== 'Completed')

                 setAssignments(pending)
            }
            } catch (err) {
            console.error(err)
            }
        }

      useImperativeHandle(ref, () => ({
    reloadAssignments: async () => {
      const res = await fetchAssignmentsFromAPI()
      setAssignments(res)
    },
    removeAssignment: (assignmentId) => {
      setAssignments(prev => prev.filter(a => a.assignmentId !== assignmentId))
    }
  }))
        useEffect(() => {
            loadAssignments()
            const interval = setInterval(loadAssignments, 30000)
            return () => clearInterval(interval)
        }, [])

        const handleClick = (event) => {
            setAnchorEl(event.currentTarget)
        }

        const handleClose = () => setAnchorEl(null)

        const handleNotificationClick = (assignmentId) => {
            router.push(`/list?assignmentId=${assignmentId}`)
            handleClose()
        }

        return (
            <>
            <IconButton onClick={handleClick}>
                <Badge color="error" variant="dot" invisible={assignments.length === 0}>
                <NotificationsIcon />
                </Badge>
            </IconButton>

            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                {assignments.length === 0 && (
                <MenuItem>No new assignments</MenuItem>
                )}

                {assignments.map(a => (
                <MenuItem
                    key={a.assignmentId}
                    onClick={() => handleNotificationClick(a.assignmentId)}
                >
                    {a.formTitle}
                </MenuItem>
                ))}
            </Menu>
            </>
        )
        })

        NotificationBell.displayName = 'NotificationBell'
        export default NotificationBell
