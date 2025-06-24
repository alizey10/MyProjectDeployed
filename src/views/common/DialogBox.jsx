'use client'

import { useEffect, useState } from 'react'

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
  MenuItem,
  CircularProgress
} from '@mui/material'
import { useForm } from 'react-hook-form'

const DialogBox = ({ open, title, onClose, data, onSave, fields, organization }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
    setValue,
    watch
  } = useForm({
    defaultValues: data || {},
    mode: 'onChange'
  })

  const [isLoading, setIsLoading] = useState(false)

  const formValues = watch()

  useEffect(() => {
    if (open) {
      reset(data || {})
    }

    if (!data) {
      reset({})
    }
  }, [open, data, reset])

  const onSubmit = async updatedData => {
    setIsLoading(true)

    try {
      await onSave(updatedData)
      reset(updatedData)
    } catch (error) {
      console.error('Error saving data', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Validation rules for fields
  const getValidationRules = field => {
    if (field.required) {
      return {
        required: `${field.label} is required`
      }
    }

    return {}
  }

  // Check if any field is empty
  const isAnyFieldEmpty = () => {
    return Object.values(formValues).some(value => value === '')
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='md'>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <form id='edit-form' onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={4} mt={0.5}>
            {organization?.length > 0 && !data && (
              <Grid item xs={12}>
                <InputLabel>Organization</InputLabel>
                <Select
                  label='Organization'
                  defaultValue={organization[0]?.organizationId}
                  fullWidth
                  {...register('organizationId', { required: 'Organization is required' })}
                >
                  {organization.map(org => (
                    <MenuItem key={org.organizationId} value={org.organizationId}>
                      {org.organizationName}
                    </MenuItem>
                  ))}
                </Select>
                {errors.organizationId && (
                  <p style={{ color: 'red', fontSize: '12px' }}>{errors.organizationId.message}</p>
                )}
              </Grid>
            )}
            {fields.map((field, index) => (
              <Grid item xs={12} md={6} key={index}>
                <TextField
                  fullWidth
                  label={field.label}
                  placeholder={field.placeholder}
                  {...register(field.name, getValidationRules(field))}
                  InputProps={{
                    startAdornment: field.icon ? <InputAdornment position='start'>{field.icon}</InputAdornment> : null
                  }}
                  error={!!errors[field.name]}
                  helperText={errors[field.name]?.message}
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
        <Button type='submit' form='edit-form' variant='contained' disabled={isAnyFieldEmpty() || isLoading}>
          {isLoading ? <CircularProgress size={24} color='inherit' /> : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DialogBox
