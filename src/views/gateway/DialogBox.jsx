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
import { useForm } from 'react-hook-form'

import branchService from '@/@services/branchService'

const DialogBox = ({ open, title, onClose, data, onSave, fields, organization }) => {
  const [branches, SetBranches] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [branchError, setBranchError] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
    watch
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
          reset(data || {})
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
    setIsSubmitting(true) // Show loader on form submission

    try {
      await onSave(updatedData)
      reset('')
    } catch (error) {
      console.error('Error saving data', error)
    } finally {
      setIsSubmitting(false) // Hide loader after save
    }
  }

  const getBranches = async orgId => {
    if (!orgId) return

    setIsLoading(true)
    setBranchError('')

    try {
      const _branches = await branchService.getBranchsByOrgId(0, 0, orgId)

      SetBranches(_branches.data.data)

      if (_branches.data.data.length === 0) {
        setBranchError('No branches found for this organization.')
      }
    } catch (error) {
      setBranchError('Error fetching branches. Please try again.')
      console.error(error)
    } finally {
      setIsLoading(false) // Hide loader after branches are fetched
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
    return Object.values(formValues).some(value => value === '' || value === undefined || value === null)
  }

  const formKey = data ? 'edit-mode' : 'add-mode'

  const handleClose = (event, reason) => {
    reset({})
    onClose()
  }

  return (
    <Dialog onClose={handleClose} open={open} fullWidth maxWidth='md' key={formKey}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent sx={{ position: 'relative' }}>
        {/* Loader for the entire dialog */}
        {isLoading || isSubmitting ? (
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
        ) : null}

        <form id='edit-form' onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={4} mt={0.5}>
            {organization?.length > 0 && (
              <Grid item xs={12}>
                <InputLabel>Organization</InputLabel>
                <Select
                  label='Organization'
                  defaultValue={data?.organizationId || organization[0]?.organizationId}
                  fullWidth
                  {...register('organizationId', { required: 'Organization is required' })}
                  onChange={async event => {
                    const orgId = event.target.value
                    await getBranches(orgId)
                  }}
                >
                  {organization.map(org => (
                    <MenuItem key={org.organizationId} value={org.organizationId}>
                      {org.organizationName}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
            )}

            <Grid item xs={12}>
              <InputLabel>Branches</InputLabel>
              <Select
                label='Branches'
                defaultValue={data?.branchId}
                fullWidth
                {...register('branchId', { required: 'Branch is required' })}
              >
                {branches?.length > 0 ? (
                  branches.map(branch => (
                    <MenuItem key={branch.branchId} value={branch.branchId}>
                      {branch.branchName}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled value=''>
                    No branches available
                  </MenuItem>
                )}
              </Select>
              {branchError && !isLoading && (
                <FormHelperText error sx={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
                  {branchError}
                </FormHelperText>
              )}
            </Grid>

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
            reset({})
            onClose()
          }}
          color='secondary'
          variant='outlined'
        >
          Cancel
        </Button>
        <Button
          type='submit'
          form='edit-form'
          variant='contained'
          disabled={isAnyFieldEmpty() || isSubmitting || !isValid || branchError} // Disable if any field is empty or form is submitting
        >
          {isSubmitting ? <CircularProgress size={24} color='inherit' /> : 'Save'}{' '}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DialogBox
