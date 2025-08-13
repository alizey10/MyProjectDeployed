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

import BranchService from '@/@services/branchService'
import GatewayService from '@/@services/gatewayService'
import { toast } from 'react-toastify'

const SensorDialog = ({ open, title, onClose, data, onSave, fields, organization }) => {
  const [branches, setBranches] = useState([])
  const [gateways, setGateways] = useState([])
  const [selectedGatewayName, setSelectedGatewayName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [branchError, setBranchError] = useState('')
  const [gatewayError, setGatewayError] = useState('')
    const [warning, setWarning] = useState({ field: '', message: '' })

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isValid }
  } = useForm({
    defaultValues: {},
    mode: 'onChange'
  })

  const formValues = watch()

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!open) return

      reset(data || { organizationId: organization?.[0]?.organizationId })

      const orgId = data?.organizationId || organization?.[0]?.organizationId
      if (!orgId) return
      setValue('organizationId', orgId)

      // Fetch branches for organization
      const branchList = await getBranches(orgId)

      const branchId = data?.branchId
      if (branchId) {
        setValue('branchId', branchId)

        // Fetch gateways for this branch
        const gatewayList = await getGateways(branchId)

        const gatewayId = data?.gatewayId
        if (gatewayId) {
          setValue('gatewayId', gatewayId)
          await fetchGatewayById(gatewayId)
        }
      }
    }

    fetchInitialData()
  }, [open])

  const getBranches = async orgId => {
    if (!orgId) return []
    setIsLoading(true)
    setBranchError('')
    try {
      const res = await BranchService.getBranchsByOrgId(0, 0, orgId)
      const brs = res.data.data || []
      setBranches(brs)
      if (!brs.length) setBranchError('No branches found for this organization.')
      return brs
    } catch (err) {
      console.error(err)
      setBranchError('Error fetching branches. Please try again.')
      return []
    } finally {
      setIsLoading(false)
    }
  }

 const getGateways = async branchId => {
  if (!branchId) return []
  setIsLoading(true)
  setGatewayError('')
  try {
    const res = await GatewayService.getGatewaysByBranch(branchId)
    const gws = res?.data?.data || []
    setGateways(gws)
    if (!gws.length) setGatewayError('No gateways found for this branch.')
    return gws
  } catch (err) {
    console.error(err)
    setGatewayError('Error fetching gateways. Please try again.')
    return []
  } finally {
    setIsLoading(false)
  }
}


  // Fetch gateway by ID to get the name
  // Gateway fetch function
const fetchGatewayById = async gatewayId => {
  if (!gatewayId) return
  setGatewayError('')
  setIsLoading(true)
  try {
    const res = await GatewayService.getGatewayById(gatewayId)
    if (res?.data?.data?.gatewayName) {
      setSelectedGatewayName(res.data.data.gatewayName)
    } else {
      setGatewayError('Gateway not found')
    }
  } catch (err) {
    console.error(err)
    setGatewayError('Error fetching gateway')
  } finally {
    setIsLoading(false)
  }
}


  const onSubmit = async updatedData => {
    setIsSubmitting(true)
    try {
      await onSave(updatedData)
      reset({})
      setSelectedGatewayName('')
    } catch (err) {
      console.error('Error saving sensor data', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getValidationRules = field => (field.required ? { required: `${field.label} is required` } : {})
  const isAnyFieldEmpty = () => Object.values(formValues).some(v => v === '' || v === undefined || v === null)
  const handleClose = () => { reset({}); setSelectedGatewayName(''); onClose() }
  const formKey = data ? 'edit-mode' : 'add-mode'

  return (
    <Dialog onClose={handleClose} open={open} fullWidth maxWidth="md" key={formKey}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent sx={{ position: 'relative' }}>
        {(isLoading || isSubmitting) && (
          <Box sx={{ position: 'absolute', top:0, left:0, width:'100%', height:'100%', backgroundColor:'rgba(255,255,255,0.7)', display:'flex', justifyContent:'center', alignItems:'center' }}>
            <CircularProgress />
          </Box>
        )}
        <form id="sensor-form" onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={4} mt={0.5}>

            {/* Organization */}
            {organization?.length > 0 && (
              <>
                <Grid item xs={12} md={6}>
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
                        onChange={async e => {
                          const orgId = e.target.value
                          field.onChange(orgId)
                          const selectedOrg = organization.find(org => org.organizationId === orgId)
                          if (selectedOrg) setValue('organizationName', selectedOrg.organizationName)
                          const branchList = await getBranches(orgId)
                          setValue('branchId', '')
                          setValue('gatewayId', '')
                          setSelectedGatewayName('')
                        }}
                      >
                        <MenuItem value=''>Select Organization</MenuItem>
                        {organization.map(org => <MenuItem key={org.organizationId} value={org.organizationId}>{org.organizationName}</MenuItem>)}
                      </Select>
                    )}
                  />
                  {errors.organizationId && <FormHelperText error>{errors.organizationId.message}</FormHelperText>}
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Organization ID"
                    value={watch('organizationId') || ''}
                    fullWidth
                    sx={{ mt: 5.5 }}
                     onClick={() =>
                      setWarning({ field: 'organizationId', message: 'Organization ID is auto-filled' })
                    }
                    InputProps={{ readOnly: true }}
                  />
                   {errors.organizationId && (
                                      <FormHelperText error>{errors.organizationId.message}</FormHelperText>
                                    )}
                          {warning.field === 'organizationId' && (
                                        <FormHelperText error>{warning.message}</FormHelperText>
                                      )}
                </Grid>
              </>
            )}

            {/* Branch */}
            <Grid item xs={12} md={6}>
              <InputLabel>Branch</InputLabel>
              <Controller
                name="branchId"
                control={control}
                rules={{ required: 'Branch is required' }}
                render={({ field }) => (
                  <Select
                    {...field}
                    fullWidth
                    value={field.value || ''}
                    onChange={async e => {
                      const branchId = e.target.value
                      field.onChange(branchId)
                      setValue('gatewayId', '')
                      setSelectedGatewayName('')
                      const branch = branches.find(b => b.branchId === branchId)
                      if (branch) setValue('branchName', branch.branchName)
                      await getGateways(branchId)
                    }}
                  >
                    {branches.length > 0 ? branches.map(b => <MenuItem key={b.branchId} value={b.branchId}>{b.branchName}</MenuItem>) : <MenuItem disabled value="">No branches available</MenuItem>}
                  </Select>
                )}
              />
              {branchError && <FormHelperText error>{branchError}</FormHelperText>}
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label="Branch ID" value={watch('branchId') || ''} fullWidth sx={{ mt: 5.3 }} 
               onClick={() =>
                      setWarning({  field: 'branchId', message: 'Branch ID is auto-filled'})
                    }InputProps={{ readOnly: true }} />

                     {warning.field === 'branchId' && (
                                    <FormHelperText error>{warning.message}</FormHelperText>
                                  )}
                    
            </Grid>

            {/* Gateway */}
            <Grid item xs={12} md={6}>
              <InputLabel>Gateway</InputLabel>
              <Controller
                name="gatewayId"
                control={control}
                rules={{ required: 'Gateway is required' }}
                render={({ field }) => (
                  <Select
                    {...field}
                    fullWidth
                    value={field.value || ''}
                    onChange={async e => {
                      const gatewayId = e.target.value
                      field.onChange(gatewayId)
                      setValue('gatewayId', gatewayId)
                      await fetchGatewayById(gatewayId)
                    }}
                  >
                    <MenuItem value=''>Select Gateway</MenuItem>
                    {gateways.length > 0 ? gateways.map(g => <MenuItem key={g.gatewayId} value={g.gatewayId}>{g.gatewayName}</MenuItem>) : <MenuItem disabled value="">No gateways available</MenuItem>}
                  </Select>
                )}
              />
              {gatewayError && <FormHelperText error>{gatewayError}</FormHelperText>}
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Gateway Name"
                value={selectedGatewayName || ''}
                fullWidth
                sx={{ mt: 5.3 }}
                 onClick={() =>
                      setWarning({ field: 'gatewayId', message: 'Gateway ID is auto-filled' })
                    }
                InputProps={{ readOnly: true }}
              />
             {warning.field === 'gatewayId' && (
                            <FormHelperText error>{warning.message}</FormHelperText>
                          )}  
            </Grid>

            {/* Dynamic fields */}
            {fields?.map((field, i) => (
              <Grid item xs={12} md={6} key={i}>
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
        <Button onClick={handleClose} color="secondary" variant="outlined">Cancel</Button>
        <Button
          type="submit"
          form="sensor-form"
          variant="contained"
          disabled={isAnyFieldEmpty() || isSubmitting || !isValid || branchError || gatewayError}
        >
          {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default SensorDialog
