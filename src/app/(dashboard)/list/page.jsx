'use client'

import { useState, useEffect, useRef } from 'react'
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
import ViewDynamicForm from '../form/components/view-card'
import Card from '@mui/material/Card'
import NotificationBell from '../notification/page'
import { useSearchParams } from 'next/navigation';
import useAuth from '@/app/hooks/useAuth'
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
  const searchParams = useSearchParams();
  const assignmentId = searchParams.get('assignmentId'); 

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
  const [assignments, setAssignments] = useState([]);

  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedViewForm, setSelectedViewForm] = useState(null)
  const [selectedResponseId, setSelectedResponseId] = useState(null)
  const [assignLoading, setAssignLoading] = useState(false);
  const notificationRef = useRef(null) 
  const { role } = useAuth()
  const [responsesOpen, setResponsesOpen] = useState(false)
  const [responses, setResponses] = useState([])
  const [selectedFormId, setSelectedFormId] = useState(null)

  const [viewResponseOpen, setViewResponseOpen] = useState(false)
  const [selectedResponse, setSelectedResponse] = useState(null)
  const [deleteResponseOpen, setDeleteResponseOpen] = useState(false)
  const [responseToDelete, setResponseToDelete] = useState(null)
  const [responsesLoading, setResponsesLoading] = useState(false)
  const [assignedUsers, setAssignedUsers] = useState([])

  // ✅ Map assigned users with submission status
  const respondedUserIds = responses.map(r => r.submittedByUserId)
  const assignedUsersWithStatus = assignedUsers.map(a => {
    const userId = a.userId || a.user?.userId
    const isSubmitted = respondedUserIds.includes(userId)
    return {
      userId,
      name: a.user?.fullName || a.fullName,
      status: isSubmitted ? 'Submitted' : 'Pending'
    }
  })

  const loadForms = async (currentPage = 1) => {
    setLoading(true);
    try {
      let filteredForms = [];

      if (assignmentId) {
        const assignmentRes = await formService.getAssignmentById(assignmentId);
        const assignment = assignmentRes?.data?.data;
        if (assignment?.formId) {
          const formRes = await formService.getFormById(assignment.formId);
          if (formRes?.data?.data) filteredForms = [formRes.data.data]; 
        }
      } else {
        const res = await formService.getAllForms(currentPage, PAGE_SIZE);
        filteredForms = res?.data?.data || [];
      }

      const mappedForms = filteredForms.map(f => ({
        id: f.formId,
        name: f.formTitle || 'Untitled Form',
        description: <ExpandableDescription text={f.formDescription} />,
        lastResponseId: f.lastResponseId || null
      }));

      setForms(mappedForms);
      setTotalPages(Math.max(Math.ceil(filteredForms.length / PAGE_SIZE), 1));
    } catch (error) {
      console.error('Load forms error:', error);
      setForms([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadForms(page);
  }, [page, assignmentId]);

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

  const handleAssignSave = async () => {
    if (!selectedAssignForm?.id) return toast.error('Form is not selected');
    if (!selectedUserId.length) return toast.error('Please select at least one user');

    const payload = {
      formId: selectedAssignForm.id,
      assignedToUserIds: selectedUserId.map(user => user.userId)
    };

    try {
      setAssignLoading(true);
      const res = await formService.assignFormBulk(payload);
      if (res?.data?.success) {
        toast.success('Form assigned successfully', { autoClose: 3000 });
        setAssignDialogOpen(false);
        setSelectedUserId([]);
        setSelectedAssignForm(null);
        notificationRef.current?.reloadAssignments()
      } else {
        toast.error(res?.data?.message || 'Failed to assign form');
      }
    } catch (error) {
      console.error('Assign form error:', error);
      toast.error('Something went wrong while assigning form');
    } finally {
      setAssignLoading(false);
    }
  };

  const columns = [
    { label: 'Name', field: 'name' },
    { label: 'Description', field: 'description' }
  ]

  const handleViewClick = async (form) => {
    setViewDialogOpen(true)
    try {
      const formRes = await formService.getFormById(form.id)
      if (getStatusCode(formRes) !== HttpStatus.OK) return toast.error("Failed to load form data")

      const fullForm = formRes?.data?.data
      if (!fullForm) return toast.error("Form data is empty")

      const res = await formService.getAllResponses(form.id, 1, 50)
      setResponses(res?.data?.data || [])

      const latestResponseId = res?.data?.data?.length > 0
        ? res.data.data[0].responseId
        : null

      setSelectedViewForm(fullForm)
      setSelectedResponseId(latestResponseId)
    } catch (err) {
      toast.error("Error loading form")
      console.error(err)
    }
  }

  const handleClosePopup = () => {
    setViewDialogOpen(false)
    setSelectedViewForm(null)
    setSelectedResponseId(null)
  }

  const handleFormSubmitted = async (submittedAssignmentId) => {
    if (!submittedAssignmentId) return;
    try {
      await formService.updateAssignmentStatus(submittedAssignmentId, { status: 'Completed' });
      setAssignments(prev => prev.filter(a => a.assignmentId !== submittedAssignmentId));
      notificationRef.current?.reloadAssignments();
    } catch (err) {
      console.error('Failed to update assignment status:', err);
    }
  };

  const handleResponsesClick = async (form) => {
    setSelectedFormId(form.id)
    setResponses([])
    setAssignedUsers([])
    setResponsesOpen(true)
    setResponsesLoading(true)
    try {
      const res = await formService.getAllResponses(form.id, 1, 50)
      setResponses(res?.data?.data || [])

      const assignRes = await formService.getAssignedUsersByFormId(form.id)
      setAssignedUsers(assignRes?.data?.data || [])
    } catch (error) {
      console.error(error)
      toast.error('Failed to load responses')
    } finally {
      setResponsesLoading(false)
    }
  }

  const actionProps =
    role === 'Admin'
      ? {
          edit: { onClick: handleEdit },
          delete: { onClick: handleDeleteClick },
          assign: { onClick: handleAssignClick },
          view: { onClick: handleViewClick },
          responses: { onClick: handleResponsesClick } 
        }
      : { view: { onClick: handleViewClick } }

  const openSingleResponse = async (responseId) => {
    try {
      const res = await formService.getResponseById(responseId)
      setSelectedResponse(res?.data?.data)
      setViewResponseOpen(true)
    } catch (error) {
      toast.error('Failed to load response')
    }
  }

  const handleDeleteResponseClick = (response) => {
    setResponseToDelete(response)
    setDeleteResponseOpen(true)
  }

  const confirmDeleteResponse = async () => {
    if (!responseToDelete?.responseId) return console.log('❌ No responseId')
    try {
      await formService.deleteResponse(responseToDelete.responseId)
      toast.success('Response deleted successfully')
      setResponses(prev => prev.filter(r => r.responseId !== responseToDelete.responseId))
      setDeleteResponseOpen(false)
      setResponseToDelete(null)
    } catch (error) {
      console.error('❌ Delete error:', error)
      toast.error('Delete failed')
    }
  }

  return (
    <>
      {/* RESPONSES DIALOG */}
      <Dialog
        open={responsesOpen}
        onClose={() => setResponsesOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogContent>
          <Typography variant="h6">Form Responses</Typography>

        {/* 🔹 ASSIGNED USERS STATUS */}
<Card sx={{ mt: 2, p: 2 }}>
  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
    Assigned Users Status
  </Typography>
  {assignedUsers.length === 0 ? (
    <Typography sx={{ mt: 1 }}>No users assigned</Typography>
  ) : (
    assignedUsers
      .map(a => {
        const userId = a.userId || a.user?.userId;
        const isSubmitted = responses.some(r => r.submittedByUserId === userId);
        return {
          userId,
          name: a.user?.fullName || a.fullName,
          status: isSubmitted ? 'Submitted' : 'Pending'
        };
      })
      .sort((a, b) => {
        // Pending users first
        if(a.status === 'Pending' && b.status === 'Submitted') return -1;
        if(a.status === 'Submitted' && b.status === 'Pending') return 1;
        return 0;
      })
      .map((u, idx) => (
        <div
          key={idx}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '6px 0',
            borderBottom: '1px solid #eee'
          }}
        >
          <Typography>👤 {u.name}</Typography>
          <Typography
            sx={{
              fontWeight: 600,
              color: u.status === 'Submitted' ? 'green' : 'orange'
            }}
          >
            {u.status === 'Submitted' ? '✅ Submitted' : '⏳ Pending'}
          </Typography>
        </div>
      ))
  )}
</Card>


          {/* 🔹 RESPONSES LIST */}
          {responsesLoading ? (
            <div style={{ textAlign: 'center', marginTop: 30 }}>
              <CircularProgress size={30} />
              <Typography sx={{ mt: 1 }}>Loading responses...</Typography>
            </div>
          ) : responses.length === 0 ? (
            <Typography sx={{ mt: 2 }}>❌ No responses yet</Typography>
          ) : (
            responses.map(r => (
              <Card key={r.responseId} sx={{ mt: 2, p: 2 }}>
                <Typography>👤 {r.submittedByUserName}</Typography>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <Button variant="outlined" onClick={() => openSingleResponse(r.responseId)}>View</Button>
                  {role === 'Admin' && (
                    <Button color="error" onClick={() => handleDeleteResponseClick(r)}>Delete</Button>
                  )}
                </div>
              </Card>
            ))
          )}
        </DialogContent>
      </Dialog>

      {/* SINGLE RESPONSE VIEW */}
      <Dialog
        open={viewResponseOpen}
        onClose={() => setViewResponseOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogContent>
          <Typography variant="h6">
            Response by {selectedResponse?.submittedByUserName}
          </Typography>
          {selectedResponse?.responseValues?.map(field => (
            <div key={field.responseValueId} style={{ marginTop: 10 }}>
              <b>{field.fieldLabel}</b>
              <Typography>{field.fieldValue}</Typography>
            </div>
          ))}
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION */}
      <ConfirmDialog
        open={deleteResponseOpen}
        title="Delete Response"
        message="Are you sure you want to delete this response?"
        onConfirm={confirmDeleteResponse}
        onCancel={() => { setDeleteResponseOpen(false); setResponseToDelete(null) }}
      />

      {/* MAIN UI */}
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
            open={viewDialogOpen}
            onClose={handleClosePopup}
            maxWidth='md'
            fullWidth
          >
            <DialogContent>
              {selectedViewForm?.fields ? (
                <ViewDynamicForm
                  key={`${selectedViewForm.formId}-${selectedResponseId || 'new'}`} 
                  form={selectedViewForm}
                  responseId={selectedResponseId} 
                  onCancel={handleClosePopup}
                  onFormSubmitted={() => handleFormSubmitted(assignmentId)}
                />
              ) : (
                <Typography>Loading form</Typography>
              )}
            </DialogContent>
          </Dialog>

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
                  {assignLoading ? "Assigning..." : "Assign"}
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
              actionProps={actionProps}
              role={role}
            />
          )}
        </>
      )}
    </>
  )
}

export default FormsManagerPage
