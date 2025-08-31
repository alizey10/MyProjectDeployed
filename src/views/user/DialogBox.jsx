'use client'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import {
  TextField,
  InputAdornment,
  Button,
  Grid,
  InputLabel,
  DialogActions,
  DialogContent,
  DialogTitle,
  Dialog,
  Select,
  MenuItem,
  CircularProgress,
  FormHelperText,
  Box,
  IconButton,
  Chip,
  Checkbox,
  ListItemText
} from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import branchService from '@/@services/branchService'

const DialogBox = ({ open, title, onClose, data, onSave, fields, organization, branches: propBranches }) => {
  const [branches, setBranches] = useState(propBranches || [])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [branchError, setBranchError] = useState('')
  const [isPasswordShown, setIsPasswordShown] = useState(false)

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

  const uniqueOrganizations = organization.filter(
    (org, i, arr) => arr.findIndex(o => o.organizationId === org.organizationId) === i
  )

  useEffect(() => {
    if (!open) return
    const orgId = data?.organizationId
    const validOrg = uniqueOrganizations.find(org => org.organizationId === orgId)

    reset({
      id: data?.id || null,
      fullName: data?.fullName || '',
      email: data?.email || '',
      password: '',
      role: data?.role !== undefined ? Number(data.role) : 0,
      organizationId: validOrg?.organizationId || '',
      branchIds: data?.branchIds || []
    })

    if (validOrg) getBranches(validOrg.organizationId)
  }, [open, data])

  useEffect(() => {
    if (branches.length && data?.branchIds?.length) {
      const validBranchIds = data.branchIds.filter(id => branches.some(b => b.branchId.toString() === id.toString()))
      setValue('branchIds', validBranchIds)
    }
  }, [branches, data?.branchIds, setValue])

  const getBranches = async orgId => {
    if (!orgId) return
    setIsLoading(true)
    setBranchError('')
    try {
      const _branches = await branchService.getBranchsByOrgId(0, 0, orgId)
      const uniqueBranches = (_branches.data.data || []).filter(
        (b, i, arr) => arr.findIndex(x => x.branchId === b.branchId) === i
      )
      setBranches(uniqueBranches)
      if (!uniqueBranches.length) setBranchError('No branches found.')
    } catch (err) {
      setBranchError('Error fetching branches.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (propBranches?.length) {
      setBranches(prev => {
        const merged = [...prev, ...propBranches]
        return merged.filter((b, i, arr) => arr.findIndex(x => x.branchId === b.branchId) === i)
      })
    }
  }, [propBranches])

  const onSubmit = async formData => {
    setIsSubmitting(true)
    try {
      let selectedOrg
      if (Number(formData.role) === 0) {
        selectedOrg = uniqueOrganizations.find(org => org.organizationId === formData.organizationId)
        if (!selectedOrg) {
          toast.error('Organization is required for Users')
          setIsSubmitting(false)
          return
        }
      }

      if (!formData.password && Number(formData.role) === 0) {
        toast.error('Password is required')
        setIsSubmitting(false)
        return
      }

      const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{6,12}$/
      if (formData.password && !passwordRegex.test(formData.password)) {
        toast.error('Password must be 6-12 chars, include 1 uppercase, 1 number & 1 special char.')
        setIsSubmitting(false)
        return
      }

      const validBranchIds = (formData.branchIds || []).filter(id =>
        branches.some(b => b.branchId.toString() === id.toString())
      )

      const backendRole = Number(formData.role) === 1 ? 1 : 2

      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: backendRole,
        organizationId: selectedOrg?.organizationId || formData.organizationId,
        branchIds: validBranchIds.map(id => id.toString())
      }

      if (onSave) await onSave(payload)
      reset()
    } catch (error) {
      console.error('Backend Error:', error.response?.data || error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isAnyFieldEmpty = () => {
    const empty = fields.some(f => {
      const value = formValues[f.name]
      if (Number(formValues.role) === 1 && (f.name === 'organizationId' || f.name === 'branchIds')) {
        return false
      }
      if (f.required) return !value
      return false
    })
    return empty || (Number(formValues.role) === 0 && !!branchError)
  }

  return (
    <Dialog
      onClose={() => {
        reset()
        onClose()
      }}
      open={open}
      fullWidth
      maxWidth='md'
    >
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
              backgroundColor: 'rgba(255,255,255,0.7)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 10
            }}
          >
            <CircularProgress />
          </Box>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {fields.map((f, idx) => (
              <Grid item xs={12} md={6} key={idx}>
                {f.name === 'password' ? (
                  <TextField
                    fullWidth
                    label='Password'
                    type={isPasswordShown ? 'text' : 'password'}
                    {...register('password', { required: f.required })}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton size='small' onClick={() => setIsPasswordShown(prev => !prev)}>
                            <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                  />
                ) : f.type === 'select' && f.options ? (
                  <Controller
                    name={f.name}
                    control={control}
                    defaultValue={data?.[f.name] ?? 0}
                    render={({ field }) => (
                      <TextField
                        select
                        fullWidth
                        label={f.label}
                        {...field}
                        value={field.value ?? 0}
                        onChange={e => field.onChange(Number(e.target.value))}
                      >
                        {f.options.map(opt => (
                          <MenuItem key={`opt-${opt.value}`} value={opt.value}>
                            {opt.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                ) : (
                  <TextField fullWidth label={f.label} {...register(f.name, { required: f.required })} />
                )}
              </Grid>
            ))}

            {Number(formValues.role) === 0 && (
              <>
                <Grid item xs={12} md={6}>
                  <InputLabel>Organization</InputLabel>
                  <Controller
                    name='organizationId'
                    control={control}
                    rules={Number(formValues.role) === 0 ? { required: 'Organization is required for Users' } : {}}
                    render={({ field }) => (
                      <Select
                        {...field}
                        fullWidth
                        value={field.value || ''}
                        onChange={async e => {
                          const orgId = e.target.value
                          const validOrg = uniqueOrganizations.find(org => org.organizationId === orgId)
                          if (!validOrg) return
                          field.onChange(orgId)
                          await getBranches(orgId)
                          setValue('branchIds', [])
                        }}
                      >
                        <MenuItem value=''>Select Organization</MenuItem>
                        {uniqueOrganizations.map(org => (
                          <MenuItem key={`org-${org.organizationId}`} value={org.organizationId}>
                            {org.organizationName}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                  {errors.organizationId && <FormHelperText error>{errors.organizationId.message}</FormHelperText>}
                </Grid>

                <Grid item xs={12} md={6}>
                  <InputLabel>Branches</InputLabel>
                  <Controller
                    name='branchIds'
                    control={control}
                    defaultValue={[]}
                    render={({ field }) => {
                      const selectedValues = Array.isArray(field.value) ? field.value.map(v => v.toString()) : []
                      const allBranchIds = branches.map(b => b.branchId.toString())
                      const allSelected = selectedValues.length === branches.length && branches.length > 0

                      const handleSelectAllToggle = e => {
                        e.stopPropagation()
                        field.onChange(allSelected ? [] : allBranchIds)
                      }

                      const handleIndividualSelect = branchId => {
                        const idStr = branchId.toString()
                        if (selectedValues.includes(idStr)) {
                          field.onChange(selectedValues.filter(id => id !== idStr))
                        } else {
                          field.onChange([...selectedValues, idStr])
                        }
                      }

                      return (
                        <Select
                          multiple
                          fullWidth
                          value={selectedValues}
                          renderValue={selected => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {selected.map(id => {
                                const branch = branches.find(b => b.branchId.toString() === id)
                                return branch ? (
                                  <Chip
                                    key={`chip-${id}`}
                                    label={branch.branchName}
                                    size='small'
                                    color='primary'
                                    variant='outlined'
                                    onDelete={() => handleIndividualSelect(id)}
                                  />
                                ) : null
                              })}
                            </Box>
                          )}
                        >
                          {branches.length > 0 && (
                            <MenuItem onClick={handleSelectAllToggle} sx={{ fontStyle: 'italic', fontWeight: 'bold' }}>
                              <Checkbox checked={allSelected} />
                              <ListItemText primary={allSelected ? 'Unselect All' : 'Select All'} />
                            </MenuItem>
                          )}

                          {branches.map(branch => {
                            const isSelected = selectedValues.includes(branch.branchId.toString())
                            return (
                              <MenuItem
                                key={`branch-${branch.branchId}`}
                                value={branch.branchId.toString()}
                                onClick={e => {
                                  e.stopPropagation()
                                  handleIndividualSelect(branch.branchId)
                                }}
                              >
                                <Checkbox checked={isSelected} />
                                <ListItemText primary={branch.branchName} />
                              </MenuItem>
                            )
                          })}
                        </Select>
                      )
                    }}
                  />

                  {branchError && <FormHelperText error>{branchError}</FormHelperText>}
                </Grid>
              </>
            )}
          </Grid>

          <Box sx={{ mt: 3 }}>
            <Button type='submit' variant='contained' disabled={!isValid || isSubmitting}>
              {isSubmitting ? <CircularProgress size={20} color='inherit' /> : 'Save'}
            </Button>
          </Box>
        </form>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={() => {
            reset()
            onClose()
          }}
          color='secondary'
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DialogBox
