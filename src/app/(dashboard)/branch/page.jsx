'use client'

import { useState, useEffect } from 'react'

import { toast } from 'react-toastify'

import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'

import DataTable from '@/views/common/DataTable'
import ConfirmDialog from '@components/Dialog'
import DialogBox from '@/views/common/DialogBox'
import BranchService from '@services/branchService'
import OrganizationService from '@services/organizationService'
import { getStatusCode, HttpStatus, getMessage } from '@/utils/getStatusCode'

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
      if (!organizations.data.success) toast.error(organization.data.message)
      const newData = organizations.data.data
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
      BranchId: updatedData.branchId,
      branchName: updatedData.branchName,
      phone: updatedData.phone,
      email: updatedData.email,
      organizationId: updatedData.organizationId,
      city: updatedData.city,
      country: updatedData.country,
      address: updatedData.address,
      poc: updatedData.poc
    }

    try {
      const result = isCreateMode
        ? await BranchService.createBranch(payload)
        : await BranchService.updateBranch(editData.branchId, payload)

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
      await loadBranches(page)
    } catch (error) {
      toast.error(getMessage(error))
      console.error('Branch save failed:', error)
    }
  }

  const loadBranches = async currentPage => {
    setLoading(true)

    try {
      const response = await BranchService.getBranchs(currentPage, PAGE_SIZE)

      if (!response?.data?.success) {
        toast.error(getMessage(response))
        return
      }

      const data = response.data.data || []

      setBranches(data)

      const totalRecords = data[0]?.totalRecord || 0
      setTotalPages(Math.ceil(totalRecords / PAGE_SIZE))
    } catch (error) {
      toast.error(getMessage(error))
      console.error('Failed to load branches:', error)
    } finally {
      setLoading(false)
    }
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

      if (success) {
        toast.success('Record Deleted')
        await loadBranches(page)
      }
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
    { label: 'Branch Id', field: 'branchId' },
    { label: 'Branch Name', field: 'branchName' },
    { label: 'Organization Id', field: 'organizationId' },
    { label: 'Organization', field: 'organizationName' },
    { label: 'Country', field: 'country' },
    { label: 'City', field: 'city' },
    { label: 'Address', field: 'address' },
    { label: 'Email', field: 'email' },
    { label: 'Phone', field: 'phone' },
    { label: 'POC', field: 'poc' },
    { label: 'Created', field: 'dateCreated' }
  ]

  // Define fields for DialogBox
  const fields = [
    { label: 'Branch Id', name: 'branchId', placeholder: 'IDXCV205', icon: '🏢', required: true },
    { label: 'Branch Name', name: 'branchName', placeholder: 'Branch ABC', icon: '🏢', required: true },
    { label: 'Country', name: 'country', placeholder: 'Pakistan', icon: '🌏' },
    { label: 'City', name: 'city', placeholder: 'Karachi', icon: '🏙️' },
    { label: 'Address', name: 'address', placeholder: 'Street 1, Sector 4', icon: '🏠' },
    { label: 'email', name: 'email', placeholder: 'test@gmail.com', icon: '📬' },
    { label: 'Phone', name: 'phone', placeholder: '0311-0000000', icon: '📞' },
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
