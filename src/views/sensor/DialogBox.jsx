'use client'

import { useEffect, useState, useCallback } from 'react'

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
  FormHelperText,
  CircularProgress,
  Box
} from '@mui/material'
import { useForm } from 'react-hook-form'

import branchService from '@/@services/branchService'
import gatewayService from '@/@services/gatewayService'
import floorService from '@/@services/floorService'
import OrganizationService from '@services/organizationService'

const DialogBox = ({ open, title, onClose, data, onSave, fields, organization }) => {
  const [branches, setBranches] = useState([])
  const [gateways, setGateways] = useState([])
  const [floors, setFloors] = useState([])
  const [branchError, setBranchError] = useState('')
  const [gatewayError, setGatewayError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting, isValid }
  } = useForm({
    defaultValues: data || {},
    mode : 'onChange'
  })

  const formValues = watch()

  const getBranches = useCallback(async orgId => {
    setIsLoading(true)
    try {
      const response = await branchService.getBranchsByOrgId(0, 0, orgId)
      const branchData = response?.data?.data || []
      setBranches(branchData)

      if (branchData.length === 0) {
        setBranchError('No branches found for this organization.')
      } else {
        setBranchError('')
      }
    } catch (error) {
      setBranches([])
      setBranchError('Failed to load branches.')
      console.error('Error fetching branches:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getGatewaysByBranch = useCallback(async branchId => {
    setIsLoading(true)
    try {
      const response = await gatewayService.getGatewayByBranchId(0, 0, branchId) 
      const gatewayData = response?.data?.data || []
      setGateways(gatewayData)

      if (gatewayData.length === 0) {
        setGatewayError('No gateways found for this branch.')
      } else {
        setGatewayError('')
      }
    } catch (error) {
      setGateways([])
      setGatewayError('Failed to load gateways.')
      console.error('Error fetching gateways:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getFloors = useCallback(async () => {
    try {
      const response = await floorService.getFloor(0, 0)
      const floorData = response?.data?.data || []
      setFloors(floorData)
    } catch (error) {
      setFloors([])
      console.error('Error fetching floors:', error)
    }
  }, [])

  useEffect(() => {
    if (!open) return

    const initialize = async () => {
      setIsLoading(true)
      await getFloors()

      if (data) {
        reset(data)
        if (data.organizationId) await getBranches(data.organizationId)
        if (data.branchId) await getGatewaysByBranch(data.branchId)
      } else {
        reset({})
        setBranches([])
        setGateways([])
      }
      setIsLoading(false)
    }

    initialize()
  }, [open, data, reset, getBranches, getGatewaysByBranch, getFloors])

  const handleOrgChange = async event => {
    const orgId = event.target.value
    const selectedOrg = organization.find(org => org.organizationId === orgId)

    setValue('organizationId', orgId)
    setValue('organizationName', selectedOrg?.organizationName || '')

    if (orgId) {
      await getBranches(orgId)
    } else {
      setBranches([])
    }

    setValue('branchId', '')
    setValue('branchName', '')
    setGateways([])
    setValue('gatewayId', '')
    setValue('gatewayName', '')
  }

  const handleBranchChange = async event => {
    const branchId = event.target.value
    const selectedBranch = branches.find(branch => branch.branchId === branchId)

    setValue('branchId', branchId)
    setValue('branchName', selectedBranch?.branchName || '')

    if (branchId) {
      await getGatewaysByBranch(branchId)
    } else {
      setGateways([])
    }

    setValue('gatewayId', '')
    setValue('gatewayName', '')
  }

  const handleGatewayChange = event => {
    const gatewayId = event.target.value
    const selectedGateway = gateways.find(gw => gw.gatewayId === gatewayId)

    setValue('gatewayId', gatewayId)
    setValue('gatewayName', selectedGateway?.gatewayName || '')
  }

  const handleFloorChange = event => {
    const floorId = event.target.value
    const selectedFloor = floors.find(floor => floor.floorSectionId === floorId)

    setValue('floorSectionId', floorId)
    setValue('floorSectionName', selectedFloor?.floorSectionName || '')
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

  const handleClose = () => {
    reset({})
    onClose()
  }

  const getValidationRules = field => {
    if (field.required) {
      return { required: `${field.label} is required` }
    }
    return {}
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth='md'>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {isLoading && (
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
              alignItems: 'center',
              zIndex: 10
            }}
          >
            <CircularProgress />
          </Box>
        )}
        <form id='edit-form' onSubmit={handleSubmit(onSave)}>
          <Grid container spacing={4} mt={0.5}>
         
            {organization?.length > 0 && (
              <Grid item xs={12}>
                <InputLabel>Organization</InputLabel>
                <Select
                  label='Organization'
                  value={formValues.organizationId || ''}
                  fullWidth
                  {...register('organizationId', { required: 'Organization is required' })}
                  onChange={handleOrgChange}
                >
                  <MenuItem value=''>Select Organization</MenuItem>
                  {organization.map(org => (
                    <MenuItem key={org.organizationId} value={org.organizationId}>
                      {org.organizationName}
                    </MenuItem>
                  ))}
                </Select>
                {errors.organizationId && <FormHelperText error>{errors.organizationId.message}</FormHelperText>}
              </Grid>
            )}

          
            <Grid item xs={12}>
              <InputLabel>Branch</InputLabel>
              <Select
                label='Branch'
                value={formValues.branchId || ''}
                fullWidth
                {...register('branchId', { required: 'Branch is required' })}
                onChange={handleBranchChange}
                disabled={!formValues.organizationId}
              >
                <MenuItem value=''>Select Branch</MenuItem>
                {branches.length > 0 ? (
                  branches.map(branch => (
                    <MenuItem key={branch.branchId} value={branch.branchId}>
                      {branch.branchName}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No branches available</MenuItem>
                )}
              </Select>
              {branchError && <FormHelperText error>{branchError}</FormHelperText>}
            </Grid>

           
            <Grid item xs={12}>
              <InputLabel>Gateway</InputLabel>
              <Select
                label='Gateway'
                value={formValues.gatewayId || ''}
                fullWidth
                {...register('gatewayId', { required: 'Gateway is required' })}
                onChange={handleGatewayChange}
                disabled={!formValues.branchId}
              >
                <MenuItem value=''>Select Gateway</MenuItem>
                {gateways.length > 0 ? (
                  gateways.map(gateway => (
                    <MenuItem key={gateway.gatewayId} value={gateway.gatewayId}>
                      {gateway.gatewayName}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No gateways available</MenuItem>
                )}
              </Select>
              {gatewayError && <FormHelperText error>{gatewayError}</FormHelperText>}
            </Grid>

          
            {floors.length > 0 && (
              <Grid item xs={12}>
                <InputLabel>Floor</InputLabel>
                <Select
                  label='Floor'
                  value={formValues.floorSectionId || ''}
                  fullWidth
                  {...register('floorSectionId')}
                  onChange={handleFloorChange}
                >
                  <MenuItem value=''>Select Floor</MenuItem>
                  {floors.map(floor => (
                    <MenuItem key={floor.floorSectionId} value={floor.floorSectionId}>
                      {floor.floorSectionName}
                    </MenuItem>
                  ))}
                </Select>
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
        <Button onClick={handleClose} color='secondary' variant='outlined'>
          Cancel
        </Button>
        <Button
          type='submit'
          form='edit-form'
          variant='contained'
          disabled={isAnyFieldEmpty() || isSubmitting || !isValid}
        >
          {isSubmitting ? <CircularProgress size={24} color='inherit' /> : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DialogBox
