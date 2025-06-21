'use client'

import { useState, useEffect } from 'react'

import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'

import DataTable from '@/views/common/DataTable'
import ConfirmDialog from '@components/Dialog'
import DialogBox from '@/views/common/DialogBox'
import OrganizationService from '@services/organizationService'

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
      organizationName: updatedData.organizationName,
      phone: updatedData.phone,
      city: updatedData.city,
      country: updatedData.country,
      address: updatedData.address,
      postCode: updatedData.postCode,
      poc: updatedData.poc
    }

    let success

    if (isCreateMode) {
      const result = await OrganizationService.createOrganization(payload)

      success = !!result
      setIsCreateMode(false)
    } else {
      success = await OrganizationService.updateOrganization(editData.organizationId, payload)
    }

    if (success) {
      setEditDialogOpen(false)
      await loadOrganizations(page)
    }
  }

  const loadOrganizations = async currentPage => {
    setLoading(true)
    const data = await OrganizationService.getOrganizations(currentPage, PAGE_SIZE)

    if (data) {
      setOrgs(data.data)
      let _totalRecords = data.data[0]?.totalRecord

      setTotalPages(Math.ceil(_totalRecords / PAGE_SIZE) || 0)
    }

    setLoading(false)
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

      if (success) await loadOrganizations(page)
    }

    setDeleting(false)
    setSelectedOrg(null)
  }

  const handleCancelDelete = () => {
    setConfirmDialogOpen(false)
    setSelectedOrg(null)
  }

  const columns = [
    { label: 'Organization', field: 'organizationName' },
    { label: 'Phone', field: 'phone' },
    { label: 'City', field: 'city' },
    { label: 'Country', field: 'country' },
    { label: 'Address', field: 'address' },
    { label: 'Post Code', field: 'postCode' },
    { label: 'POC', field: 'poc' },
    { label: 'Created', field: 'dateCreated' }
  ]

  const fields = [
    { label: 'Organization Name', name: 'organizationName', placeholder: 'TopNotch Ltd.', icon: '🏢' },
    { label: 'Phone', name: 'phone', placeholder: '0311-0000000', icon: '📞' },
    { label: 'City', name: 'city', placeholder: 'Lahore', icon: '🏙️' },
    { label: 'Country', name: 'country', placeholder: 'Pakistan', icon: '🌏' },
    { label: 'Address', name: 'address', placeholder: 'Street 1, Sector 4', icon: '🏠' },
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
