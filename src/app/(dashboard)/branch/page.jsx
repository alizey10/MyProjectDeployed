'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
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
  const router = useRouter()
  const searchParams = useSearchParams()
  const statusFromUrl = searchParams.get('status') || 'active'

  const [statusFilter, setStatusFilter] = useState(statusFromUrl)
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


  const currentOrgId = searchParams.get('organizationId') || ''
  const currentBranchId = searchParams.get('branchId') || ''
  const currentOrgName = searchParams.get('orgName') || ''

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const res = await OrganizationService.getOrganizations(0, 0)
        if (!res.data.success) {
          toast.error(res.data.message)
          return
        }
        setOrganization(res.data.data)
      } catch (error) {
        toast.error(getMessage(error))
        console.error('Error fetching organizations:', error)
      }
    }
    fetchOrganizations()
  }, [])

  useEffect(() => {
    setStatusFilter(statusFromUrl)
    setPage(1)
  }, [statusFromUrl])

  useEffect(() => {
    loadBranches(page, statusFilter)
  }, [page, statusFilter])


  const loadBranches = async (currentPage, currentStatus) => {
    setLoading(true)
    try {
      const InActive = currentStatus === 'inactive'

      const params = {
        Page: currentPage,
        PageSize: PAGE_SIZE,
        InActive,
      }

      if (currentOrgId) params.organizationId = currentOrgId
      if (currentOrgName) params.orgName = currentOrgName
      if (currentBranchId) params.branchId = currentBranchId

      const res = await BranchService.getBranchsWithParams(params)
      if (!res?.data?.success) {
        toast.error(getMessage(res))
        return
      }
      const data = res.data.data || []
      setBranches(data)
      const totalRecords = data.length > 0 ? data[0].totalRecord : 0
      setTotalPages(Math.ceil(totalRecords / PAGE_SIZE))
    } catch (error) {
      toast.error(getMessage(error))
      console.error('Failed to load branches:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusClick = newStatus => {
    setPage(1)
    setStatusFilter(newStatus)

    const params = new URLSearchParams(Array.from(searchParams.entries()))
    params.set('status', newStatus)
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  const handleEdit = branch => {
    setEditData(branch)
    setIsCreateMode(false)
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
      poc: updatedData.poc,
    }

    try {
      const result = isCreateMode
        ? await BranchService.createBranch(payload)
        : await BranchService.updateBranch(editData.branchId, payload)

      const code = getStatusCode(result)
      const message = getMessage(result)

      if (code === HttpStatus.Conflict) {
        toast.error(message)
        return
      }

      if (!result?.data?.success) {
        toast.error(message)
        return
      }

      toast.success(message)
      setEditDialogOpen(false)
      if (isCreateMode) setIsCreateMode(false)

      await loadBranches(page, statusFilter)
    } catch (error) {
      toast.error(getMessage(error))
      console.error('Error saving branch:', error)
    }
  }

  const handleDeleteClick = branch => {
    setSelectedBranch(branch)
    setConfirmDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    setConfirmDialogOpen(false)
    setDeleting(true)
    if (!selectedBranch) return

    try {
      const success = await BranchService.deleteBranch(selectedBranch.branchId)
      if (success) {
        toast.success('Record Deleted')
        await loadBranches(page, statusFilter)
      }
    } catch (error) {
      toast.error(getMessage(error))
      console.error('Error deleting branch:', error)
    } finally {
      setDeleting(false)
      setSelectedBranch(null)
    }
  }

  const handleCancelDelete = () => {
    setConfirmDialogOpen(false)
    setSelectedBranch(null)
  }

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
    { label: 'Created', field: 'dateCreated' },
  ]

  const fields = [
    { label: 'Branch Id', name: 'branchId', placeholder: 'IDXCV205', icon: '🏢', required: true },
    { label: 'Branch Name', name: 'branchName', placeholder: 'Branch ABC', icon: '🏢', required: true },
    { label: 'Country', name: 'country', placeholder: 'Pakistan', icon: '🌏' },
    { label: 'City', name: 'city', placeholder: 'Karachi', icon: '🏙️' },
    { label: 'Address', name: 'address', placeholder: 'Street 1, Sector 4', icon: '🏠' },
    { label: 'Email', name: 'email', placeholder: 'test@gmail.com', icon: '📬' },
    { label: 'Phone', name: 'phone', placeholder: '0311-0000000', icon: '📞' },
    { label: 'POC', name: 'poc', placeholder: 'John Doe', icon: '👤' },
  ]

  return (
    <>
      <ConfirmDialog
        open={confirmDialogOpen}
        title="Confirm Deletion"
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
        onSave={handleSaveEdit}
        organization={organization}
        fields={fields}
      />

      <Grid container spacing={2} sx={{ mb: 2, alignItems: 'center' }}>
        <Grid item>
          <Button
            variant={statusFilter === 'active' ? 'contained' : 'outlined'}
            color="primary"
            sx={{ mr: 2 }}
            onClick={() => handleStatusClick('active')}
          >
            Active
          </Button>
          <Button
            variant={statusFilter === 'inactive' ? 'contained' : 'outlined'}
            color="primary"
            onClick={() => handleStatusClick('inactive')}
          >
            Inactive
          </Button>
        </Grid>

        <Grid item xs sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" color="success" startIcon={<i className="ri-add-line" />} onClick={handleAdd}>
            Branch
          </Button>
        </Grid>
      </Grid>

      <DataTable
        columns={columns}
        data={branches}
        currentPage={page}
        totalPages={totalPages}
        loading={loading || deleting}
        onPageChange={setPage}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />
    </>
  )
}

export default BranchPage
