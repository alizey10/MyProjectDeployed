'use client'

import { useState, useEffect } from 'react'

import { toast } from 'react-toastify'

import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'

import DataTable from '@/views/common/DataTable'
import ConfirmDialog from '@components/Dialog'
import DialogBox from '@/views/sensor/DialogBox'
import SensorService from '@services/sensorService'
import OrganizationService from '@services/organizationService'
import GatewayService from '@services/gatewayService'
import { getStatusCode, getMessage, HttpStatus } from '@/utils/getStatusCode'

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
  const [organization, setOrganization] = useState([])

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        const response = await OrganizationService.getOrganizations(0, 0)
        const data = response?.data?.data || []

        setOrganization(data)
      } catch (error) {
        toast.error(getMessage(error))
        console.error('Error fetching organizations:', error)
      }
    }

    fetchOrganization()
  }, [])

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
      organizationName: updatedData.organizationName,
      branchId: updatedData.branchId,
      branchName: updatedData.branchName,
      gatewayName: updatedData.gatewayName,
      gatewayId: updatedData.gatewayId,
      floorSectionId: updatedData.floorSectionId,
      floorSectionName: updatedData.floorSectionName,
      sensorId: updatedData.sensorId,
      linkedDevice: updatedData.linkedDevice,
      minTemperature: updatedData.minTemperature,
      maxTemperature: updatedData.maxTemperature,
      alertType: updatedData.alertType
    }
    setLoading(true)

    try {
      let result

      if (isCreateMode) {
        result = await SensorService.createSensor(payload)
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
      } else {
        const sensorUpdate = await SensorService.updateSensor(editData.sensorId, payload)
        const gatewayUpdate = await GatewayService.updateGateway(editData.gatewayId, payload)

        const sensorStatus = getStatusCode(sensorUpdate)
        const gatewayStatus = getStatusCode(gatewayUpdate)

        if (sensorStatus === HttpStatus.OK && gatewayStatus === HttpStatus.OK) {
          toast.success('Record Updated')
        } else {
          toast.error(getMessage(sensorUpdate) || getMessage(gatewayUpdate))
          return
        }
      }

      setEditDialogOpen(false)
      await loadSensors(page)
    } catch (error) {
      toast.error(getMessage(error))
      console.error('Error saving sensor:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadSensors = async currentPage => {
    setLoading(true)

    try {
      const response = await SensorService.getSensors(currentPage, PAGE_SIZE)

      if (!response?.data?.success) {
        toast.error(getMessage(response))
        return
      }

      const sensors = response.data?.data || []
      setSensors(sensors)

      const totalRecords = sensors[0]?.totalRecord || 0
      setTotalPages(Math.ceil(totalRecords / PAGE_SIZE))
    } catch (error) {
      toast.error(getMessage(error))
      console.error('Error loading sensors:', error)
    } finally {
      setLoading(false)
    }
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

      if (success) {
        toast.success('Record Deleted')
        await loadSensors(page)
      }
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
    { label: 'Organization Id', field: 'organizationId' },
    { label: 'Organization Name', field: 'organizationName' },
    { label: 'Branch Id', field: 'branchId' },
    { label: 'Branch Name', field: 'branchName' },
    { label: 'Gateway Id', field: 'gatewayId' },
    { label: 'Gateway Name', field: 'gatewayName' },
    { label: 'Sensor Id', field: 'sensorId' },
    { label: 'Sensor Name', field: 'sensorName' },
    { label: 'Floor Section Name', field: 'floorSectionName' },
    { label: 'Linked Device', field: 'linkedDevice' },
    { label: 'Min Temperature', field: 'minTemperature' },
    { label: 'Max Temperature', field: 'maxTemperature' },
    { label: 'Alert Type', field: 'alertType' },
    { label: 'Created', field: 'dateCreated' }
  ]

  // Define fields for DialogBox
  const fields = [
    { label: 'Sensor Name', name: 'sensorName', placeholder: 'Temperature Sensor', icon: '📡', required: true },
    { label: 'Sensor Id', name: 'sensorId', placeholder: 'S1234', icon: '🔢', required: true },
    { label: 'Linked Device', name: 'linkedDevice', placeholder: 'Sensor Device', icon: '🔌', required: true },
    { label: 'Min Temperature', name: 'minTemperature', placeholder: '0', icon: '🌡️' },
    { label: 'Max Temperature', name: 'maxTemperature', placeholder: '100', icon: '🌡️' },
    { label: 'Alert Type', name: 'alertType', placeholder: '1', icon: '⚠️' }
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
