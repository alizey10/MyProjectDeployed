'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import OrganizationService from '@services/organizationService'
import DataTable from '@/views/floor/DataTable'
import ConfirmDialog from '@components/Dialog'
import DialogBox from '@/views/common/DialogBox'
import BranchService from '@services/branchService'
import { getStatusCode, HttpStatus, getMessage } from '@/utils/getStatusCode'
import { StatusEnum } from '@/enum/enum'
import { APIStatusCode } from '@/utils/statusCodes'

import { useMemo } from 'react'
const PAGE_SIZE = 10
const BranchStatus = StatusEnum

const BranchPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const urlStatus = searchParams.get('status') || BranchStatus.ACTIVE

  const [status, setStatus] = useState(urlStatus)
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
  const [activatingId, setActivatingId] = useState(null)
  const [organization, setOrganization] = useState([])
  useEffect(() => {
    const fetchOrganization = async () => {
      const organizations = await OrganizationService.getOrganizations(0, 0)
      const newData = organizations.data
      setOrganization(newData)
    }

    fetchOrganization()
  }, [])


  
  useEffect(() => {
    setStatus(urlStatus)
    setPage(1)
  }, [urlStatus])

  const loadBranches = async (currentPage, currentStatus) => {
    setLoading(true)
    try {
      const isInactive = currentStatus === BranchStatus.INACTIVE
      const res = await BranchService.getBranchs(currentPage, PAGE_SIZE, isInactive)

      if (!res?.data?.success) {
        toast.error(getMessage(res))
        setBranches([])
        setTotalPages(1)
        return
      }

      const data = res.data.data || []
      setBranches(data)
      const totalRecords = data[0]?.totalRecord || 0
      setTotalPages(Math.ceil(totalRecords / PAGE_SIZE))
    } catch (error) {
      toast.error(getMessage(error))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBranches(page, status)
  }, [page, status])

  const handleStatusChange = newStatus => {
    setStatus(newStatus)
    setPage(1)
    router.push(`/branch?status=${newStatus}`)
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
      }

      toast.success(message)
      setEditDialogOpen(false)
      setIsCreateMode(false)
      await loadBranches(page, status)
    } catch (error) {
      toast.error(getMessage(error))
    }
  }

  const handleDeleteClick = branch => {
    setSelectedBranch(branch)
    setConfirmDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
  setConfirmDialogOpen(false)
  setDeleting(true)

  if (selectedBranch) {
    try {
      const response = await BranchService.deleteBranch(selectedBranch.branchId)

if (response.status === 200 || response.status === 204) {
  toast.success('Record Deleted')
  await loadBranches(page, status)
} else {
  toast.error(response?.data?.message || 'Cannot delete branch, it is in use.')
}

    } catch (error) {
      toast.error(getMessage(error))
    }
  }

  setDeleting(false)
  setSelectedBranch(null)
}

  const handleCancelDelete = () => {
    setConfirmDialogOpen(false)
    setSelectedBranch(null)
  }

  const handleActivateClick = async branch => {
    if (activatingId) return
    setActivatingId(branch.branchId)

    try {
      const response = await BranchService.activateBranch(branch.branchId)

      if (
        response.status === APIStatusCode.Created ||
        response.status === APIStatusCode.Ok ||
        response.status === APIStatusCode.NoContent
      ) {
        toast.success('Branch Activated')
        await loadBranches(page, status)
      } else {
        toast.error(response?.data?.message || 'Activation failed on server')
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || 'Unexpected error occurred')
    } finally {
      setActivatingId(null)
    }
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
    { label: 'Created', field: 'dateCreated' }
  ]

  const fields = useMemo(
    () => [
      {
        label: 'Organization Id',
        name: 'organizationId',
        placeholder: 'Select Organization',
        icon: '🏢',
        required: true,
        type: 'select',
        options: Array.isArray(organization)
          ? organization.map(org => ({ value: org.organizationId, label: org.organizationName }))
          : []
      },
      { label: 'Branch Id', name: 'branchId', placeholder: 'IDXCV205', icon: '🏢', required: true },
      { label: 'Branch Name', name: 'branchName', placeholder: 'Branch ABC', icon: '🏢', required: true },
      { label: 'Country', name: 'country', placeholder: 'Pakistan', icon: '🌏' },
      { label: 'City', name: 'city', placeholder: 'Karachi', icon: '🏙️' },
      { label: 'Address', name: 'address', placeholder: 'Street 1, Sector 4', icon: '🏠' },
      { label: 'Email', name: 'email', placeholder: 'test@gmail.com', icon: '📬' },
      { label: 'Phone', name: 'phone', placeholder: '0311-0000000', icon: '📞' },
      { label: 'POC', name: 'poc', placeholder: 'John Doe', icon: '👤' }
    ],
    [organization]
  )
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
        organization={organization}
        data={isCreateMode ? '' : editData}
        onSave={handleSaveEdit}
        fields={fields}
      />

      <Grid container spacing={2} sx={{ mb: 2, alignItems: 'center' }}>
        <Grid item>
          <Button
            variant={status === BranchStatus.ACTIVE ? 'contained' : 'outlined'}
            onClick={() => handleStatusChange(BranchStatus.ACTIVE)}
            sx={{ mr: 2 }}
          >
            Active
          </Button>
          <Button
            variant={status === BranchStatus.INACTIVE ? 'contained' : 'outlined'}
            onClick={() => handleStatusChange(BranchStatus.INACTIVE)}
          >
            Inactive
          </Button>
        </Grid>

        <Grid item xs sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant='contained' color='success' onClick={handleAdd} startIcon={<i className='ri-add-line' />}>
            Add Branch
          </Button>
        </Grid>
      </Grid>

      <DataTable
        data={branches}
        columns={columns}
        loading={loading || deleting}
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        onActivate={handleActivateClick}
        status={status}
        activatingId={activatingId}
      />
    </>
  )
}

export default BranchPage
