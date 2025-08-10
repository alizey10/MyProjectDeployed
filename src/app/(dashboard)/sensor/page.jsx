'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
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
  const searchParams = useSearchParams()
  const router = useRouter()

  const urlStatus = searchParams.get('status') || 'active'

  const [status, setStatus] = useState(urlStatus)
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
    setStatus(urlStatus)
    setPage(1)
  }, [urlStatus])

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await OrganizationService.getOrganizations(0, 0)
        if (!response.data.success) {
          toast.error(response.data.message)
          return
        }
        setOrganization(response.data.data)
      } catch (error) {
        toast.error(getMessage(error))
      }
    }
    fetchOrganizations()
  }, [])

  const loadSensors = async (currentPage, statusParam) => {
    setLoading(true)
    try {
     
      const InActive = statusParam === 'inactive'
      const response = await SensorService.getSensors(currentPage, PAGE_SIZE, InActive)
      if (!response?.data?.success) {
        toast.error(getMessage(response))
        setSensors([])
        setTotalPages(1)
        return
      }
      const sensorList = response.data.data || []
      setSensors(sensorList)
      const totalRecord = sensorList.length > 0 ? sensorList[0].totalRecord || 0 : 0
      setTotalPages(Math.ceil(totalRecord / PAGE_SIZE))
    } catch (error) {
      toast.error(getMessage(error))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSensors(page, status)
  }, [page, status])

  const handleStatusChange = newStatus => {
    if (newStatus === status) return

    setStatus(newStatus)
    setPage(1)
    router.push(`/sensor?status=${newStatus}`)
  }

  const handleEdit = sensor => {
    setEditData(sensor)
    setIsCreateMode(false)
    setEditDialogOpen(true)
  }

  const handleAdd = () => {
    setEditData(null)
    setIsCreateMode(true)
    setEditDialogOpen(true)
  }

  const handleSaveEdit = async updatedData => {
    setLoading(true)
    try {
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

      if (isCreateMode) {
        const result = await SensorService.createSensor(payload)
        const code = getStatusCode(result)
        const message = getMessage(result)
        if (![HttpStatus.OK, HttpStatus.Created].includes(code)) {
          toast.error(message)
          return
        }
        toast.success(message)
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
      setIsCreateMode(false)
      await loadSensors(page, status)
    } catch (error) {
      toast.error(getMessage(error))
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = sensor => {
    setSelectedSensor(sensor)
    setConfirmDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    setConfirmDialogOpen(false)
    setDeleting(true)
    try {
      if (selectedSensor) {
        const success = await SensorService.deleteSensor(selectedSensor.sensorId)
        if (success) {
          toast.success('Record Deleted')
          await loadSensors(page, status)
        }
      }
    } catch (error) {
      toast.error(getMessage(error))
    } finally {
      setDeleting(false)
      setSelectedSensor(null)
    }
  }

  const handleCancelDelete = () => {
    setConfirmDialogOpen(false)
    setSelectedSensor(null)
  }

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
        data={isCreateMode ? null : editData}
        organization={organization}
        onSave={handleSaveEdit}
        fields={fields}
      />

      <Grid container spacing={2} sx={{ mb: 2, alignItems: 'center' }}>
        <Grid item>
          <Button
            variant={status === 'active' ? 'contained' : 'outlined'}
            color='primary'
            sx={{ mr: 2 }}
            onClick={() => handleStatusChange('active')}
          >
            Active
          </Button>
          <Button
            variant={status === 'inactive' ? 'contained' : 'outlined'}
            color='primary'
            onClick={() => handleStatusChange('inactive')}
          >
            Inactive
          </Button>
        </Grid>

        <Grid item xs sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant='contained' color='success' startIcon={<i className='ri-add-line' />} onClick={handleAdd}>
            Sensor
          </Button>
        </Grid>
      </Grid>

      <DataTable
        columns={columns}
        data={sensors}
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

export default SensorManagerPage
