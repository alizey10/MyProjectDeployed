'use client'

import { useState, useEffect, useMemo } from 'react'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import CircularProgress from '@mui/material/CircularProgress'
import { toast } from 'react-toastify'
import ConfirmDialog from '@components/Dialog'
import DialogBox from '@/views/common/DialogBox'
import DataTable from '@/views/floor/DataTable'
import UserService from '@/@services/userService'
import { getStatusCode, HttpStatus, getMessage } from '@/utils/getStatusCode'
import useAuth from '@/app/hooks/useAuth'

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

  const loadUsers = async currentPage => {
    setLoading(true)
    try {
      const response = await UserService.getUsers(currentPage, PAGE_SIZE)

      const code = getStatusCode(response)
      if (code !== HttpStatus.OK) {
        toast.error(getMessage(response))
        return
      }

      const data = response.data?.data || []
      setUsers(data)
      const totalRecords = data[0]?.totalRecord || 0
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
  }

  const handleSaveEdit = async updatedData => {
    try {
      const payload = {
        fullName: updatedData.fullName,
        email: updatedData.email,
        password: updatedData.password,
        role:  Number(updatedData.role)
      }

      const response = isCreateMode
        ? await UserService.createUser(payload)
        : null 

      const code = getStatusCode(response)
      const message = getMessage(response)

      if (code !== HttpStatus.OK && code !== HttpStatus.Created) {
        toast.error(message)
        return
      }

      toast.success(isCreateMode ? 'User created successfully!' : 'Updated locally')
      setEditDialogOpen(false)
      setIsCreateMode(false)
      await loadUsers(page)
    } catch (error) {
      toast.error(getMessage(error))
    }
  }

 
  const columns = [
    { label: 'Full Name', field: 'fullName' },
    { label: 'Email', field: 'email' }, 
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
    { label: 'Admin', value: 1 },
    { label: 'User', value: 2 }
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
            key={isCreateMode ? 'add-user' : editData?.email || 'edit-user'}
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
          />

          <Grid container spacing={2} sx={{ mb: 2, alignItems: 'center' }}>
            <Grid item xs sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              
                <Button
                  variant='contained'
                  color='success'
                  startIcon={<i className='ri-add-line' />}
                  onClick={handleAdd}
                >
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
