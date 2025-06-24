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

const DialogBox = ({ open, title, onClose, data, onSave, fields, organization }) => {
  const [branches, setBranches] = useState([]) // Stores the fetched branches
  const [gateways, setGateways] = useState([]) // Stores the fetched gateways
  const [floors, setFloors] = useState([]) // Stores the fetched floors
  const [branchError, setBranchError] = useState('') // Error message when no branches found
  const [gatewayError, setGatewayError] = useState('') // Error message when no gateways found
  const [isLoading, setIsLoading] = useState(false) // Loader state for fetching data

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting, isValid },
    watch
  } = useForm({
    defaultValues: data || {}
  })

  const formValues = watch()

  // Memoize all data-fetching functions
  const getBranches = useCallback(async orgId => {
    setIsLoading(true)
    const _branches = await branchService.getBranchsByOrgId(0, 0, orgId)

    setBranches(_branches.data)

    // If no branches exist, set error
    if (_branches.data.length === 0) {
      setBranchError('No branches found for this organization.')
    } else {
      setBranchError('')
    }

    setIsLoading(false)
  }, [])

  const getGatewaysByBranch = useCallback(async branchId => {
    setIsLoading(true)

    const _gateways = await gatewayService.getGatewayByBranchId(0, 0, branchId)

    setGateways(_gateways.data)

    // If no gateways exist, set error
    if (_gateways.data.length === 0) {
      setGatewayError('No gateways found for this branch.')
    } else {
      setGatewayError('')
    }

    setIsLoading(false)
  }, [])

  const getFloors = useCallback(async () => {
    const _floors = await floorService.getFloor(0, 0)

    setFloors(_floors.data)
  }, [])

  // Initialize form and fetch data
  useEffect(() => {
    if (!open) return

    const initialize = async () => {
      await getFloors()

      if (data) {
        setIsLoading(true)
        reset(data)
        await getBranches(data.organizationId)
        await getGatewaysByBranch(data.branchId)
        setIsLoading(false)
      } else {
        reset({})
        setBranches([])
        setGateways([])
      }
    }

    initialize()
  }, [open, data, reset, getBranches, getGatewaysByBranch, getFloors])

  const onSubmit = updatedData => {
    onSave(updatedData)
    handleClose()
  }

  // Handle organization change
  const handleOrgChange = event => {
    const orgId = event.target.value
    const selectedOrg = organization.find(org => org.organizationId === orgId)

    if (selectedOrg) {
      setValue('organizationName', selectedOrg.organizationName)
      getBranches(orgId)
    }

    // Clear dependent fields
    setValue('branchId', '')
    setValue('gatewayId', '')
    setGateways([])
  }

  // Handle branch change
  const handleBranchChange = event => {
    const branchId = event.target.value
    const selectedBranch = branches.find(branch => branch.branchId === branchId)

    if (selectedBranch) {
      setValue('branchName', selectedBranch.branchName)
      getGatewaysByBranch(branchId)
    }

    // Clear dependent field
    setValue('gatewayId', '')
  }

  // Handle gateway change
  const handleGatewayChange = event => {
    const gatewayId = event.target.value
    const selectedGateway = gateways.find(gw => gw.gatewayId === gatewayId)

    if (selectedGateway) {
      setValue('gatewayName', selectedGateway.gatewayName)
    }
  }

  // Handle floor change
  const handleFloorChange = event => {
    const floorId = event.target.value
    const selectedFloor = floors.find(floor => floor.floorSectionId === floorId)

    if (selectedFloor) {
      setValue('floorSectionName', selectedFloor.floorSectionName)
    }
  }

  // Check if any field is empty or invalid
  const isAnyFieldEmpty = () => {
    return Object.values(formValues).some(value => value === '' || value === undefined || value === null)
  }

  const handleClose = (event, reason) => {
    reset({})
    onClose()
  }

  const getValidationRules = field => {
    if (field.required) {
      return {
        required: `${field.label} is required`
      }
    }

    return {}
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth='md'>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {/* Loader for the entire dialog */}
        {isLoading ? (
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
            {/* Organization Dropdown */}
            {organization?.length > 0 && (
              <Grid item xs={12}>
                <InputLabel>Organization</InputLabel>
                <Select
                  label='Organization'
                  defaultValue={data?.organizationId || ''}
                  fullWidth
                  {...register('organizationId', { required: 'Organization is required' })}
                  onChange={handleOrgChange}
                >
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
              <InputLabel>Branches</InputLabel>
              <Select
                label='Branches'
                defaultValue={data?.branchId || ''}
                fullWidth
                {...register('branchId', { required: 'Branch is required' })}
                onChange={handleBranchChange}
              >
                {branches.length > 0 ? (
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
              {branchError && <FormHelperText error>{branchError}</FormHelperText>}
            </Grid>

            {/* Gateway Dropdown */}

            <Grid item xs={12}>
              <InputLabel>Gateway</InputLabel>
              <Select
                label='Gateway'
                defaultValue={data?.gatewayId || ''}
                fullWidth
                {...register('gatewayId', { required: 'Gateway is required' })}
                onChange={handleGatewayChange}
              >
                {gateways.length > 0 ? (
                  gateways.map(gateway => (
                    <MenuItem key={gateway.gatewayId} value={gateway.gatewayId}>
                      {gateway.gatewayName}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled value=''>
                    No Gateway available
                  </MenuItem>
                )}
              </Select>
              {gatewayError && <FormHelperText error>{gatewayError}</FormHelperText>}
            </Grid>

            {/* Independent Floor Dropdown */}
            {floors.length > 0 && (
              <Grid item xs={12}>
                <InputLabel>Floor</InputLabel>
                <Select
                  label='Floor'
                  defaultValue={data?.floorSectionId || ''}
                  fullWidth
                  {...register('floorSectionId')}
                  onChange={handleFloorChange}
                >
                  {floors.map(floor => (
                    <MenuItem key={floor.floorSectionId} value={floor.floorSectionId}>
                      {floor.floorSectionName}
                    </MenuItem>
                  ))}
                </Select>
                {errors.floorSectionId && <FormHelperText error>{errors.floorSectionId.message}</FormHelperText>}
              </Grid>
            )}

            {/* Other fields */}
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
