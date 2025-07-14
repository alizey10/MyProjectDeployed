'use client'

import { useState, useEffect } from 'react'

import { toast } from 'react-toastify'

import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'

import DataTable from '@/views/common/DataTable'
import ConfirmDialog from '@components/Dialog'
import DialogBox from '@/views/common/DialogBox'
import OrganizationService from '@services/organizationService'
import { getStatusCode, HttpStatus, getMessage } from '@/utils/getStatusCode'

const PAGE_SIZE = 10

const OrganizationManagerPage = () => {
  const [orgs, setOrgs] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [selectedOrg, setSelectedOrg] = useState(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editData, setEditData] = useState(null)
  const [isCreateMode, setIsCreateMode] = useState(false)

  const handleEdit = org => {
    setEditData(org)
    setEditDialogOpen(true)
  }

  const handleAdd = () => {
    setEditData(null)
    setIsCreateMode(true)
    setEditDialogOpen(true)
  }

  const handleSaveEdit = async updatedData => {
    const payload = {
      OrganizationId: updatedData.organizationId,
      organizationName: updatedData.organizationName,
      phone: updatedData.phone,
      city: updatedData.city,
      country: updatedData.country,
      address: updatedData.address,
      postCode: updatedData.postCode,
      poc: updatedData.poc
    }

    try {
      const result = isCreateMode
        ? await OrganizationService.createOrganization(payload)
        : await OrganizationService.updateOrganization(editData.organizationId, payload)

      const code = getStatusCode(result)
      const message = getMessage(result)

      if (code !== HttpStatus.OK && code !== HttpStatus.Created) {
        toast.error(message)
        return
      } else {
        toast.success(message)
      }

      if (isCreateMode) {
        setIsCreateMode(false)
      }

      setEditDialogOpen(false)
      await loadOrganizations(page)
    } catch (error) {
      const message = error?.response?.data?.message || 'Unexpected error occurred.'
      toast.error(message)
      console.error('Save failed:', error)
    }
  }

  const loadOrganizations = async currentPage => {
    setLoading(true)

    try {
      const response = await OrganizationService.getOrganizations(currentPage, PAGE_SIZE)

      if (!response.data?.success) {
        toast.error(getMessage(response))
        return
      }

      const _data = response.data?.data || []
      setOrgs(_data)

      const _totalRecords = _data[0]?.totalRecord || 0
      setTotalPages(Math.ceil(_totalRecords / PAGE_SIZE))
    } catch (error) {
      toast.error(getMessage(error))
      console.error('Error loading organizations:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrganizations(page)
  }, [page])

  const handleDeleteClick = org => {
    setSelectedOrg(org)
    setConfirmDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    setConfirmDialogOpen(false)
    setDeleting(true)

    if (selectedOrg) {
      const success = await OrganizationService.deleteOrganization(selectedOrg.organizationId)

      if (success) {
        toast.success('Record Deleted')
        await loadOrganizations(page)
      }
    }

    setDeleting(false)
    setSelectedOrg(null)
  }

  const handleCancelDelete = () => {
    setConfirmDialogOpen(false)
    setSelectedOrg(null)
  }

  const columns = [
    { label: 'Organization Id', field: 'organizationId' },
    { label: 'Organization', field: 'organizationName' },
    { label: 'Country', field: 'country' },
    { label: 'City', field: 'city' },
    { label: 'Address', field: 'address' },
    { label: 'Phone', field: 'phone' },
    { label: 'Post Code', field: 'postCode' },
    { label: 'POC', field: 'poc' },
    { label: 'Created', field: 'dateCreated' }
  ]

  const fields = [
    { label: 'Organization Id', name: 'organizationId', placeholder: '2000FXCV', icon: '🏢', required: true },
    { label: 'Organization Name', name: 'organizationName', placeholder: 'TopNotch Ltd.', icon: '🏢', required: true },
    { label: 'Country', name: 'country', placeholder: 'Pakistan', icon: '🌏', required: true },
    { label: 'City', name: 'city', placeholder: 'Lahore', icon: '🏙️' },
    { label: 'Address', name: 'address', placeholder: 'Street 1, Sector 4', icon: '🏠' },
    { label: 'Phone', name: 'phone', placeholder: '0311-0000000', icon: '📞' },
    { label: 'Post Code', name: 'postCode', placeholder: '54000', icon: '📬' },
    { label: 'POC', name: 'poc', placeholder: 'John Doe', icon: '👤' }
  ]

  return (
    <>
      <ConfirmDialog
        open={confirmDialogOpen}
        title='Confirm Deletion'
        message={`Are you sure you want to delete "${selectedOrg?.organizationName}"?`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      <DialogBox
        title={isCreateMode ? 'Add Organization' : 'Edit Organization'}
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false)
          setIsCreateMode(false)
        }}
        data={isCreateMode ? '' : editData}
        onSave={handleSaveEdit}
        fields={fields}
      />

      <Grid container spacing={6}>
        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Button
            variant='contained'
            color='success'
            sx={{ mt: '0px', ml: '5px' }}
            startIcon={<i className='ri-add-line' />}
            onClick={handleAdd}
          >
            Organization
          </Button>
        </Grid>
        <Grid item xs={12}>
          <DataTable
            columns={columns}
            data={orgs}
            currentPage={page}
            totalPages={totalPages}
            loading={loading || deleting}
            onPageChange={newPage => setPage(newPage)}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
          />
        </Grid>
      </Grid>
    </>
  )
}

export default OrganizationManagerPage
