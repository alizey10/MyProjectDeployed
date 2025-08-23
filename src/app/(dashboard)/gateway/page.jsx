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
import BranchService from '@services/branchService'
import { HttpStatus, getMessage } from '@/utils/getStatusCode'
import { StatusEnum } from '@/enum/status-enum'
import { usePermissions } from '@/app/hooks/permissionContext'
import CircularProgress from '@mui/material/CircularProgress'

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
  const [branches, setBranches] = useState([])
  const [selectedOrgId, setSelectedOrgId] = useState(null)
  const [selectedBranchId, setSelectedBranchId] = useState(null)
  const { permissions, loading: permLoading } = usePermissions()
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const res = await OrganizationService.getOrganizations(0, 0)
        const orgs = res?.data?.data || res?.data || []
        setOrganization(orgs)
      } catch (error) {
        toast.error('Failed to load organizations')
      }
    }
    fetchOrganizations()
  }, [])

  useEffect(() => {
    if (!selectedOrgId) {
      setBranches([])
      setSelectedBranchId(null)
      return
    }
    const fetchBranches = async () => {
      try {
        const res = await BranchService.getBranchs(0, 0, false, selectedOrgId)
        const brs = res?.data?.data || []
        setBranches(brs)
        setSelectedBranchId(null)
      } catch (error) {
        toast.error('Failed to load branches')
        setBranches([])
        setSelectedBranchId(null)
      }
    }
    fetchBranches()
  }, [selectedOrgId])

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

  const handleStatusChange = newStatus => {
    setStatus(newStatus)
    setPage(1)
    router.push(`/gateway?status=${newStatus}`)
  }

  const handleEdit = gateway => {
    setEditData(gateway)
    setSelectedOrgId(gateway.organizationId)
    setSelectedBranchId(gateway.branchId)
    setIsCreateMode(false)
    setEditDialogOpen(true)
  }

  const handleAdd = () => {
    setEditData(null)
    setSelectedOrgId(null)
    setSelectedBranchId(null)
    setBranches([])
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
      if (isCreateMode) {
        const result = await GatewayService.createGateway(payload)
        if (result?.status === HttpStatus.Created) {
          toast.success('Record Saved')
          setIsCreateMode(false)
          setEditDialogOpen(false)
          await loadGateways(page)
          return
        } else {
          toast.error(getMessage(result))
        }
      } else {
        const result = await GatewayService.updateGateway(editData.gatewayId, payload)
        if (result?.status === HttpStatus.OK) {
          toast.success('Record Updated')
          setEditDialogOpen(false)
          await loadGateways(page)
          return
        } else {
          toast.error(getMessage(result))
        }
      }
    } catch (error) {
      console.error('Full API error:', error)
      toast.error(getMessage(error))
    }
  }

  const handleDeleteClick = gateway => {
    setSelectedGateway(gateway)
    setConfirmDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    setConfirmDialogOpen(false)
    setDeleting(true)
    if (selectedGateway) {
      try {
        const response = await GatewayService.deleteGateway(selectedGateway.gatewayId)

        if (response.status === HttpStatus.OK || response.status === HttpStatus.NoContent || response === true) {
          toast.success('Record Deleted')
          await loadGateways(page, status)
        } else {
          toast.error(getMessage(response))
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

  const handleActivateClick = async gateway => {
    if (activatingId) return
    setActivatingId(gateway.gatewayId)

    try {
      const response = await GatewayService.activateGateway(gateway.gatewayId)

      if (
        response.status === HttpStatus.OK ||
        response.status === HttpStatus.Created ||
        response.status === HttpStatus.NoContent ||
        response === true
      ) {
        toast.success('Gateway Activated')
        await loadGateways(page, status)
      } else {
        toast.error(getMessage(response))
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
    { label: 'Organization Id', field: 'organizationId' },
    { label: 'Organization', field: 'organizationName' },
    { label: 'Branch Id', field: 'branchId' },
    { label: 'Branch', field: 'branchName' }
  ]

  const fields = [
    {
      label: 'Gateway Id',
      name: 'gatewayId',
      placeholder: 'Gateway Id',
      icon: '🌏',
      required: true,
      value: editData?.gatewayId || ''
    },
    {
      label: 'Gateway Name',
      name: 'gatewayName',
      placeholder: 'Gateway Name',
      required: true,
      icon: '🌏',
      value: editData?.gatewayName || ''
    }
  ]

  return (
    <>
      {' '}
      {permLoading || loading ? (
        <div style={{ textAlign: 'center', marginTop: '100px' }}>
          <CircularProgress size={40} />
        </div>
      ) : !permissions.canView ? (
        <div style={{ textAlign: 'center', marginTop: '100px' }}>
          <h2>🚫 You are not authorized to view this page</h2>
        </div>
      ) : (
        <>
          <ConfirmDialog
            open={confirmDialogOpen}
            title='Confirm Deletion'
            message={`Are you sure you want to delete "${selectedGateway?.gatewayName}"?`}
            onConfirm={handleConfirmDelete}
            onCancel={handleCancelDelete}
          />

          <DialogBox
            open={editDialogOpen}
            title={isCreateMode ? 'Add Gateway' : 'Edit Gateway'}
            onClose={() => setEditDialogOpen(false)}
            organization={organization}
            branches={branches}
            data={editData}
            onSave={handleSaveEdit}
            fields={fields}
          />

          <Grid container spacing={2} sx={{ mb: 2, alignItems: 'center' }}>
            <Grid item>
              <Button
                variant={status === GatewayEnum.ACTIVE ? 'contained' : 'outlined'}
                color='primary'
                sx={{ mr: 2 }}
                onClick={() => handleStatusChange(GatewayEnum.ACTIVE)}
              >
                Active
              </Button>
              <Button
                variant={status === GatewayEnum.INACTIVE ? 'contained' : 'outlined'}
                color='primary'
                onClick={() => handleStatusChange(GatewayEnum.INACTIVE)}
              >
                Inactive
              </Button>
            </Grid>

            <Grid item xs sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant='contained'
                color='success'
                startIcon={<i className='ri-add-line' />}
                onClick={handleAdd}
                disabled={permLoading || !permissions.canModify}
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
            actionProps={{
              edit: { onClick: handleEdit, disabled: !permissions.canModify },
              delete: { onClick: handleDeleteClick, disabled: !permissions.canDelete },
              activate: { onClick: handleActivateClick, disabled: !permissions.canModify }
            }}
            status={status}
            showActions={true}
            activatingId={activatingId}
          />
        </>
      )}
    </>
  )
}

export default GatewayManagerPage
