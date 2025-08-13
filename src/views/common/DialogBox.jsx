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
  const [warning, setWarning] = useState({ field: '', message: '' })

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
      
      {/* Organization dropdown + read-only ID */}
      {organization?.length > 0 && (
        <>
          <Grid item xs={12} md={6}>
            <InputLabel>Organization</InputLabel>
            <Select
              label="Organization"
              value={watch("organizationId") || ""}
              fullWidth
              {...register("organizationId", { required: "Organization is required" })}
              onChange={e => setValue("organizationId", e.target.value)}
            >
              {organization.map(org => (
                <MenuItem key={org.organizationId} value={org.organizationId}>
                  {org.organizationName}
                </MenuItem>
              ))}
            </Select>
            {errors.organizationId && (
              <FormHelperText error>{errors.organizationId.message}</FormHelperText>
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Organization Id"
              fullWidth
               sx={{ mt: 5.5 }}
              value={watch("organizationId") || ""}
              InputProps={{ readOnly: true }}
            />
          </Grid>
        </>
      )}

      {/* Baaki dynamic fields */}
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
