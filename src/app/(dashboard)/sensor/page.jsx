'use client'

import { useState, useEffect } from 'react'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import DataTable from '@/views/common/DataTable'
import ConfirmDialog from '@components/Dialog'
import DialogBox from '@/views/common/DialogBox'
import SensorService from '@services/sensorService'

const PAGE_SIZE = 10

const SensorManagerPage = () => {
  const [sensors, setSensors] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [selectedSensor, setSelectedSensor] = useState(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editData, setEditData] = useState(null)
  const [isCreateMode, setIsCreateMode] = useState(false)

  const handleEdit = sensor => {
    setEditData(sensor)
    setEditDialogOpen(true)
  }

  const handleAdd = () => {
    setEditData(null)
    setIsCreateMode(true)
    setEditDialogOpen(true)
  }

  const handleSaveEdit = async updatedData => {
    const payload = {
      sensorName: updatedData.sensorName,
      organizationId: updatedData.organizationId,
      branchId: updatedData.branchId,
      gatewayId: updatedData.gatewayId,
      floorSectionId: updatedData.floorSectionId,
      linkedDevice: updatedData.linkedDevice
    }

    let success

    if (isCreateMode) {
      const result = await SensorService.createSensor(payload)
      success = !!result
      setIsCreateMode(false)
    } else {
      success = await SensorService.updateSensor(editData.sensorId, payload)
    }

    if (success) {
      setEditDialogOpen(false)
      await loadSensors(page)
    }
  }

  const loadSensors = async currentPage => {
    setLoading(true)
    const data = await SensorService.getSensors(currentPage, PAGE_SIZE)
    if (data) {
      setSensors(data.data)
      let _totalRecords = data.data[0]?.totalRecord
      setTotalPages(Math.ceil(_totalRecords / PAGE_SIZE) || 0)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadSensors(page)
  }, [page])

  const handleDeleteClick = sensor => {
    setSelectedSensor(sensor)
    setConfirmDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    setConfirmDialogOpen(false)
    setDeleting(true)
    if (selectedSensor) {
      const success = await SensorService.deleteSensor(selectedSensor.sensorId)
      if (success) await loadSensors(page)
    }
    setDeleting(false)
    setSelectedSensor(null)
  }

  const handleCancelDelete = () => {
    setConfirmDialogOpen(false)
    setSelectedSensor(null)
  }

  // Define columns for DataTable
  const columns = [
    { label: 'Sensor Name', field: 'sensorName' },
    { label: 'Organization Id', field: 'organizationId' },
    { label: 'Branch Id', field: 'branchId' },
    { label: 'Gateway Id', field: 'gatewayId' },
    { label: 'Floor Section Id', field: 'floorSectionId' },
    { label: 'Linked Device', field: 'linkedDevice' },
    { label: 'Created', field: 'dateCreated' }
  ]

  // Define fields for DialogBox
  const fields = [
    { label: 'Sensor Name', name: 'sensorName', placeholder: 'Temperature Sensor', icon: '📡' },
    { label: 'Organization Id', name: 'organizationId', placeholder: '123', icon: '🏢' },
    { label: 'Branch Id', name: 'branchId', placeholder: '456', icon: '🏠' },
    { label: 'Gateway Id', name: 'gatewayId', placeholder: '789', icon: '🌐' },
    { label: 'Floor Section Id', name: 'floorSectionId', placeholder: '101', icon: '🏢' },
    { label: 'Linked Device', name: 'linkedDevice', placeholder: 'Sensor Device', icon: '🔌' }
  ]

  return (
    <>
      <ConfirmDialog
        open={confirmDialogOpen}
        title='Confirm Deletion'
        message={`Are you sure you want to delete "${selectedSensor?.sensorName}"?`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      <DialogBox
        title={isCreateMode ? 'Add Sensor' : 'Edit Sensor'}
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false)
          setIsCreateMode(false)
        }}
        data={isCreateMode ? '' : editData}
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
            Sensor
          </Button>
        </Grid>
        <Grid item xs={12}>
          <DataTable
            columns={columns}
            data={sensors}
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

export default SensorManagerPage
