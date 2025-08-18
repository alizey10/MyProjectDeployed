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
  onActivate = () => {},
  status = 'active',
  activatingId = null  
}) => {


  console.log('Current status:', status)

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
  <Box sx={{ display: 'flex', gap: 1 }}>
    {status === 'active' ? (
      <>
        <Button
          variant='outlined'
          color='primary'
          size='small'
          onClick={() => onEdit(item)}
        >
          Edit
        </Button>
        <Button
          variant='contained'
          color='error'
          size='small'
          onClick={() => onDelete(item)}
        >
          Delete
        </Button>
      </>
    ) : (
     <Button
  variant='contained'
  size='small'
  sx={{
    backgroundColor: 'orange',
    color: '#fff',
    '&:hover': {
      backgroundColor: '#ff9800'
    }
  }}
  onClick={() => onActivate(item)}
  disabled={activatingId === item.organizationId}  
>
  {activatingId === item.organizationId ? (
    <CircularProgress size={20} sx={{ color: '#fff' }} />
  ) : (
    'Activate'
  )}
</Button>
    )}
  </Box>
</td>

                </tr>
              ))}
              
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className='flex justify-end px-6 py-4'>
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={(e, page) => onPageChange(page)}
          color='primary'
        />
      </div>
    </Card>
  )
}

export default DataTable
