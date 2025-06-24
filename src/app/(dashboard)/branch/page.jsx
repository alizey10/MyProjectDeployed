'use client'

import { useState, useEffect } from 'react'

import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'

import DataTable from '@/views/common/DataTable'
import ConfirmDialog from '@components/Dialog'
import DialogBox from '@/views/common/DialogBox'
import BranchService from '@services/branchService'
import OrganizationService from '@services/organizationService'

const PAGE_SIZE = 10

const BranchPage = () => {
  const [branches, setBranches] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [selectedBranch, setSelectedBranch] = useState(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editData, setEditData] = useState(null)
  const [isCreateMode, setIsCreateMode] = useState(false)
  const [organization, setOrganization] = useState([])

  useEffect(() => {
    const fetchOrganization = async () => {
      const organizations = await OrganizationService.getOrganizations(0, 0)
      const newData = organizations.data

      console.log('.............', newData)
      setOrganization(newData)
    }

    fetchOrganization()
  }, [])

  const handleEdit = branch => {
    setEditData(branch)
    setEditDialogOpen(true)
  }

  const handleAdd = () => {
    setEditData(null)
    setIsCreateMode(true)
    setEditDialogOpen(true)
  }

  const handleSaveEdit = async updatedData => {
    const payload = {
      branchName: updatedData.branchName,
      phone: updatedData.phone,
      email: updatedData.email,
      organizationId: updatedData.organizationId,
      city: updatedData.city,
      country: updatedData.country,
      address: updatedData.address,
      poc: updatedData.poc
    }

    let success

    if (isCreateMode) {
      const result = await BranchService.createBranch(payload)

      success = !!result
      setIsCreateMode(false)
    } else {
      success = await BranchService.updateBranch(editData.branchId, payload)
    }

    if (success) {
      setEditDialogOpen(false)
      await loadBranches(page)
    }
  }

  const loadBranches = async currentPage => {
    setLoading(true)
    const data = await BranchService.getBranchs(currentPage, PAGE_SIZE)

    if (data) {
      setBranches(data.data)
      let _totalRecords = data.data[0]?.totalRecord

      setTotalPages(Math.ceil(_totalRecords / PAGE_SIZE) || 0)
    }

    setLoading(false)
  }

  useEffect(() => {
    loadBranches(page)
  }, [page])

  const handleDeleteClick = branch => {
    setSelectedBranch(branch)
    setConfirmDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    setConfirmDialogOpen(false)
    setDeleting(true)

    if (selectedBranch) {
      const success = await BranchService.deleteBranch(selectedBranch.branchId)

      if (success) await loadBranches(page)
    }

    setDeleting(false)
    setSelectedBranch(null)
  }

  const handleCancelDelete = () => {
    setConfirmDialogOpen(false)
    setSelectedBranch(null)
  }

  // Define columns for DataTable
  const columns = [
    { label: 'Branch Name', field: 'branchName' },
    { label: 'Organization', field: 'organizationName' },
    { label: 'Phone', field: 'phone' },
    { label: 'Email', field: 'email' },
    { label: 'City', field: 'city' },
    { label: 'Country', field: 'country' },
    { label: 'Address', field: 'address' },
    { label: 'POC', field: 'poc' },
    { label: 'Created', field: 'dateCreated' }
  ]

  // Define fields for DialogBox
  const fields = [
    { label: 'Branch Name', name: 'branchName', placeholder: 'Branch ABC', icon: '🏢', required: true },
    { label: 'email', name: 'email', placeholder: 'test@gmail.com', icon: '📬' },
    { label: 'Phone', name: 'phone', placeholder: '0311-0000000', icon: '📞' },
    { label: 'City', name: 'city', placeholder: 'Karachi', icon: '🏙️' },
    { label: 'Country', name: 'country', placeholder: 'Pakistan', icon: '🌏' },
    { label: 'Address', name: 'address', placeholder: 'Street 1, Sector 4', icon: '🏠' },
    { label: 'POC', name: 'poc', placeholder: 'John Doe', icon: '👤' }
  ]

  return (
    <>
      <ConfirmDialog
        open={confirmDialogOpen}
        title='Confirm Deletion'
        message={`Are you sure you want to delete "${selectedBranch?.branchName}"?`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      <DialogBox
        title={isCreateMode ? 'Add Branch' : 'Edit Branch'}
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false)
          setIsCreateMode(false)
        }}
        data={isCreateMode ? '' : editData}
        organization={organization}
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
            Branch
          </Button>
        </Grid>
        <Grid item xs={12}>
          <DataTable
            columns={columns}
            data={branches}
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

export default BranchPage
