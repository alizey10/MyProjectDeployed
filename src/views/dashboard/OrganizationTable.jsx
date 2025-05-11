// OrganizationDataTable.jsx
'use client'

import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import Pagination from '@mui/material/Pagination'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import tableStyles from '@core/styles/table.module.css'

const OrganizationDataTable = ({
  orgData = [],
  currentPage = 1,
  totalPages = 1,
  loading = false,
  onPageChange = () => {},
  onEdit = () => {},
  onDelete = () => {}
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
                <th>Organization</th>
                <th>Phone</th>
                <th>City</th>
                <th>Country</th>
                <th>Address</th>
                <th>PostCode</th>
                <th>Poc</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orgData?.map((org, index) => (
                <tr key={index}>
                  <td>
                    <div className='flex items-center gap-3'>
                      <div className='flex flex-col'>
                        <Typography color='text.primary' className='font-medium'>
                          {org.organizationName}
                        </Typography>
                      </div>
                    </div>
                  </td>
                  <td>
                    <Typography>{org.phone}</Typography>
                  </td>
                  <td>
                    <Typography>{org.city}</Typography>
                  </td>
                  <td>
                    <Typography>{org.country}</Typography>
                  </td>
                  <td>
                    <Typography>{org.address}</Typography>
                  </td>
                  <td>
                    <Typography>{org.postCode}</Typography>
                  </td>
                  <td>
                    <Typography>{org.poc}</Typography>
                  </td>
                  <td>
                    <Chip
                      variant='tonal'
                      color='primary'
                      label={new Date(org.dateCreated).toLocaleDateString()}
                      size='small'
                    />
                  </td>
                  <td>
                    <div className='flex gap-2'>
                      <Button size='small' variant='outlined' color='info' onClick={() => onEdit(org)}>
                        Edit
                      </Button>
                      <Button size='small' variant='outlined' color='error' onClick={() => onDelete(org)}>
                        Delete
                      </Button>
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

export default OrganizationDataTable
