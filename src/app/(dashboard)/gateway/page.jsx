'use client'

import { useState, useEffect } from 'react'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import DataTable from '@/views/common/DataTable'
import ConfirmDialog from '@components/Dialog'
import DialogBox from '@/views/gateway/DialogBox'
import GatewayService from '@services/gatewayService'
import OrganizationService from '@services/organizationService'

const PAGE_SIZE = 10

const GatewayManagerPage = () => {
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
    const fetchOrganization = async () => {
      const organizations = await OrganizationService.getOrganizations(0, 0)
      const newData = organizations.data
      console.log('.............', newData)
      setOrganization(newData)
    }

    fetchOrganization()
  }, [])

  const handleEdit = gateway => {
    setEditData(gateway)
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

    let success

    if (isCreateMode) {
      const result = await GatewayService.createGateway(payload)
      success = !!result
      setIsCreateMode(false)
    } else {
      success = await GatewayService.updateGateway(editData.gatewayId, payload)
    }

    if (success) {
      setEditDialogOpen(false)
      await loadGateways(page)
    }
  }

  const loadGateways = async currentPage => {
    setLoading(true)
    const data = await GatewayService.getGateways(currentPage, PAGE_SIZE)
    if (data) {
      setGateways(data.data)
      let _totalRecords = data.data[0]?.totalRecord
      setTotalPages(Math.ceil(_totalRecords / PAGE_SIZE) || 0)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadGateways(page)
  }, [page])

  const handleDeleteClick = gateway => {
    setSelectedGateway(gateway)
    setConfirmDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    setConfirmDialogOpen(false)
    setDeleting(true)
    if (selectedGateway) {
      const success = await GatewayService.deleteGateway(selectedGateway.gatewayId)
      if (success) await loadGateways(page)
    }
    setDeleting(false)
    setSelectedGateway(null)
  }

  const handleCancelDelete = () => {
    setConfirmDialogOpen(false)
    setSelectedGateway(null)
  }
  const columns = [
    { label: 'Gateway Id', field: 'gatewayId' },
    { label: 'Gateway', field: 'gatewayName' },
    { label: 'Organization Id', field: 'organizationId' },
    { label: 'Branch Id', field: 'branchId' }
    // { label: 'Created', field: 'dateCreated' }
  ]

  const fields = [
    { label: 'Gateway Id', name: 'gatewayId', placeholder: '123', icon: '' },
    { label: 'Gateway Name', name: 'gatewayName', placeholder: 'Main Gateway', icon: '' }
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

      <Grid container spacing={6}>
        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Button
            variant='contained'
            color='success'
            sx={{ mt: '0px', ml: '5px' }}
            startIcon={<i className='ri-add-line' />}
            onClick={handleAdd}
          >
            Gateway
          </Button>
        </Grid>
        <Grid item xs={12}>
          <DataTable
            columns={columns}
            data={gateways}
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

export default GatewayManagerPage
