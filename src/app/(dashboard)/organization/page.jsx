'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import DataTable from '@/views/floor/DataTable'
import ConfirmDialog from '@components/Dialog'
import DialogBox from '@/views/common/DialogBox'
import OrganizationService from '@services/organizationService'
import { getStatusCode, HttpStatus, getMessage } from '@/utils/getStatusCode'
import { StatusEnum } from '@/enum/status-enum'
import { usePermissions } from '@/app/hooks/permissionContext'
import CircularProgress from '@mui/material/CircularProgress'
import Tooltip from '@mui/material/Tooltip'

const PAGE_SIZE = 10
const OrganizationStatus = StatusEnum

const OrganizationManagerPage = () => {
  const handleActivateClick = async org => {
    if (activatingId) return
    setActivatingId(org.organizationId)

    try {
      const response = await OrganizationService.activateOrganization(org.organizationId)

      if (
        response.status === HttpStatus.OK ||
        response.status === HttpStatus.Created ||
        response.status === HttpStatus.NoContent ||
        response === true
      ) {
        toast.success('Organization Activated')
        await loadOrganizations(page, status)
      } else {
        toast.error(getMessage(response))
      }
    } catch (error) {
      toast.error(getMessage(error))
    } finally {
      setActivatingId(null)
    }
  }

  const searchParams = useSearchParams()
  const router = useRouter()

  const urlStatus = searchParams.get('status') || OrganizationStatus.ACTIVE
  const [selectedOrganization, setSelectedOrganization] = useState(null)

  const [status, setStatus] = useState(urlStatus)
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
  const [activatingId, setActivatingId] = useState(null)
  const { permissions, loading: permLoading } = usePermissions()

  useEffect(() => {
    setStatus(urlStatus)
    setPage(1)
  }, [urlStatus])

  const loadOrganizations = async (currentPage, statusParam) => {
    setLoading(true)
    try {
      const isInactive = statusParam === OrganizationStatus.INACTIVE
      const response = await OrganizationService.getOrganizations(currentPage, PAGE_SIZE, isInactive)

      if (!response.data?.success) {
        toast.error(getMessage(response))
        return
      }

      const data = response.data?.data || []
      setOrgs(data)

      const totalRecords = data[0]?.totalRecord || 0
      setTotalPages(Math.ceil(totalRecords / PAGE_SIZE))
    } catch (error) {
      toast.error(getMessage(error))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrganizations(page, status)
  }, [page, status])

  const handleStatusChange = newStatus => {
    setStatus(newStatus)
    setPage(1)
    router.push(`/organization?status=${newStatus}`)
  }

  const handleEdit = org => {
    setEditData(org)
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
      }

      toast.success(message)
      setEditDialogOpen(false)
      setIsCreateMode(false)
      await loadOrganizations(page, status)
    } catch (error) {
      toast.error(getMessage(error))
    }
  }
  const handleDeleteClick = organization => {
    setSelectedOrganization(organization)
    setConfirmDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    setConfirmDialogOpen(false)
    setDeleting(true)
    if (selectedOrganization) {
      try {
        const response = await OrganizationService.deleteOrganization(selectedOrganization.organizationId)

        if (response.status === HttpStatus.OK || response.status === HttpStatus.NoContent || response === true) {
          toast.success('Record Deleted')
          await loadOrganizations(page, status)
        } else {
          toast.error(getMessage(response))
        }
      } catch (error) {
        toast.error(getMessage(error))
      }
    }

    setDeleting(false)
    setSelectedOrganization(null)
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
    { label: 'Country', name: 'country', placeholder: 'Pakistan', icon: '🌏', required: true },
    { label: 'City', name: 'city', placeholder: 'Lahore', icon: '🏙️' },
    { label: 'Address', name: 'address', placeholder: 'Street 1, Sector 4', icon: '🏠' },
    { label: 'Phone', name: 'phone', placeholder: '0311-0000000', icon: '📞' },
    { label: 'Post Code', name: 'postCode', placeholder: '54000', icon: '📬' },
    { label: 'POC', name: 'poc', placeholder: 'John Doe', icon: '👤' }
  ]

  return (
    <>
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
            message={`Are you sure you want to delete "${selectedOrganization?.organizationName || 'this organization'}"?`}
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
            data={isCreateMode ? null : editData}
            onSave={handleSaveEdit}
            fields={fields}
            organization={orgs}
            isCreateMode={isCreateMode}
          />

          <Grid
            item
            xs={12}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2
            }}
          >
            <div>
              <Button
                sx={{ mr: 2 }}
                variant={status === OrganizationStatus.ACTIVE ? 'contained' : 'outlined'}
                onClick={() => handleStatusChange(OrganizationStatus.ACTIVE)}
              >
                Active
              </Button>
              <Button
                variant={status === OrganizationStatus.INACTIVE ? 'contained' : 'outlined'}
                onClick={() => handleStatusChange(OrganizationStatus.INACTIVE)}
              >
                Inactive
              </Button>
            </div>

            <Tooltip
              title={!permissions.canModify ? 'You are not authorized to add organizations' : ''}
              arrow
              disableHoverListener={permissions.canModify}
            >
              <span>
                <Button
                  variant='contained'
                  color='success'
                  startIcon={<i className='ri-add-line' />}
                  onClick={handleAdd}
                  disabled={permLoading || !permissions.canModify}
                >
                  Add Organization
                </Button>
              </span>
            </Tooltip>
          </Grid>

          <DataTable
            data={orgs}
            columns={columns}
            loading={loading}
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            actionProps={{
              edit: { onClick: handleEdit, disabled: !permissions.canModify },
              delete: { onClick: handleDeleteClick, disabled: !permissions.canDelete },
              activate: { onClick: handleActivateClick, disabled: !permissions.canModify }
            }}
            status={status}
            activatingId={activatingId}
            showActions={true}
          />
        </>
      )}
    </>
  )
}

export default OrganizationManagerPage
