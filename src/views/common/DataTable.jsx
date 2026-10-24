'use client'

import React from 'react'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import Pagination from '@mui/material/Pagination'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import tableStyles from '@core/styles/table.module.css'
import useAuth from '@/app/hooks/useAuth'
const DataTable = ({
  columns = [],
  data = [],
  currentPage = 1,
  totalPages = 1,
  loading = false,
  actionProps = {
    edit: { onClick: () => {}, disabled: false },
    delete: { onClick: () => {}, disabled: false },
    activate: { onClick: () => {}, disabled: false }
  },
  
  onPageChange = () => {},
  sensorId = null,
  showActions = true,
    role, 
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
                {showActions && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {data?.length > 0 ? (
                data.map((item, index) => (
                  <tr key={index}>
                    {columns.map((column, columnIndex) => {
                      const value = item[column.field]

                      if ((column.field === 'branchIds' || column.field === 'branchNames') && value) {
                        const items = Array.isArray(value) ? value : value.split(',')
                        return (
                          <td key={columnIndex}>
                            <div
                              className='flex flex-col gap-1 custom-scroll'
                              style={{
                                maxHeight: '72px',
                                overflowY: 'auto'
                              }}
                            >
                              {items.map((chip, i) => (
                                <Chip
                                  key={i}
                                  label={chip.trim()}
                                  size='small'
                                  sx={{
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #e0e0e0',
                                    color: '#000000',
                                    fontSize: '0.75rem',
                                    borderRadius: '16px',
                                    width: 'fit-content'
                                  }}
                                />
                              ))}
                            </div>
                          </td>
                        )
                      }

                      if (column.field === 'dateCreated' && value) {
                        return (
                          <td key={columnIndex}>
                            <Chip
                              variant='tonal'
                              color='primary'
                              label={new Date(value).toLocaleDateString('en-US', {
                                month: '2-digit',
                                day: '2-digit',
                                year: 'numeric'
                              })}
                              size='small'
                            />
                          </td>
                        )
                      }

                      return (
                        <td key={columnIndex}>
                          <Typography component="div">{value}</Typography>
                        </td>
                      )
                    })}
                    {showActions && (
                      <td>
                        <div className='flex gap-2 items-center justify-between'>
                          {!sensorId && (
                           <div className='flex gap-2'>
  {/* Edit button */}
  {actionProps.edit && (
    <Tooltip
      title={actionProps.edit.disabled ? 'You are not authorized to edit' : ''}
      arrow
      disableHoverListener={!actionProps.edit.disabled}
    >
      <span>
        <Button
          variant='outlined'
          color='primary'
          size='small'
          onClick={() => actionProps.edit.onClick(item)}
          disabled={actionProps.edit.disabled}
        >
          Edit
        </Button>
      </span>
    </Tooltip>
  )}

  {/* Delete button */}
  {actionProps.delete && (
    <Tooltip
      title={actionProps.delete.disabled ? 'You are not authorized to delete' : ''}
      arrow
      disableHoverListener={!actionProps.delete.disabled}
    >
      <span>
        <Button
          variant='contained'
          color='error'
          size='small'
          onClick={() => actionProps.delete.onClick(item)}
          disabled={actionProps.delete.disabled}
        >
          Delete
        </Button>
      </span>
    </Tooltip>
  )}

 {/* Assign button */}
{sensorId == null && actionProps.assign && (
  <Tooltip>
    <span>
      <Button
        variant='outlined'
        color='secondary'
        size='small'
        onClick={() => actionProps.assign.onClick(item)}
      >
        Assign
      </Button>
    </span>
  </Tooltip>
)}

{/* View button */}
{sensorId == null && actionProps.view && (
  <Tooltip>
    <span>
      <Button
        variant='outlined'
        color='info'
        size='small'
        onClick={() => actionProps.view.onClick(item)}
      >
        View
      </Button>
    </span>
  </Tooltip>
)}
{/* Responses button (Admin only) */}
{role === 'Admin' && actionProps.responses && (
  <Button
    variant="outlined"
    color="success"
    size="small"
    onClick={() => actionProps.responses.onClick(item)}
  >
    Responses
  </Button>
)}

</div>

                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length + 1} className='text-center py-6'>
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <div className='flex justify-end px-6 py-4'>
        <Pagination count={totalPages} page={currentPage} onChange={(e, page) => onPageChange(page)} color='primary' />
      </div>
    </Card>
  )
}

export default DataTable  
