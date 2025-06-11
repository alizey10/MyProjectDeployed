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
  MenuItem
} from '@mui/material'
import { useForm } from 'react-hook-form'
import branchService from '@/@services/branchService'
import gatewayService from '@/@services/gatewayService'
import floorService from '@/@services/floorService'

const DialogBox = ({ open, title, onClose, data, onSave, fields, organization }) => {
  debugger
  const [branches, SetBranches] = useState([])
  const [gateways, SetGateways] = useState([])
  const [Floor, SetFloor] = useState([])

  const { register, handleSubmit, reset, setValue } = useForm({
    defaultValues: data || {}
  })

  useEffect(() => {
    if (open && data) {
      getBranches(data?.organizationId)
      getGateWayByBranch(data?.branchId)
      reset(data || {})
    }
    if (!data) {
      reset({})
    }
  }, [open, data, reset])

  const onSubmit = updatedData => {
    reset(updatedData)
    onSave(updatedData)
  }

  const getBranches = async orgId => {
    const _branches = await branchService.getBranchsByOrgId(0, 0, orgId)
    SetBranches(_branches.data)
  }

  const getGateWayByBranch = async branchId => {
    const _gateways = await gatewayService.getGatewayByBranchId(0, 0, branchId)
    SetGateways(_gateways.data)
    getFloorSection()
  }

  const getFloorSection = async () => {
    const _floorSection = await floorService.getFloor(0, 0)
    SetFloor(_floorSection.data)
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='md'>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <form id='edit-form' onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={4} mt={0.5}>
            {organization?.length > 0 && (
              <>
                <InputLabel sx={{ marginLeft: '1rem' }}>Organization</InputLabel>
                <Select
                  label='Organization'
                  defaultValue={data?.organizationId}
                  fullWidth
                  sx={{ marginLeft: '1rem' }}
                  {...register('organizationId')}
                  onChange={event => {
                    const orgId = event.target.value
                    const selectedOrganization = organization.find(org => org.organizationId === orgId)
                    if (selectedOrganization) {
                      setValue('organizationName', selectedOrganization.organizationName)
                    }
                    getBranches(orgId)
                  }}
                >
                  {organization.map(org => (
                    <MenuItem key={org.organizationId} value={org.organizationId}>
                      {org.organizationName}
                    </MenuItem>
                  ))}
                </Select>
              </>
            )}
            {branches?.length > 0 && (
              <>
                <InputLabel sx={{ marginLeft: '1rem', marginTop: '1rem' }}>Branches</InputLabel>
                <Select
                  label='Branches'
                  defaultValue={data?.branchId}
                  fullWidth
                  sx={{ marginLeft: '1rem' }}
                  {...register('branchId')}
                  onChange={event => {
                    const branchId = event.target.value
                    const selectedBranch = branches.find(branch => branch.branchId === branchId)
                    if (selectedBranch) {
                      setValue('branchName', selectedBranch.branchName)
                    }
                    getGateWayByBranch(branchId)
                  }}
                >
                  {branches.map(branch => (
                    <MenuItem key={branch.branchId} value={branch.branchId}>
                      {branch.branchName}
                    </MenuItem>
                  ))}
                </Select>
              </>
            )}
            {gateways?.length > 0 && (
              <>
                <InputLabel sx={{ marginLeft: '1rem', marginTop: '1rem' }}>Gateway</InputLabel>
                <Select
                  label='GateWay'
                  defaultValue={data?.gatewayId}
                  fullWidth
                  sx={{ marginLeft: '1rem' }}
                  {...register('gatewayId')}
                  onChange={event => {
                    const selectedValue = event.target.value
                    const selectedGateway = gateways.find(gateway => gateway.gatewayId === selectedValue)
                    if (selectedGateway) {
                      setValue('gatewayName', selectedGateway.gatewayName)
                    }
                  }}
                >
                  {gateways.map(gatway => (
                    <MenuItem key={gatway.gatewayId} value={gatway.gatewayId}>
                      {gatway.gatewayName}
                    </MenuItem>
                  ))}
                </Select>
              </>
            )}

            {Floor?.length > 0 && (
              <>
                <InputLabel sx={{ marginLeft: '1rem', marginTop: '1rem' }}>Floor</InputLabel>
                <Select
                  label='Branches'
                  defaultValue={data?.floorSectionId}
                  fullWidth
                  sx={{ marginLeft: '1rem' }}
                  {...register('floorSectionId')}
                  onChange={event => {
                    const selectedValue = event.target.value
                    const selectedFloor = Floor.find(floor => floor.floorSectionId === selectedValue)
                    if (selectedFloor) {
                      setValue('floorSectionName', selectedFloor.floorSectionName)
                    }
                  }}
                >
                  {Floor.map(floor => (
                    <MenuItem key={floor.floorSectionId} value={floor.floorSectionId}>
                      {floor.floorSectionName}
                    </MenuItem>
                  ))}
                </Select>
              </>
            )}

            {fields.map((field, index) => (
              <Grid item xs={12} md={6} key={index}>
                <TextField
                  fullWidth
                  label={field.label}
                  placeholder={field.placeholder}
                  {...register(field.name)}
                  InputProps={{
                    startAdornment: field.icon ? <InputAdornment position='start'>{field.icon}</InputAdornment> : null
                  }}
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
        <Button type='submit' form='edit-form' variant='contained'>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DialogBox
