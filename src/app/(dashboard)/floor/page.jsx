'use client'

import { useState, useEffect } from 'react'

import { toast } from 'react-toastify'

import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'

import DataTable from '@/views/floor/DataTable'
import DialogBox from '@/views/common/DialogBox'
import floorService from '@/@services/floorService'

const PAGE_SIZE = 10

const FloorPage = () => {
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [isCreateMode, setIsCreateMode] = useState(false)
  const [open, setOpen] = useState(false)
  const [floor, setFloor] = useState([])

  const handleAdd = () => {
    setOpen(true)
  }

  const handleSaveEdit = async updatedData => {
    let success
    const result = await floorService.createFloor(JSON.stringify(updatedData.floorName))
    if (result?.status === 201) toast.success('Record Saved')
    else if (result?.status === 500) toast.info('Internal Server Error')
    toast.error(result?.response?.data)

    success = !!result
    setOpen(false)

    if (success) {
      await loadFloor(page)
    }
  }

  const loadFloor = async currentPage => {
    setLoading(true)
    const data = await floorService.getFloor(currentPage, PAGE_SIZE)

    if (data) {
      setFloor(data.data)
      let _totalRecords = data.data[0]?.totalRecord

      setTotalPages(Math.ceil(_totalRecords / PAGE_SIZE) || 0)
    }

    setLoading(false)
  }

  useEffect(() => {
    loadFloor(page)
  }, [page])

  // Define columns for DataTable
  const columns = [{ label: 'Floor Name', field: 'floorSectionName' }]

  // Define fields for DialogBox
  const fields = [{ label: 'Floor Name', name: 'floorName', placeholder: 'First Floor', icon: '🏢', required: true }]

  return (
    <>
      <DialogBox
        title={'Add Floor'}
        open={open}
        onClose={() => {
          setOpen(false)
        }}
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
            Floor
          </Button>
        </Grid>
        <Grid item xs={12}>
          <DataTable
            columns={columns}
            data={floor}
            currentPage={page}
            totalPages={totalPages}
            loading={loading}
            onPageChange={newPage => setPage(newPage)}
          />
        </Grid>
      </Grid>
    </>
  )
}

export default FloorPage
