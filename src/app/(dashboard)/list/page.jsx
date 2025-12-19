'use client'

import { useState, useEffect } from 'react'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import { toast } from 'react-toastify'
import DataTable from '@/views/common/DataTable'
import ConfirmDialog from '@components/Dialog'
import FormBuilder from '../form/components/form-builder'
import formService from '@/@services/formService'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import { getStatusCode, HttpStatus, getMessage } from '@/utils/getStatusCode'
import userService from '@/@services/userService'
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
const PAGE_SIZE = 10

const ExpandableDescription = ({ text }) => {
  return (
    <div
      style={{
        maxWidth: '750px',
        padding: '10px 12px',
        backgroundColor: '#f5f7fa',
        borderRadius: '8px',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        lineHeight: 1.6,
        color: text ? '#495057' : '#999',
        fontStyle: text ? 'normal' : 'italic'
      }}
    >
      {text || 'No description'}
    </div>
  )
}


const FormsManagerPage = () => {
  const [forms, setForms] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)

  const [builderOpen, setBuilderOpen] = useState(false)
  const [editFormId, setEditFormId] = useState(null)

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [selectedForm, setSelectedForm] = useState(null)

  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [selectedAssignForm, setSelectedAssignForm] = useState(null)
  const [allUsers, setAllUsers] = useState([])
 const [selectedUserId, setSelectedUserId] = useState([]);


  const loadForms = async (currentPage = 1) => {
    setLoading(true)
    try {
      const res = await formService.getAllForms(currentPage, PAGE_SIZE)
      const code = getStatusCode(res)
      const message = getMessage(res)

      if (code !== HttpStatus.OK) {
        toast.error(message || 'Failed to load forms')
        setForms([])
        setTotalPages(1)
        return
      }

      const data = res?.data?.data || []
      const totalRecords = res?.data?.totalRecords || data.length

      const mappedForms = data.map(f => ({
        id: f.formId,
        name: f.formTitle || 'Untitled Form',
        description: (
          <ExpandableDescription text={f.formDescription} />
        )
      }))

      setForms(mappedForms)
      setTotalPages(Math.max(Math.ceil(totalRecords / PAGE_SIZE), 1))
    } catch (error) {
      console.error('Load forms error:', error)
      toast.error(getMessage(error) || 'Failed to load forms')
      setForms([])
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadForms(page)
  }, [page])

  const handleAdd = () => {
    setEditFormId(null)
    setBuilderOpen(true)
  }

  const handleEdit = row => {
    setEditFormId(row.id)
    setBuilderOpen(true)
  }

  const handleDeleteClick = row => {
    setSelectedForm(row)
    setConfirmDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedForm) return
    try {
      const res = await formService.deleteForm(selectedForm.id)
      const code = getStatusCode(res)
      const message = getMessage(res) || 'Failed to delete form'

      if (code === HttpStatus.OK || code === HttpStatus.Deleted) {
        toast.success('Form deleted successfully')
        setConfirmDialogOpen(false)
        setSelectedForm(null)

        if (forms.length === 1 && page > 1) {
          setPage(prev => prev - 1)
        } else {
          loadForms(page)
        }
      } else {
        toast.error(`Error ${code}: ${message}`)
      }
    } catch (error) {
      const status = error?.response?.status
      const message = getMessage(error) || 'Failed to delete form'
      toast.error(`Server error ${status}: ${message}`)
      console.error('Delete form error:', error)
    }
  }

  const handleCancelDelete = () => {
    setConfirmDialogOpen(false)
    setSelectedForm(null)
  }
const handleAssignClick = async (form) => {
  setSelectedAssignForm(form);

  setSelectedUserId(form.assignedUsers || []); 
  setAssignDialogOpen(true); 

  const res = await userService.getUsers(1, 1000);
  setAllUsers(res?.data?.data || []);
};



 
const handleAssignSave = () => {
  if (!selectedUserId.length) {
    toast.error("Please select at least one user!");
    return;
  }

  console.log("Assigned Form:", selectedAssignForm);
  console.log("Assigned To Users:", selectedUserId.map(u => u.fullName));

  toast.success("Form assigned successfully!");
  setAssignDialogOpen(false);
};

  const columns = [
    { label: 'Name', field: 'name' },
    { label: 'Description', field: 'description' }
  ]

  return (
    <>
      {loading && (
        <div style={{ textAlign: 'center', marginTop: '100px' }}>
          <CircularProgress size={40} />
        </div>
      )}

      {!loading && (
        <>   
          <ConfirmDialog
            open={confirmDialogOpen}
            title='Delete Form'
            message={`Are you sure you want to delete "${selectedForm?.name}"?`}
            onConfirm={handleConfirmDelete}
            onCancel={handleCancelDelete}
          />
   
          <Dialog
            open={builderOpen}
            onClose={() => setBuilderOpen(false)}
            maxWidth='md'
            fullWidth
          >
            <DialogContent>
              <FormBuilder
                existingFormId={editFormId}
                onFormCreated={(result) => {
                  setBuilderOpen(false)
                  if (result?.cancelled) return
                  setPage(1)
                  loadForms(1)
                }}
                onClose={() => setBuilderOpen(false)}
              />
            </DialogContent>
          </Dialog>

         <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)}>
  <DialogContent>
    <h3 style={{ marginBottom: "10px" }}>Assign List</h3>

  <Autocomplete
  multiple
  options={allUsers}
  getOptionLabel={(option) => option.fullName}
  value={selectedUserId}
  onChange={(event, newValue) => setSelectedUserId(newValue)}
  disableClearable
  disableCloseOnSelect
  renderInput={(params) => (
    <TextField
      {...params}
      variant="outlined"
      label="Select Users"
      placeholder={selectedUserId.length === 0 ? "Choose users" : ""}
    />
  )}
  style={{ width: "100%" }}
/>


    <div style={{ marginTop: "20px", textAlign: "right" }}>
      <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
      <Button
        variant="contained"
        style={{ marginLeft: "10px" }}
        onClick={handleAssignSave}
      >
        Assign
      </Button>
    </div>
  </DialogContent>
</Dialog>
          <Grid container spacing={2} sx={{ mb: 2, alignItems: 'center' }}>
            <Grid item xs sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant='contained'
                color='success'
                onClick={handleAdd}
                startIcon={<i className='ri-add-line' />}
              >
                Add List
              </Button>
            </Grid>
          </Grid>

          {forms.length === 0 ? (
            <div style={{ textAlign: 'center', marginTop: '100px' }}>
              <h3>🚫 No forms found</h3>
            </div>
          ) : (
            <DataTable
              data={forms}
              columns={columns}
              loading={loading}
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              showActions
              actionProps={{
                edit: { onClick: handleEdit },
                delete: { onClick: handleDeleteClick },
                assign: { onClick: handleAssignClick }
              }}
            />
          )}
        </>
      )} 
    </>
  )
}

export default FormsManagerPage
