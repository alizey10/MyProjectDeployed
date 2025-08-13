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
  FormHelperText,
  Box
} from '@mui/material'
import { useForm, Controller } from 'react-hook-form'

import branchService from '@/@services/branchService'

const DialogBox = ({ open, title, onClose, data, onSave, fields, organization }) => {
  const [branches, setBranches] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [branchError, setBranchError] = useState('')

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isValid }
  } = useForm({
    defaultValues: data || {},
    mode: 'onChange'
  })

  const formValues = watch()

  useEffect(() => {
    const fetchInitialData = async () => {
      if (open) {
        let orgId = data?.organizationId || organization?.[0]?.organizationId

        if (data) {
          reset(data)
        } else {
          reset({ organizationId: orgId })
        }

        if (orgId) {
          await getBranches(orgId)
        }
      }
    }

    fetchInitialData()
  }, [open])

  const onSubmit = async updatedData => {
    setIsSubmitting(true)
    try {
      await onSave(updatedData)
      reset('')
    } catch (error) {
      console.error('Error saving data', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getBranches = async orgId => {
    if (!orgId) return

    setIsLoading(true)
    setBranchError('')

    try {
      const _branches = await branchService.getBranchsByOrgId(0, 0, orgId)
      setBranches(_branches.data.data)

      if (_branches.data.data.length === 0) {
        setBranchError('No branches found for this organization.')
      } else {
        setBranchError('')
      }
    } catch (error) {
      setBranchError('Error fetching branches. Please try again.')
      console.error(error)
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
    return Object.values(formValues).some(value => value === '' || value === undefined || value === null)
  }

  const formKey = data ? 'edit-mode' : 'add-mode'

  const handleClose = () => {
    reset({})
    onClose()
  }

  return (
    <Dialog onClose={handleClose} open={open} fullWidth maxWidth="md" key={formKey}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent sx={{ position: 'relative' }}>
        {(isLoading || isSubmitting) && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <CircularProgress />
          </Box>
        )}

        <form id="edit-form" onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={4} mt={0.5}>
            {/* Organization Dropdown */}
            {organization?.length > 0 && (
              <>
                <Grid item xs={12} md={6} >
                  <InputLabel>Organization</InputLabel>
                  <Controller
                    name="organizationId"
                    control={control}
                    rules={{ required: 'Organization is required' }}
                    render={({ field }) => (
                      <Select
                        {...field}
                        fullWidth
                        value={field.value || ''}
                        error={!!errors.organizationId}
                        onChange={async e => {
                          const orgId = e.target.value
                          field.onChange(orgId)

                          const selectedOrg = organization.find(org => org.organizationId === orgId)
                          if (selectedOrg) {
                            setValue('organizationName', selectedOrg.organizationName)
                            setValue('organizationId', selectedOrg.organizationId)
                          }

                          await getBranches(orgId)
                          setValue('branchId', '')
                        }}
                      >
                        <MenuItem value=''>Select Organization</MenuItem>
                        {organization.map(org => (
                          <MenuItem key={org.organizationId} value={org.organizationId}>
                            {org.organizationName}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                  {errors.organizationId && (
                    <FormHelperText error>{errors.organizationId.message}</FormHelperText>
                  )}
                </Grid>

                {/* Organization ID */}
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Organization ID"
                    value={watch('organizationId') || ''}
                    fullWidth
                     sx={{ mt: 5.5}} 
                    InputProps={{
                      readOnly: true,
                      
                    }}
                  />
                </Grid>
              </>
            )}

            {/* Branch Dropdown */}
            <Grid item xs={12} md={6}>
              <InputLabel>Branches</InputLabel>
              <Controller
                name="branchId"
                control={control}
                rules={{ required: 'Branch is required' }}
                render={({ field }) => (
                  <Select
                    {...field}
                    fullWidth
                    value={field.value || ''}
                    error={!!errors.branchId}
                    onChange={e => {
                      field.onChange(e.target.value)
                      setValue('branchId', e.target.value)
                    }}
                  >
                    {branches?.length > 0 ? (
                      branches.map(branch => (
                        <MenuItem key={branch.branchId} value={branch.branchId}>
                          {branch.branchName}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled value="">
                        No branches available
                      </MenuItem>
                    )}
                  </Select>
                )}
              />
              {branchError && !isLoading && (
                <FormHelperText error sx={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
                  {branchError}
                </FormHelperText>
              )}
              {errors.branchId && <FormHelperText error>{errors.branchId.message}</FormHelperText>}
            </Grid>

            {/* Branch ID */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Branch ID"
                value={watch('branchId') || ''}
                fullWidth
                 sx={{ mt: 5.3}} 
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>

            {/* Dynamic Fields */}
            {fields.map((field, index) => (
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
        <Button onClick={handleClose} color="secondary" variant="outlined">
          Cancel
        </Button>
        <Button
          type="submit"
          form="edit-form"
          variant="contained"
          disabled={isAnyFieldEmpty() || isSubmitting || !isValid || branchError}
        >
          {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DialogBox
