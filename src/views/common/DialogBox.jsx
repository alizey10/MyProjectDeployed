'use client'

import { useEffect } from 'react'
import {
  TextField,
  InputAdornment,
  InputLabel,
  Button,
  Grid,
  DialogActions,
  DialogContent,
  DialogTitle,
  Dialog,
  Select,
  MenuItem
} from '@mui/material'
import { useForm } from 'react-hook-form'

const DialogBox = ({ open, title, onClose, data, onSave, fields, organization }) => {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: data || {}
  })

  useEffect(() => {
    if (open) {
      reset(data || {})
    }
    if (!data) {
      reset({})
    }
  }, [open, data, reset])

  const onSubmit = updatedData => {
    reset(updatedData)
    onSave(updatedData)
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='md'>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <form id='edit-form' onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={4} mt={0.5}>
            {organization?.length > 0 && !data && (
              <>
                <InputLabel sx={{ marginLeft: '1rem' }}>Organization</InputLabel>
                <Select
                  label='Organization'
                  defaultValue={organization[0]?.organizationId}
                  fullWidth
                  sx={{ marginLeft: '1rem' }}
                  {...register('organizationId')}
                >
                  {organization.map(org => (
                    <MenuItem key={org.organizationId} value={org.organizationId}>
                      {org.organizationName}
                    </MenuItem>
                  ))}
                </Select>
              </>
            )}
            {fields.map((field, index) => (
              <Grid item xs={12} md={6} key={index}>
                <TextField
                  fullWidth
                  label={field.label}
                  placeholder={field.placeholder}
                  {...register(field.name)}
                  InputProps={{
                    startAdornment: field.icon ? <InputAdornment position='start'>{field.icon}</InputAdornment> : null
                  }}
                />
              </Grid>
            ))}
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
        <Button type='submit' form='edit-form' variant='contained'>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DialogBox
