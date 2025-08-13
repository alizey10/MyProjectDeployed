'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import DataTable from '@/views/floor/DataTable'
import ConfirmDialog from '@components/Dialog'
import DialogBox from '@/views/sensor/DialogBox'
import SensorService from '@services/sensorService'
import OrganizationService from '@services/organizationService'
import BranchService from '@services/branchService'
import GatewayService from '@services/gatewayService'
import { getStatusCode, HttpStatus, getMessage } from '@/utils/getStatusCode'
import { StatusEnum } from '@/enum/status-enum'

const PAGE_SIZE = 10
const SensorStatus = StatusEnum

const SensorManagerPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlStatus = searchParams.get('status') || SensorStatus.ACTIVE
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
  const [activatingId, setActivatingId] = useState(null)
  const [organization, setOrganization] = useState([])
  const [branches, setBranches] = useState([])
  const [gateways, setGateways] = useState([])
  const [selectedOrgId, setSelectedOrgId] = useState(null)
  const [selectedBranchId, setSelectedBranchId] = useState(null)
  const [selectedGatewayId, setSelectedGatewayId] = useState(null)

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

useEffect(() => {
  if (!selectedBranchId) {
    setGateways([])
    setSelectedGatewayId(null)
    return
  }
  const fetchGateways = async () => {
    try {
      const res = await GatewayService.getGatewaysByBranch(selectedBranchId)
      const gws = res?.data?.data || []
      setGateways(gws)
      setSelectedGatewayId(null)
    } catch (error) {
      toast.error('Failed to load gateways')
      setGateways([])
      setSelectedGatewayId(null)
    }
  }
  fetchGateways()
}, [selectedBranchId])

  const loadSensors = async (currentPage, currentStatus) => {
    setLoading(true)
    try {
      const isInactive = currentStatus === SensorStatus.INACTIVE
      const response = await SensorService.getSensors(currentPage, PAGE_SIZE, isInactive)

      if (!response.data?.success) {
        toast.error(getMessage(response))
        setSensors([])
        setTotalPages(1)
        return
      }

      const data = response.data?.data || []
      setSensors(data)
      const totalRecords = data[0]?.totalRecord || 0
      setTotalPages(Math.ceil(totalRecords / PAGE_SIZE))
    } catch (error) {
      toast.error(getMessage(error))
      setSensors([])
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSensors(page, status)
  }, [page, status])

  const handleStatusChange = newStatus => {
    setStatus(newStatus)
    setPage(1)
    router.push(`/sensor?status=${newStatus}`)
  }

  const handleEdit = sensor => {
    setEditData(sensor)
    setSelectedOrgId(sensor.organizationId)
    setSelectedBranchId(sensor.branchId)
    setSelectedGatewayId(sensor.gatewayId)
    setIsCreateMode(false)
    setEditDialogOpen(true)
  }

  const handleAdd = () => {
    setEditData(null)
    setSelectedOrgId(null)
    setSelectedBranchId(null)
    setSelectedGatewayId(null)
    setBranches([])
    setGateways([])
    setIsCreateMode(true)
    setEditDialogOpen(true)
  }

  const handleSaveEdit = async updatedData => {
    const payload = {
      sensorId: updatedData.sensorId,
      sensorName: updatedData.sensorName,
      organizationId: selectedOrgId,
      branchId: selectedBranchId,
      gatewayId: selectedGatewayId,
      floorSectionId: updatedData.floorSectionId,
      floorSectionName: updatedData.floorSectionName,
      linkedDevice: updatedData.linkedDevice,
      minTemperature: updatedData.minTemperature,
      maxTemperature: updatedData.maxTemperature,
      alertType: updatedData.alertType
    }

    try {
      const result = isCreateMode
        ? await SensorService.createSensor(payload)
        : await SensorService.updateSensor(editData.sensorId, payload)

      const code = getStatusCode(result)
      const message = getMessage(result)

      if (code !== HttpStatus.OK && code !== HttpStatus.Created) {
        toast.error(message)
        return
      }

      toast.success(message)
      setEditDialogOpen(false)
      setIsCreateMode(false)
      await loadSensors(page, status)
    } catch (error) {
      toast.error(getMessage(error))
    }
  }

  const handleDeleteClick = sensor => {
    setSelectedSensor(sensor)
    setConfirmDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    setConfirmDialogOpen(false)
    setDeleting(true)
if (selectedSensor) {
  try {
    const response = await SensorService.deleteSensor(selectedSensor.sensorId)

    if (
      response.status === HttpStatus.OK ||
      response.status === HttpStatus.Created ||
      response.status === HttpStatus.NoContent ||
      response === true
    ) {
      toast.success('Record Deleted')
      await loadSensors(page, status)
    } else {
      toast.error(getMessage(response))
    }
  } catch (error) {
    toast.error(getMessage(error))
  }
}


    setDeleting(false)
    setSelectedSensor(null)
  }

  const handleCancelDelete = () => {
    setConfirmDialogOpen(false)
    setSelectedSensor(null)
  }

  const handleActivateClick = async sensor => {
   if (activatingId) return
setActivatingId(sensor.sensorId)

try {
  const response = await SensorService.activateSensor(sensor.sensorId)

  if (
    response.status === HttpStatus.OK ||
    response.status === HttpStatus.Created ||
    response.status === HttpStatus.NoContent ||
    response === true
  ) {
    toast.success('Sensor Activated')
    await loadSensors(page, status)
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
    { label: 'Sensor Id', field: 'sensorId' },
    { label: 'Sensor Name', field: 'sensorName' },
        { label: 'Floor Section Id', field: 'floorSectionId' },
    { label: 'Linked Device', field: 'linkedDevice' },
    { label: 'Min Temperature', field: 'minTemperature' },
    { label: 'Max Temperature', field: 'maxTemperature' },
    { label: 'Alert Type', field: 'alertType' },
    { label: 'Created', field: 'dateCreated' },
    { label: 'Organization Id', field: 'organizationId' },
     { label: 'Organization', field: 'organizationName' },
    { label: 'Branch Id', field: 'branchId' },
      { label: 'Branch', field: 'branchName' },
    { label: 'Gateway Id', field: 'gatewayId' },
    { label: 'Gateway', field: 'gatewayName' },

  ]

  const fields = [
 { label: 'Sensor Name', name: 'sensorName', placeholder: 'Temperature Sensor', icon: '📡', required: true },
    { label: 'Sensor Id', name: 'sensorId', placeholder: 'Unique Sensor ID', icon: '🆔', required: true },
    { label: 'Floor Section Id', name: 'floorSectionId', placeholder: 'Floor Section Id', icon: '🏢' },
    { label: 'Linked Device', name: 'linkedDevice', placeholder: 'Device Name', icon: '🔗', required: true },
    { label: 'Min Temperature', name: 'minTemperature', placeholder: '0', icon: '🌡️' },
    { label: 'Max Temperature', name: 'maxTemperature', placeholder: '100', icon: '🌡️' },
    { label: 'Alert Type', name: 'alertType', placeholder: 'Type', icon: '⚠️' }
  ]

  return (
    <>
      <ConfirmDialog
        open={confirmDialogOpen}
        title="Confirm Deletion"
        message={`Are you sure you want to delete "${selectedSensor?.sensorName}"?`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      <DialogBox
        open={editDialogOpen}
        title={isCreateMode ? 'Add Sensor' : 'Edit Sensor'}
        onClose={() => setEditDialogOpen(false)}
        organization={organization}
        branches={branches}
        gateways={gateways}
        data={editData}
        onSave={handleSaveEdit}
        fields={fields}
    
      />

      <Grid container spacing={2} sx={{ mb: 2, alignItems: 'center' }}>
        <Grid item>
          <Button
            variant={status === SensorStatus.ACTIVE ? 'contained' : 'outlined'}
            color="primary"
            sx={{ mr: 2 }}
            onClick={() => handleStatusChange(SensorStatus.ACTIVE)}
          >
            Active
          </Button>
          <Button
            variant={status === SensorStatus.INACTIVE ? 'contained' : 'outlined'}
            color="primary"
            onClick={() => handleStatusChange(SensorStatus.INACTIVE)}
          >
            Inactive
          </Button>
        </Grid>

        <Grid item xs sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" color="success" startIcon={<i className='ri-add-line' />}onClick={handleAdd}>
            Add Sensor
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
        onActivate={handleActivateClick}
        status={status}
        activatingId={activatingId}
      />
    </>
  )
}

export default SensorManagerPage
