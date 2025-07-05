'use client'

import { useEffect, useState } from 'react'

import { InputLabel, MenuItem, Grid, Select, FormControl, FormHelperText, Box, CircularProgress } from '@mui/material'

import { useForm } from 'react-hook-form'

import OrganizationService from '@services/organizationService'
import BranchService from '@services/branchService'
import FloorService from '@services/floorService'
import ReportServices from '@services/reportService'

const TopNav = ({ onFiltersChange }) => {
  const [organizations, setOrganizations] = useState([])
  const [branches, setBranches] = useState([])
  const [floorSections, setFloorSections] = useState([])
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch
  } = useForm({ mode: 'onChange' })

  const organizationId = watch('organizationId')
  const country = watch('country')
  const branchId = watch('branch')
  const floorSectionId = watch('floorSectionId')

  // Fetch Organizations and Floors
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const orgRes = await OrganizationService.getOrganizations(0, 0)
        setOrganizations(orgRes?.data || [])

        const floorRes = await FloorService.getFloor(0, 0)
        setFloorSections(floorRes?.data || [])
      } catch (err) {
        console.error('Error fetching initial data:', err)
      }
      setLoading(false)
    }

    fetchData()
  }, [])

  // Load branches on organization change
  useEffect(() => {
    if (!organizationId) return

    const loadBranches = async () => {
      setLoading(true)
      try {
        const res = await BranchService.getBranchsByOrgId(0, 0, organizationId)
        setBranches(res.data || [])
      } catch (err) {
        console.error('Error loading branches:', err)
      }
      setLoading(false)
    }

    loadBranches()
  }, [organizationId])

  // Call EntityCounts API on any field change
  useEffect(() => {
    const fetchEntityCounts = async () => {
      setLoading(true)
      try {
        const response = await ReportServices.getEntityCounts({
          organizationId,
          country,
          branchId,
          floorSectionId
        })

        if (onFiltersChange) {
          onFiltersChange({
            organizationId,
            country,
            branchId,
            floorSectionId,
            entityCounts: response.data
          })
        }
      } catch (err) {
        console.error('Error fetching entity counts:', err)
      }
      setLoading(false)
    }

    fetchEntityCounts()
  }, [organizationId, country, branchId, floorSectionId])

  return (
    <Box position='relative'>
      {(loading || isSubmitting) && (
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

      <form id='edit-form' onSubmit={handleSubmit(() => {})}>
        <Grid container spacing={4} mt={0.5} mb={2}>
          <Grid item xs={3}>
            <FormControl fullWidth error={!!errors.organizationId}>
              <InputLabel>Organization</InputLabel>
              <Select
                defaultValue=''
                {...register('organizationId')}
                onChange={e => {
                  setValue('organizationId', e.target.value)
                  setBranches([])
                }}
              >
                {organizations.map(org => (
                  <MenuItem key={org.organizationId} value={org.organizationId}>
                    {org.organizationName}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{errors.organizationId?.message}</FormHelperText>
            </FormControl>
          </Grid>

          <Grid item xs={3}>
            <FormControl fullWidth error={!!errors.country}>
              <InputLabel>Country</InputLabel>
              <Select defaultValue='' {...register('country')} onChange={e => setValue('country', e.target.value)}>
                {['Pakistan', 'USA', 'Canada'].map((country, idx) => (
                  <MenuItem key={idx} value={country}>
                    {country}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{errors.country?.message}</FormHelperText>
            </FormControl>
          </Grid>

          <Grid item xs={3}>
            <FormControl fullWidth error={!!errors.branch}>
              <InputLabel>Branch</InputLabel>
              <Select defaultValue='' {...register('branch')} onChange={e => setValue('branch', e.target.value)}>
                {branches.map((branch, idx) => (
                  <MenuItem key={idx} value={branch.branchId}>
                    {branch.branchName}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{errors.branch?.message}</FormHelperText>
            </FormControl>
          </Grid>

          <Grid item xs={3}>
            <FormControl fullWidth error={!!errors.floorSectionId}>
              <InputLabel>Floor Section</InputLabel>
              <Select
                defaultValue=''
                {...register('floorSectionId')}
                onChange={e => setValue('floorSectionId', e.target.value)}
              >
                {floorSections.map((section, idx) => (
                  <MenuItem key={idx} value={section.floorSectionId}>
                    {section.floorSectionName}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{errors.floorSectionId?.message}</FormHelperText>
            </FormControl>
          </Grid>
        </Grid>
      </form>
    </Box>
  )
}

export default TopNav
