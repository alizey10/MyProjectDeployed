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
  MenuItem
} from '@mui/material'
import { useForm } from 'react-hook-form'

import branchService from '@/@services/branchService'
import gatewayService from '@/@services/gatewayService'
import floorService from '@/@services/floorService'

const DialogBox = ({ open, title, onClose, data, onSave, fields, organization }) => {
  const [branches, setBranches] = useState([])
  const [gateways, setGateways] = useState([])
  const [floors, setFloors] = useState([])

  const { register, handleSubmit, reset, setValue } = useForm({
    defaultValues: data || {}
  })

  // Memoize all data-fetching functions
  const getBranches = useCallback(async orgId => {
    const _branches = await branchService.getBranchsByOrgId(0, 0, orgId)

    setBranches(_branches.data)
  }, [])

  const getGatewaysByBranch = useCallback(async branchId => {
    const _gateways = await gatewayService.getGatewayByBranchId(0, 0, branchId)

    setGateways(_gateways.data)
  }, [])

  const getFloors = useCallback(async () => {
    const _floors = await floorService.getFloor(0, 0)

    setFloors(_floors.data)
  }, [])

  // Initialize form and fetch data
  useEffect(() => {
    if (!open) return

    // Reset form and fetch initial data
    const initialize = async () => {
      await getFloors()

      if (data) {
        reset(data)
        await getBranches(data.organizationId)
        await getGatewaysByBranch(data.branchId)
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
    onClose()
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

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='md'>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <form id='edit-form' onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={4} mt={0.5}>
            {organization?.length > 0 && (
              <Grid item xs={12}>
                <InputLabel>Organization</InputLabel>
                <Select
                  label='Organization'
                  defaultValue={data?.organizationId || ''}
                  fullWidth
                  {...register('organizationId')}
                  onChange={handleOrgChange}
                >
                  {organization.map(org => (
                    <MenuItem key={org.organizationId} value={org.organizationId}>
                      {org.organizationName}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
            )}

            {branches.length > 0 && (
              <Grid item xs={12}>
                <InputLabel>Branches</InputLabel>
                <Select
                  label='Branches'
                  defaultValue={data?.branchId || ''}
                  fullWidth
                  {...register('branchId')}
                  onChange={handleBranchChange}
                >
                  {branches.map(branch => (
                    <MenuItem key={branch.branchId} value={branch.branchId}>
                      {branch.branchName}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
            )}

            {gateways.length > 0 && (
              <Grid item xs={12}>
                <InputLabel>Gateway</InputLabel>
                <Select
                  label='Gateway'
                  defaultValue={data?.gatewayId || ''}
                  fullWidth
                  {...register('gatewayId')}
                  onChange={handleGatewayChange}
                >
                  {gateways.map(gateway => (
                    <MenuItem key={gateway.gatewayId} value={gateway.gatewayId}>
                      {gateway.gatewayName}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
            )}

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
              </Grid>
            )}

            {fields.map((field, index) => (
              <Grid item xs={12} md={6} key={index}>
                <TextField
                  fullWidth
                  label={field.label}
                  placeholder={field.placeholder}
                  {...register(field.name)}
                  InputProps={{
                    startAdornment: field.icon && <InputAdornment position='start'>{field.icon}</InputAdornment>
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color='secondary' variant='outlined'>
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
