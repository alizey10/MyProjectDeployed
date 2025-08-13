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
  CircularProgress,
  FormHelperText
} from '@mui/material'

import { useForm } from 'react-hook-form'

const DialogBox = ({ 
  open, 
  title, 
  onClose, 
  data, 
  onSave, 
  fields, 
  organization = [], 
  isCreateMode
}) => {
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
  const [warning, setWarning] = useState({ field: '', message: '' })
  const formValues = watch();

  useEffect(() => {
    if (!open) {
      reset();
      return;
    }

    if (isCreateMode) {
      reset({
        organizationName: '',
        organizationId: '',
        country: '',
        city: '',
        address: '',
        phone: '',
        postCode: '',
        poc: ''
      });
    } else if (data) {
      reset(data);
      setValue('organizationId', data.organizationId);
    }
  }, [open, isCreateMode, data, organization, reset, setValue]);

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

  const getValidationRules = field => {
    if (field.required) {
      return {
        required: `${field.label} is required`
      }
    }
    return {}
  }

  const isAnyFieldEmpty = () => {
    return fields.some(field => {
      if (field.required) {
        const value = formValues[field.name]
        return value === '' || value === undefined || value === null
      }
      return false
    })
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='md'>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <form id='edit-form' onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={4} mt={0.5}>
            {isCreateMode ? (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Organization Name"
                    fullWidth
                    placeholder="TopNotch Ltd."
                    {...register('organizationName', getValidationRules({ label: 'Organization Name', required: true }))}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">🏢</InputAdornment>
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Organization Id"
                    fullWidth
                    placeholder="20000XCV"
                    value={watch('organizationId') || ''} 
                    InputProps={{
                      readOnly: true,
                      startAdornment: <InputAdornment position="start">🏢</InputAdornment>
                    }}
                  />
                </Grid>
              </>
            ) : (
              <>
                <Grid item xs={12} md={6}>
                  <InputLabel>Organization</InputLabel>
                  <TextField
                    select
                    fullWidth
                    value={watch('organizationId') || ''}
                    {...register('organizationId', { required: 'Organization is required' })}
                    onChange={e => setValue('organizationId', e.target.value)}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">🏢</InputAdornment>
                    }}
                  >
                    {(organization || []).map(org => (
                      <MenuItem key={org.organizationId} value={org.organizationId}>
                        {org.organizationName}
                      </MenuItem>
                    ))}
                  </TextField>
                  {errors.organizationId && <FormHelperText error>{errors.organizationId.message}</FormHelperText>}
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Organization Id"
                    fullWidth
                    sx={{ mt: 5.5 }}
                    value={watch('organizationId') || ''}
                    InputProps={{
                      readOnly: true,
                      startAdornment: <InputAdornment position="start">🏢</InputAdornment>
                    }}
                   onFocus={() => {
      setWarning({
        field: 'organizationId',
        message: 'Organization ID cannot be changed.'
      });
    }}
    error={warning.field === 'organizationId'}
    helperText={warning.field === 'organizationId' ? warning.message : ''}
                  />
                </Grid>
              </>
            )}

            {fields
              .filter(field => field.name !== 'organizationId')
              .map((field, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <TextField
                    fullWidth
                    label={field.label}
                    placeholder={field.placeholder}
                    {...register(field.name, getValidationRules(field))}
                    InputProps={{
                      startAdornment: field.icon ? <InputAdornment position="start">{field.icon}</InputAdornment> : null
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
            reset(); 
            onClose(); 
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
