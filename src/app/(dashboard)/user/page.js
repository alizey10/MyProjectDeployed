'use client'

import { useState, useEffect, useMemo } from 'react'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import { toast } from 'react-toastify'
import CircularProgress from '@mui/material/CircularProgress'
import ConfirmDialog from '@components/Dialog'
import DialogBox from '@/views/common/DialogBox'
import DataTable from '@/views/floor/DataTable'

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

  // No dummy users; empty list initially
  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      setUsers([])
      setTotalPages(1)
      setLoading(false)
    }, 500)
  }, [])

  const handleEdit = user => {
    setEditData(user)
    setIsCreateMode(false)
    setEditDialogOpen(true)
  }

  const handleAdd = () => {
    setEditData(null)
    setIsCreateMode(true)
    setEditDialogOpen(true)
  }

  const handleSaveEdit = async updatedData => {
    if (isCreateMode) {
      const newUser = {
        fullName: updatedData.fullName,
        email: updatedData.email,
        password: updatedData.password
      }
      setUsers([...users, newUser])
      toast.success('User created successfully!')
    } else {
      setUsers(users.map(u => (u.email === editData.email ? { ...u, ...updatedData } : u)))
      toast.success('User updated successfully!')
    }
    setEditDialogOpen(false)
    setIsCreateMode(false)
  }

  const handleDeleteClick = user => {
    setSelectedUser(user)
    setConfirmDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    setUsers(users.filter(u => u.email !== selectedUser.email))
    toast.success('User deleted successfully!')
    setConfirmDialogOpen(false)
    setSelectedUser(null)
  }

  const handleCancelDelete = () => {
    setConfirmDialogOpen(false)
    setSelectedUser(null)
  }

  // Columns for DataTable
  const columns = [
    { label: 'Full Name', field: 'fullName' },
    { label: 'Email', field: 'email' },
    { label: 'Password', field: 'password' }
  ]

  // Fields for DialogBox
  const fields = useMemo(
    () => [
      { label: 'Full Name', name: 'fullName', placeholder: 'John Doe', icon: '👤', required: true },
      { label: 'Email', name: 'email', placeholder: 'test@gmail.com', icon: '📧', required: true },
      { label: 'Password', name: 'password', placeholder: '******', type: 'password', icon: '🔑', required: true }
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
            onConfirm={handleConfirmDelete}
            onCancel={handleCancelDelete}
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
              <Tooltip title='Add New User' arrow>
                <Button
                  variant='contained'
                  color='success'
                  startIcon={<i className='ri-add-line' />}
                  onClick={handleAdd}
                >
                  Add User
                </Button>
              </Tooltip>
            </Grid>
          </Grid>

          <DataTable
            data={users}
            columns={columns}
            loading={loading}
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            actionProps={{
              edit: { onClick: handleEdit },
              delete: { onClick: handleDeleteClick }
            }}
            showActions={true}
          />
        </>
      )}
    </>
  )
}

export default UserManagerPage
