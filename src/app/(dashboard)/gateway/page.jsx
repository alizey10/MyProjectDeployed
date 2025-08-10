'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import DataTable from '@/views/common/DataTable'
import ConfirmDialog from '@components/Dialog'
import DialogBox from '@/views/gateway/DialogBox'
import GatewayService from '@services/gatewayService'
import OrganizationService from '@services/organizationService'

import { getStatusCode, HttpStatus, getMessage } from '@/utils/getStatusCode'

const PAGE_SIZE = 10

const GatewayManagerPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const statusFromUrl = searchParams.get('status') || 'active'

  const [statusFilter, setStatusFilter] = useState(statusFromUrl)
  const [gateways, setGateways] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [selectedGateway, setSelectedGateway] = useState(null)

  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editData, setEditData] = useState(null)
  const [isCreateMode, setIsCreateMode] = useState(false)

  const [organization, setOrganization] = useState([])

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
    loadGateways(page, statusFilter)
  }, [page, statusFilter])


  const loadGateways = async (currentPage, currentStatus) => {
    setLoading(true)
    try {
      const InActive = currentStatus === 'inactive' 
      const res = await GatewayService.getGateways(currentPage, PAGE_SIZE, InActive)
      if (!res?.data?.success) {
        toast.error(getMessage(res))
        return
      }
      const data = res.data.data || []
      setGateways(data)

      const totalRecords = data.length > 0 ? data[0].totalRecord : 0
      setTotalPages(Math.ceil(totalRecords / PAGE_SIZE))
    } catch (error) {
      toast.error(getMessage(error))
      console.error('Failed to load gateways:', error)
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

  const handleEdit = gateway => {
    setEditData(gateway)
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
      gatewayName: updatedData.gatewayName,
      gatewayId: updatedData.gatewayId,
      organizationId: updatedData.organizationId,
      branchId: updatedData.branchId
    }

    try {
      const result = isCreateMode
        ? await GatewayService.createGateway(payload)
        : await GatewayService.updateGateway(editData.gatewayId, payload)

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

      await loadGateways(page, statusFilter)
    } catch (error) {
      toast.error(getMessage(error))
      console.error('Error saving gateway:', error)
    }
  }

  const handleDeleteClick = gateway => {
    setSelectedGateway(gateway)
    setConfirmDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    setConfirmDialogOpen(false)
    setDeleting(true)
    if (!selectedGateway) return

    try {
      const success = await GatewayService.deleteGateway(selectedGateway.gatewayId)
      if (success) {
        toast.success('Record Deleted')
        await loadGateways(page, statusFilter)
      }
    } catch (error) {
      toast.error(getMessage(error))
      console.error('Error deleting gateway:', error)
    } finally {
      setDeleting(false)
      setSelectedGateway(null)
    }
  }

  const handleCancelDelete = () => {
    setConfirmDialogOpen(false)
    setSelectedGateway(null)
  }

  const columns = [
    { label: 'Gateway Id', field: 'gatewayId' },
    { label: 'Gateway', field: 'gatewayName' },
    { label: 'Organization Id', field: 'organizationId' },
    { label: 'Organization', field: 'organizationName' },
    { label: 'Branch Id', field: 'branchId' },
    { label: 'Branch', field: 'branchName' }
  ]

  const fields = [
    { label: 'Gateway Id', name: 'gatewayId', placeholder: '123', icon: '', required: true },
    { label: 'Gateway Name', name: 'gatewayName', placeholder: 'Main Gateway', icon: '', required: true }
  ]

  return (
    <>
      <ConfirmDialog
        open={confirmDialogOpen}
        title='Confirm Deletion'
        message={`Are you sure you want to delete "${selectedGateway?.gatewayName}"?`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      <DialogBox
        title={isCreateMode ? 'Add Gateway' : 'Edit Gateway'}
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
            color='primary'
            sx={{ mr: 2 }}
            onClick={() => handleStatusClick('active')}
          >
            Active
          </Button>
          <Button
            variant={statusFilter === 'inactive' ? 'contained' : 'outlined'}
            color='primary'
            onClick={() => handleStatusClick('inactive')}
          >
            Inactive
          </Button>
        </Grid>

        <Grid item xs sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant='contained' color='success' startIcon={<i className='ri-add-line' />} onClick={handleAdd}>
            Gateway
          </Button>
        </Grid>
      </Grid>

      <DataTable
        columns={columns}
        data={gateways}
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

export default GatewayManagerPage
