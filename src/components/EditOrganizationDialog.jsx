'use client'

import { useEffect } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import { useForm } from 'react-hook-form'

const AddOrEditOrganizationDialog = ({ open, title, onClose, orgData, onSave }) => {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      organizationName: '',
      phone: '',
      city: '',
      country: '',
      address: '',
      postCode: '',
      poc: ''
    }
  })

  useEffect(() => {
    if (open) {
      reset(
        orgData || {
          organizationName: '',
          phone: '',
          city: '',
          country: '',
          address: '',
          postCode: '',
          poc: ''
        }
      )
    }
  }, [open, orgData, reset])

  const onSubmit = data => {
    onSave(data)
    reset()
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='md'>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <form id='edit-org-form' onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={5} mt={0.5}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label='Organization Name'
                placeholder='TopNotch Ltd.'
                {...register('organizationName')}
                InputProps={{
                  startAdornment: <InputAdornment position='start'>🏢</InputAdornment>
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label='Phone'
                placeholder='0311-0000000'
                {...register('phone')}
                InputProps={{
                  startAdornment: <InputAdornment position='start'>📞</InputAdornment>
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label='City' {...register('city')} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label='Country' {...register('country')} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label='Address' {...register('address')} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label='Post Code' {...register('postCode')} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label='POC' {...register('poc')} />
            </Grid>
          </Grid>
        </form>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            reset()
            onClose()
          }}
          color='secondary'
          variant='outlined'
        >
          Cancel
        </Button>
        <Button type='submit' form='edit-org-form' variant='contained'>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AddOrEditOrganizationDialog
