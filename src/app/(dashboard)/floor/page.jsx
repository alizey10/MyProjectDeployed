'use client'

import { useState, useEffect } from 'react'

import { toast } from 'react-toastify'

import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'

import DataTable from '@/views/floor/DataTable'
import DialogBox from '@/views/common/DialogBox'
import floorService from '@/@services/floorService'
import { getStatusCode, getMessage, HttpStatus } from '@/utils/getStatusCode'

const PAGE_SIZE = 10

const FloorPage = () => {
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [floor, setFloor] = useState([])

  const handleAdd = () => {
    setOpen(true)
  }

  const handleSaveEdit = async updatedData => {
    setLoading(true)
    let success = false

    try {
      const result = await floorService.createFloor(JSON.stringify(updatedData.floorName))
      const code = getStatusCode(result)

      if (code === HttpStatus.Created) {
        toast.success('Record Saved')
        success = true
      } else {
        toast.error(getMessage(result))
      }
    } catch (error) {
      toast.error(getMessage(error))
      console.error('Error creating floor:', error)
    } finally {
      setOpen(false)
      setLoading(false)

      if (success) {
        await loadFloor(page)
      }
    }
  }

  const loadFloor = async currentPage => {
    setLoading(true)

    try {
      const response = await floorService.getFloor(currentPage, PAGE_SIZE)

      if (!response?.data?.success) {
        toast.error(getMessage(response))
        return
      }

      const floors = response.data.data || []
      setFloor(floors)

      const totalRecords = floors[0]?.totalRecord || 0
      setTotalPages(Math.ceil(totalRecords / PAGE_SIZE))
    } catch (error) {
      toast.error(getMessage(error))
      console.error('Error loading floors:', error)
    } finally {
      setLoading(false)
    }
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
