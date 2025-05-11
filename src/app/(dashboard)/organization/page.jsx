'use client'

import { useState, useEffect } from 'react'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import OrganizationDataTable from '@views/dashboard/OrganizationTable'
import ConfirmDialog from '@components/Dialog'
import AddOrEditOrganizationDialog from '@components/EditOrganizationDialog'
import OrganizationService from '@services/organizationService'

const PAGE_SIZE = 5

const OrganizationPage = () => {
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
      setTotalPages(Math.ceil(9 / PAGE_SIZE) || 0)
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

  return (
    <>
      <ConfirmDialog
        open={confirmDialogOpen}
        title='Confirm Deletion'
        message={`Are you sure you want to delete "${selectedOrg?.organizationName}"?`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      <AddOrEditOrganizationDialog
        title={isCreateMode ? 'Add Organization' : 'Edit Organization'}
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false)
          setIsCreateMode(false)
        }}
        isCreateMode={isCreateMode ? true : false}
        orgData={isCreateMode ? '' : editData}
        onSave={handleSaveEdit}
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
          <OrganizationDataTable
            orgData={orgs}
            currentPage={page}
            totalPages={totalPages}
            loading={loading || deleting} // pass here
            onPageChange={newPage => setPage(newPage)}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
          />
        </Grid>
      </Grid>
    </>
  )
}

export default OrganizationPage
