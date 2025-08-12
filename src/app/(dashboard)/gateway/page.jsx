'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'

import DataTable from '@/views/floor/DataTable'
import ConfirmDialog from '@components/Dialog'
import DialogBox from '@/views/gateway/DialogBox'
import GatewayService from '@services/gatewayService'
import OrganizationService from '@services/organizationService'
import { getStatusCode, HttpStatus, getMessage } from '@/utils/getStatusCode'
import { StatusEnum } from '@enums/enum'

const PAGE_SIZE = 10
const GatewayEnum = StatusEnum

const GatewayManagerPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlStatus = searchParams.get('status') || GatewayEnum.ACTIVE
  const [status, setStatus] = useState(urlStatus)
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

  const loadGateways = async (currentPage, currentStatus) => {
    setLoading(true)
    try {
      const isInactive = currentStatus === GatewayEnum.INACTIVE
      const res = await GatewayService.getGateways(currentPage, PAGE_SIZE, isInactive)

    
      if (!res?.data?.success) {
        toast.error(getMessage(res))
        setGateways([])
        setTotalPages(1)
        return
      }

      const data = res.data?.data || []
      setGateways(data)

      const totalRecords = data[0]?.totalRecord || 0
      setTotalPages(Math.ceil(totalRecords / PAGE_SIZE))
    } catch (error) {
      toast.error(getMessage(error))
      setGateways([])
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadGateways(page, status)
  }, [page, status])

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus)
    setPage(1)
    router.push(`/gateway?status=${newStatus}`)
  }

  const handleEdit = (gateway) => {
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

      if (code !== HttpStatus.OK && code !== HttpStatus.Created) {
        toast.error(message)
        return
      }

      toast.success(message)
      setEditDialogOpen(false)
      setIsCreateMode(false)
      await loadGateways(page, status)
    } catch (error) {
      toast.error(getMessage(error))
    }
  }

  const handleDeleteClick = (gateway) => {
    setSelectedGateway(gateway)
    setConfirmDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
  setConfirmDialogOpen(false)
  setDeleting(true)

  if (selectedGateway) {
    try {
      const response = await GatewayService.deleteGateway(selectedGateway.gatewayId)

      if (response.status === 200 || response.status === 204) {
        toast.success('Record Deleted')
        await loadGateways(page, status)
      } else {
        toast.error(response?.data?.message || 'Cannot delete gateway, it is in use.')
      }
    } catch (error) {
      toast.error(getMessage(error))
    }
  }

  setDeleting(false)
  setSelectedGateway(null)
}

  const handleCancelDelete = () => {
    setConfirmDialogOpen(false)
    setSelectedGateway(null)
  }

  const handleActivateClick = async (gateway) => {
    if (activatingId) return
    setActivatingId(gateway.gatewayId)

    try {
    
      const response = await GatewayService.activateGateway(gateway.gatewayId)

  
      if (response.success) {
        toast.success('Gateway Activated')
        await loadGateways(page, status)
      } else {
        toast.error(response.message || 'Activation failed')
      }
    } catch (error) {
      toast.error(getMessage(error))
    } finally {
      setActivatingId(null)
    }
  }

 const columns = [
    { label: 'Gateway Id', field: 'gatewayId' },
    { label: 'Gateway', field: 'gatewayName' },
    { label: 'Organization', field: 'organizationName' },
    { label: 'Branch', field: 'branchName' }

  
  ]

  const fields = [
        { label: 'Organization Id', name: 'organizationId', placeholder: 'Select Organization', icon: '🏢', required: true },
    { label: 'Branch Id', name: 'branchId', placeholder: 'Select Branch', icon: '🌿', required: true },
    { label: 'Gateway Id', name: 'gatewayId', placeholder: '123', icon: '', required: true },
    { label: 'Gateway Name', name: 'gatewayName', placeholder: 'Main Gateway', icon: '', required: true }
  ]

  return (
    <>
      <ConfirmDialog
        open={confirmDialogOpen}
        title="Confirm Deletion"
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
            variant={status === GatewayEnum.ACTIVE ? 'contained' : 'outlined'}
            color="primary"
            sx={{ mr: 2 }}
            onClick={() => handleStatusChange(GatewayEnum.ACTIVE)}
          >
            Active
          </Button>
          <Button
            variant={status === GatewayEnum.INACTIVE ? 'contained' : 'outlined'}
            color="primary"
            onClick={() => handleStatusChange(GatewayEnum.INACTIVE)}
          >
            Inactive
          </Button>
        </Grid>

        <Grid item xs sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="success"
            startIcon={<i className="ri-add-line" />}
            onClick={handleAdd}
          >
         Add Gateway
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
        onActivate={handleActivateClick}
        status={status}
        activatingId={activatingId}
      />
    </>
  )
}

export default GatewayManagerPage
