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

const DialogBox = ({ open, title, onClose, data, onSave, fields }) => {
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
          <Grid container spacing={5} mt={0.5}>
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
