'use client'

import { useState, useEffect, useMemo } from 'react'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import { toast } from 'react-toastify'
import ConfirmDialog from '@components/Dialog'
import DialogBox from '@/views/user/DialogBox'
import DataTable from '@/views/floor/DataTable'
import UserService from '@/@services/userService'
import { getStatusCode, HttpStatus, getMessage } from '@/utils/getStatusCode'
import useAuth from '@/app/hooks/useAuth'
import OrganizationService from '@services/organizationService'
import BranchService from '@services/branchService'

const PAGE_SIZE = 10

const UserManagerPage = () => {
  const [users, setUsers] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editData, setEditData] = useState(null)
  const [isCreateMode, setIsCreateMode] = useState(false)
  const { role } = useAuth()
  const [organization, setOrganization] = useState([])
  const [branches, setBranches] = useState([])
  const [selectedOrgId, setSelectedOrgId] = useState(null)
  const [selectedBranchId, setSelectedBranchId] = useState(null)

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

  const loadUsers = async currentPage => {
    setLoading(true)
    try {
      const response = await UserService.getUsers(currentPage, PAGE_SIZE)
      const code = getStatusCode(response)
      if (code !== HttpStatus.OK) {
        toast.error(getMessage(response))
        return
      }

      const responseData = response.data?.data || []
      const totalRecords = responseData.length > 0 ? responseData[0]?.totalRecord || responseData.length : 0

      const data = responseData.map(user => {
        const org = user.organization
        const branchNames = (user.branches || []).map(b => b.branchName).join(', ')
        const branchIds = (user.branches || []).map(b => b.branchId).join(',')

        return {
          id: user.userId,
          fullName: user.fullName,
          email: user.email,
          role: Number(user.role),
          organizationId: org?.organizationId || '',
          organizationName: org?.organizationName || '',
          branchNames,
          branchIds,
          dateCreated: user.dateCreated,
          totalRecord: user.totalRecord || totalRecords
        }
      })

      setUsers(data)
      setTotalPages(Math.ceil(totalRecords / PAGE_SIZE))

      setTotalPages(Math.ceil(totalRecords / PAGE_SIZE))
    } catch (error) {
      toast.error(getMessage(error))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers(page)
  }, [page])

  if (role !== 'Admin') {
    return (
      <div
        style={{
          textAlign: 'center',
          marginTop: '100px',
          fontSize: '20px',
          fontWeight: 'bold',
          color: 'black'
        }}
      >
        🚫 You are not authorized to view this page
      </div>
    )
  }

  const handleAdd = () => {
    setEditData(null)
    setIsCreateMode(true)
    setEditDialogOpen(true)
    setSelectedOrgId(null)
    setSelectedBranchId(null)
    setBranches([])
  }

  const handleSaveEdit = async updatedData => {
    try {
      const backendRole = Number(updatedData.role) === 1 ? 1 : 2

      const payload = {
        fullName: updatedData.fullName,
        email: updatedData.email,
        password: updatedData.password,
        role: backendRole,
        organizationId: updatedData.organizationId,
        branchIds: updatedData.branchIds || []
      }

      let response
      if (isCreateMode) {
        response = await UserService.createUser(payload)
      } else {
        response = await UserService.updateUser(updatedData.id, payload)
      }

      const code = getStatusCode(response)
      const message = getMessage(response)

      if (code !== HttpStatus.OK && code !== HttpStatus.Created) {
        toast.error(message)
        throw response
      }

      toast.success(isCreateMode ? 'User created successfully!' : 'User updated successfully!')
      setEditDialogOpen(false)
      setIsCreateMode(false)
      await loadUsers(page)

      return response
    } catch (error) {
      toast.error(getMessage(error))
      throw error
    }
  }

  const columns = [
    { label: 'Full Name', field: 'fullName' },
    { label: 'Email', field: 'email' },
    { label: 'Organization Id', field: 'organizationId' },
    { label: 'Organization', field: 'organizationName' },
    { label: 'Branch Ids', field: 'branchIds' },
    { label: 'Branches', field: 'branchNames' },
    { label: 'Date Created', field: 'dateCreated' }
  ]

  const fields = useMemo(
    () => [
      { label: 'Full Name', name: 'fullName', placeholder: 'John Doe', icon: '👤', required: true },
      { label: 'Email', name: 'email', placeholder: 'test@gmail.com', icon: '📧', required: true },
      { label: 'Password', name: 'password', placeholder: '******', type: 'password', icon: '🔑', required: true },
      {
        label: 'Role',
        name: 'role',
        type: 'select',
        required: true,
        icon: '⚙️',
        options: [
          { label: 'User', value: 0 },
          { label: 'Admin', value: 1 }
        ]
      }
    ],
    []
  )

  return (
    <>
      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '100px' }}>
          <CircularProgress size={40} />
        </div>
      ) : (
        <>
          <ConfirmDialog
            open={confirmDialogOpen}
            title='Confirm Deletion'
            message={`Are you sure you want to delete "${selectedUser?.fullName}"?`}
          />

          <DialogBox
            key={isCreateMode ? 'add-user' : editData?.id || editData?.email || 'edit-user'}
            title={isCreateMode ? 'Add User' : 'Edit User'}
            open={editDialogOpen}
            onClose={() => {
              setEditDialogOpen(false)
              setEditData(null)
              setIsCreateMode(false)
            }}
            data={isCreateMode ? null : editData}
            onSave={handleSaveEdit}
            fields={fields}
            organization={organization}
            branches={branches}
          />

          <Grid container spacing={2} sx={{ mb: 2, alignItems: 'center' }}>
            <Grid item xs sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant='contained' color='success' startIcon={<i className='ri-add-line' />} onClick={handleAdd}>
                Add User
              </Button>
            </Grid>
          </Grid>

          <DataTable
            data={users}
            columns={columns}
            loading={loading}
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            showActions={false}
          />
        </>
      )}
    </>
  )
}

export default UserManagerPage
