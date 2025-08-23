'use client'

import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import Pagination from '@mui/material/Pagination'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'

import tableStyles from '@core/styles/table.module.css'

const DataTable = ({
  columns = [],
  data = [],
  currentPage = 1,
  totalPages = 1,
  loading = false,
  onPageChange = () => {},
  actionProps = {
    edit: { onClick: () => {}, disabled: false },
    delete: { onClick: () => {}, disabled: false },
    activate: { onClick: () => {}, disabled: false }
  },
  status = 'active',
  activatingId = null,
  showActions = true
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

                  {showActions && (
                    <td>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {status === 'active' ? (
                          <>
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
                          </>
                        ) : (
                          <Tooltip
                            title={actionProps.activate.disabled ? 'You are not authorized to activate' : ''}
                            arrow
                            disableHoverListener={!actionProps.activate.disabled}
                          >
                            <span>
                              <Button
                                variant='contained'
                                size='small'
                                sx={{
                                  backgroundColor: 'orange',
                                  color: '#fff',
                                  '&:hover': { backgroundColor: '#ff9800' }
                                }}
                                onClick={() => actionProps.activate.onClick(item)}
                                disabled={actionProps.activate.disabled || activatingId === item.organizationId}
                              >
                                {activatingId === item.organizationId ? (
                                  <CircularProgress size={20} sx={{ color: '#fff' }} />
                                ) : (
                                  'Activate'
                                )}
                              </Button>
                            </span>
                          </Tooltip>
                        )}
                      </Box>
                    </td>
                  )}
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
