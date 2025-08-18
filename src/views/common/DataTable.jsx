'use client'

import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import Pagination from '@mui/material/Pagination'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'

import tableStyles from '@core/styles/table.module.css'

const DataTable = ({
  columns = [],
  data = [],
  currentPage = 1,
  totalPages = 1,
  loading = false,
  onPageChange = () => {},
  onEdit = () => {},
  onDelete = () => {},
 
    sensorId = null,
}) => {
  return (
    <Card>
      <div className='overflow-x-auto relative'>
        {loading ? (
          <Box className='flex items-center justify-center min-h-[300px]'>
            <CircularProgress size={40} />
          </Box>
        ) : (
          <table className={tableStyles.table}>
            <thead>
              <tr>
                {columns.map((column, index) => (
                  <th key={index}>{column.label}</th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((item, index) => (
                <tr key={index}>
                  {columns.map((column, columnIndex) => (
                    <td key={columnIndex}>
                      {column.field === 'dateCreated' ? (
                        <Chip
                          variant='tonal'
                          color='primary'
                          label={new Date(item[column.field]).toLocaleDateString('en-US', {
                            month: '2-digit',
                            day: '2-digit',
                            year: 'numeric'
                          })}
                          size='small'
                        />
                      ) : (
                        <Typography>{item[column.field]}</Typography>
                      )}
                    </td>
                  ))}
                <td>
  <div className='flex gap-2 items-center justify-between'>
    {!sensorId && (
      <div className='flex gap-2'>
   
        <Button
          size='small'
          variant='outlined'
            color='primary'
          onClick={() => onEdit(item)}
        >
          Edit
        </Button>

        <Button
          size='small'
          variant='contained'
          color='error'
          onClick={() => onDelete(item)}
        >
          Delete
        </Button>
      </div>
    )}

    
  </div>
</td>


                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className='flex justify-end px-6 py-4'>
        <Pagination count={totalPages} page={currentPage} onChange={(e, page) => onPageChange(page)} color='primary' />
      </div>
    </Card>
  )
}

export default DataTable
