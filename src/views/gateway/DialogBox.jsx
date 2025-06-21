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

const DialogBox = ({ open, title, onClose, data, onSave, fields, organization }) => {
  const [branches, SetBranches] = useState([])

  const { register, handleSubmit, reset } = useForm({
    defaultValues: data || {}
  })

  useEffect(() => {
    if (open && data) {
      getBranches(data?.organizationId)
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
                  defaultValue={branches[0]?.branchId}
                  fullWidth
                  sx={{ marginLeft: '1rem' }}
                  {...register('branchId')}
                >
                  {branches.map(org => (
                    <MenuItem key={org.branchId} value={org.branchId}>
                      {org.branchName}
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
