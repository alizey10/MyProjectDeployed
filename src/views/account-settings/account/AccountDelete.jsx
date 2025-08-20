'use client'

import { useState } from 'react'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import Typography from '@mui/material/Typography'
import BaseService from '@/@services/baseService' 
import useAuth from '@/app/hooks/useAuth' 

const AccountDelete = () => {
  const { accessToken, refreshToken } = useAuth() 
  const [confirm, setConfirm] = useState(false)
  const [showError, setShowError] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDeactivate = async () => {
    if (!confirm) {
      setShowError(true)
      return
    }

    setLoading(true)
    try {
      const accountService = new BaseService(accessToken, refreshToken)
      await accountService.Delete('Account')

      window.location.href = '/'
    } catch (err) {
      console.error('Account deletion failed:', err)
      alert('Failed to delete account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader title='Delete Account' />
      <CardContent className='flex flex-col items-start gap-6'>
        <FormControlLabel
          control={
            <Checkbox
              checked={confirm}
              onChange={e => {
                setConfirm(e.target.checked)
                setShowError(false)
              }}
            />
          }
          label='I confirm my account deactivation'
        />
        {showError && (
          <Typography color='error' variant='caption'>
            Please check the confirmation box to proceed.
          </Typography>
        )}
        <Button
          variant='contained'
          color='error'
          onClick={handleDeactivate}
          disabled={loading}
        >
          {loading ? 'Deleting...' : 'Deactivate Account'}
        </Button>
      </CardContent>
    </Card>
  )
}

export default AccountDelete
