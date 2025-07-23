'use client'

import { useEffect, useState } from 'react'

import {
  InputLabel,
  MenuItem,
  Grid,
  Select,
  FormControl,
  FormHelperText,
  Box,
  CircularProgress,
  Button
} from '@mui/material'

import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'

import OrganizationService from '@services/organizationService'
import BranchService from '@services/branchService'
import FloorService from '@services/floorService'
import ReportServices from '@services/reportService'

import Countries from '../../../countries.json'

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
        setOrganizations(orgRes?.data?.data || [])
        if (!orgRes?.data.success) toast.error(orgRes?.data.message)
        const floorRes = await FloorService.getFloor(0, 0)
        if (!floorRes?.data.success) toast.error(floorRes?.data.message)
        setFloorSections(floorRes?.data?.data || [])
      } catch (err) {
        console.error('Error fetching initial data:', err)
        toast.error(err.message)
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
        setBranches(res.data?.data || [])
        if (!res?.data.success) toast.error(res?.data.message)
      } catch (err) {
        console.error('Error loading branches:', err)
      }
      setLoading(false)
    }

    loadBranches()
  }, [organizationId])

  // Call EntityCounts API on any field change
  useEffect(() => {
    const fetchEntityCountsAndSensorSummary = async () => {
      setLoading(true)
      try {
        const [entityCountsResponse, sensorSummaryResponse] = await Promise.all([
          ReportServices.getEntityCounts({
            organizationId,
            country,
            branchId,
            floorSectionId
          }),
          ReportServices.getSensorSummary({
            OrganizationId: organizationId,
            OrgCountry: country,
            BranchId: branchId,
            FloorSectionId: floorSectionId
          })
        ])

        if (onFiltersChange) {
          onFiltersChange({
            organizationId,
            country,
            branchId,
            floorSectionId,
            entityCounts: entityCountsResponse.data?.data,
            sensorData: sensorSummaryResponse.data?.data
          })
        }
      } catch (err) {
        console.error('Error fetching entity counts or sensor summary:', err)
      }
      setLoading(false)
    }

    fetchEntityCountsAndSensorSummary()
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
        <Grid container spacing={2} mt={0.5} mb={2}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth error={!!errors.organizationId}>
              <InputLabel>Organization</InputLabel>
              <Select
                value={watch('organizationId') || ''}
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

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth error={!!errors.country}>
              <InputLabel>Country</InputLabel>
              <Select
                value={watch('country') || ''}
                {...register('country')}
                onChange={e => setValue('country', e.target.value)}
              >
                {Countries?.map((country, idx) => (
                  <MenuItem key={idx} value={country.name}>
                    {country.name}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{errors.country?.message}</FormHelperText>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth error={!!errors.branch}>
              <InputLabel>Branch</InputLabel>
              <Select
                value={watch('branch') || ''}
                {...register('branch')}
                onChange={e => setValue('branch', e.target.value)}
              >
                {branches.map((branch, idx) => (
                  <MenuItem key={idx} value={branch.branchId}>
                    {branch.branchName}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{errors.branch?.message}</FormHelperText>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth error={!!errors.floorSectionId}>
              <InputLabel>Floor Section</InputLabel>
              <Select
                value={watch('floorSectionId') || ''}
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

          {/* Clear Filter Button */}
          <Grid item xs={12}>
            <Button
              variant='outlined'
              color='secondary'
              onClick={() => {
                setValue('floorSectionId', '')
                setValue('organizationId', '')
                setValue('country', '')
                setValue('branch', '')
              }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  )
}

export default TopNav
