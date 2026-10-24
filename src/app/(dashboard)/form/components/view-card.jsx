'use client'

import { useState, useEffect } from 'react'
import formService from '@/@services/formService'
import { toast } from 'react-toastify'
import {
  Box,
  Typography,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Paper,
  FormControl,
  Select,
  MenuItem,
  Button,
  CircularProgress
} from '@mui/material'

const normalize = val => {
  const result = typeof val === 'string' ? val.trim() : String(val ?? '').trim()
  return result
}

export default function ViewDynamicForm({ form = {}, responseId = null, onCancel , onFormSubmitted}) {
  const [responses, setResponses] = useState({})
  const [loading, setLoading] = useState(false)
  const [currentResponseId, setCurrentResponseId] = useState(responseId)

  useEffect(() => {
    const fetchResponse = async () => {
      if (!form?.fields?.length) return

      if (!currentResponseId) {
        const defaults = {}
        form.fields.forEach(f => {
          const fid = String(f.fieldId)
          switch (f.fieldType) {
            case 'checkbox':
              defaults[fid] = []
              break
            case 'checkbox_grid':
            case 'multiple_choice_grid':
              defaults[fid] = {}
              break
            default:
              defaults[fid] = ''
          }
        })
        setResponses(defaults)
        return
      }

      setLoading(true)
      try {
        const res = await formService.getResponseById(currentResponseId)
        const fetchedValues = {}

        res?.data?.data?.responseValues?.forEach(rv => {
          let field =
            form.fields.find(f => String(f.fieldId) === String(rv.fieldId)) ||
            form.fields.find(f => f.fieldLabel === rv.fieldLabel)

          if (!field) return

          let value
          switch (field.fieldType) {
            case 'checkbox':
              value = rv.fieldValue ? rv.fieldValue.split(',').map(v => normalize(v)) : []
              break
            case 'checkbox_grid': {
              const gridObj = {}
              rv.fieldValue?.split(';').forEach(rowStr => {
                const [row, cols] = rowStr.split(':')
                if (row && cols) gridObj[normalize(row)] = cols.split(',').map(c => normalize(c))
              })
              value = gridObj
              break
            }
            case 'multiple_choice_grid': {
              const mcGrid = {}
              rv.fieldValue?.split(',').forEach(rc => {
                const [row, col] = rc.split(':')
                if (row && col) mcGrid[normalize(row)] = normalize(col)
              })
              value = mcGrid
              break
            }
            default:
              value = normalize(rv.fieldValue ?? '')
          }

          fetchedValues[String(field.fieldId)] = value
        })
        form.fields.forEach(field => {
          const fid = String(field.fieldId)
          if (!(fid in fetchedValues)) {
            switch (field.fieldType) {
              case 'checkbox':
                fetchedValues[fid] = []
                break
              case 'checkbox_grid':
              case 'multiple_choice_grid':
                fetchedValues[fid] = {}
                break
              default:
                fetchedValues[fid] = ''
            }
          }
        })

        setResponses(fetchedValues)
      } catch (err) {
        console.error('Error fetching response:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchResponse()
  }, [currentResponseId, form?.fields])

  const handleChange = (fieldId, value) => {
    setResponses(prev => ({ ...prev, [String(fieldId)]: value }))
  }

  const handleClear = () => {
    const cleared = {}
    form?.fields?.forEach(f => {
      const fid = String(f.fieldId)
      switch (f.fieldType) {
        case 'checkbox':
          cleared[fid] = []
          break
        case 'checkbox_grid':
        case 'multiple_choice_grid':
          cleared[fid] = {}
          break
        default:
          cleared[fid] = ''
      }
    })
    setResponses(cleared)
  }

  const parseOptions = json => {
    try {
      const parsed = JSON.parse(json)
      if (parsed.rows && parsed.columns) return parsed
      if (parsed.grid?.rows && parsed.grid?.columns) return parsed.grid
      if (Array.isArray(parsed)) return { columns: parsed, rows: [] }
    } catch (err) {
      console.warn('Error parsing optionsJson:', json, err)
    }
    return { rows: [], columns: [] }
  }
  const handleSubmit = async () => {
  if (!form?.formId) return

  const responseValues = (form?.fields || [])
    .map(field => {
      const value = responses[String(field.fieldId)]

      if (
        value === undefined ||
        value === null ||
        (Array.isArray(value) && value.length === 0) ||
        (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0)
      ) {
        return null
      }

      switch (field.fieldType) {
        case 'multiple_choice_grid':
          return {
            fieldId: field.fieldId,
            fieldValue: Object.entries(value)
              .map(([r, c]) => `${r}:${c}`)
              .join(',')
          }

        case 'checkbox_grid':
          return {
            fieldId: field.fieldId,
            fieldValue: Object.entries(value)
              .map(([r, arr]) => `${r}:${arr.join(',')}`)
              .join(';')
          }

        case 'checkbox':
          return {
            fieldId: field.fieldId,
            fieldValue: value.join(',')
          }

        default:
          return {
            fieldId: field.fieldId,
            fieldValue: String(value)
          }
      }
    })
    .filter(Boolean)

  const payload = {
    formId: form.formId,
    responseValues
  }

  setLoading(true)

  try {
    const res = await formService.submitForm(payload)

    if (res?.data?.success) {
    handleClear()
    setCurrentResponseId(null)
    toast.success('Form submitted successfully!', {
      autoClose: 3000,
      closeOnClick: true,
      pauseOnHover: true
    })
    onFormSubmitted?.(form.assignmentId || form?.assignmentId || null) 
    onCancel?.()
  }else {
      toast.error(res?.data?.message || 'Failed to submit form!')
    }
  } catch (err) {
    console.error('Error submitting form:', err)

    toast.error('Error submitting form!')
  } finally {
    setLoading(false)
  }
}
  if (!form?.fields || loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 10 }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}></Typography>
      </Box>
    )
  }

  return (
    <Paper sx={{ p: 4, mt: 3, borderRadius: 2, maxWidth: 800, margin: 'auto', bgcolor: '#fafafa' }}>
      <Typography variant='h4' mb={2} sx={{ fontWeight: 600 }}>
        {form?.formTitle || 'Untitled Form'}
      </Typography>

      {form?.formDescription && (
        <Typography variant='body1' mb={3} sx={{ color: '#555' }}>
          {form.formDescription}
        </Typography>
      )}

      {(form?.fields || []).map((field, idx) => {
        const fieldId = String(field.fieldId || idx)
        const options = field.optionsJson ? parseOptions(field.optionsJson) : { rows: [], columns: [] }
        const normalizedColumns = options.columns.map(opt => normalize(opt))
        const normalizedRows = options.rows.map(r => normalize(r))

        const value = responses.hasOwnProperty(fieldId)
          ? responses[fieldId]
          : field.fieldType === 'checkbox'
            ? []
            : field.fieldType === 'checkbox_grid' || field.fieldType === 'multiple_choice_grid'
              ? {}
              : ''

        return (
          <Box
            key={fieldId}
            sx={{
              mb: 3,
              p: 3,
              borderRadius: 2,
              bgcolor: '#fff',
              boxShadow: '0px 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e0e0e0'
            }}
          >
            <Typography variant='subtitle1' mb={1} sx={{ fontWeight: 500 }}>
              {field.fieldLabel || 'Untitled Question'}
            </Typography>

            {field.fieldType === 'text' && (
              <TextField
                fullWidth
                variant='outlined'
                placeholder='Your answer'
                value={value}
                onChange={e => handleChange(fieldId, e.target.value)}
              />
            )}
            {field.fieldType === 'paragraph' && (
              <TextField
                fullWidth
                multiline
                rows={4}
                variant='outlined'
                placeholder='Your answer'
                value={value}
                onChange={e => handleChange(fieldId, e.target.value)}
              />
            )}

            {field.fieldType === 'dropdown' && (
              <FormControl fullWidth variant='outlined' sx={{ mt: 1 }}>
                <Select value={normalize(value || '')} onChange={e => handleChange(fieldId, e.target.value)}>
                  {normalizedColumns.map((opt, i) => (
                    <MenuItem key={i} value={opt}>
                      {opt}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {field.fieldType === 'multiple_choice' && (
              <RadioGroup value={normalize(value || '')} onChange={e => handleChange(fieldId, e.target.value)}>
                {normalizedColumns.map((opt, i) => (
                  <FormControlLabel key={i} value={opt} control={<Radio />} label={opt} />
                ))}
              </RadioGroup>
            )}

            {field.fieldType === 'checkbox' && (
              <FormGroup>
                {normalizedColumns.map((opt, i) => (
                  <FormControlLabel
                    key={i}
                    control={
                      <Checkbox
                        checked={Array.isArray(value) ? value.includes(opt) : false}
                        onChange={e => {
                          let newValues = Array.isArray(value) ? [...value] : []
                          if (e.target.checked) newValues.push(opt)
                          else newValues = newValues.filter(v => v !== opt)
                          handleChange(fieldId, newValues)
                        }}
                      />
                    }
                    label={opt}
                  />
                ))}
              </FormGroup>
            )}

            {(field.fieldType === 'multiple_choice_grid' || field.fieldType === 'checkbox_grid') && (
              <Box mt={2}>
                <Box display='flex' mb={1} sx={{ fontWeight: 500 }}>
                  <Box sx={{ width: 150 }} />
                  {normalizedColumns.map((col, cIdx) => (
                    <Box key={cIdx} sx={{ width: 150, textAlign: 'center' }}>
                      {col}
                    </Box>
                  ))}
                </Box>
                {normalizedRows.map((row, rIdx) => {
                  const stored = value || {}
                  return (
                    <Box key={rIdx} display='flex' alignItems='center' mb={1}>
                      <Box sx={{ width: 150 }}>{row}</Box>
                      {normalizedColumns.map((col, cIdx) => {
                        const isChecked =
                          field.fieldType === 'checkbox_grid' ? (stored[row] || []).includes(col) : stored[row] === col
                        return (
                          <Box key={cIdx} sx={{ width: 150, textAlign: 'center' }}>
                            {field.fieldType === 'multiple_choice_grid' ? (
                              <Radio
                                checked={isChecked}
                                onChange={() => handleChange(fieldId, { ...stored, [row]: col })}
                              />
                            ) : (
                              <Checkbox
                                checked={isChecked}
                                onChange={e => {
                                  let rowValues = stored[row] || []
                                  if (e.target.checked) rowValues.push(col)
                                  else rowValues = rowValues.filter(v => v !== col)
                                  handleChange(fieldId, { ...stored, [row]: rowValues })
                                }}
                              />
                            )}
                          </Box>
                        )
                      })}
                    </Box>
                  )
                })}
              </Box>
            )}
          </Box>
        )
      })}

      <Box display='flex' justifyContent='space-between' mt={3}>
        <Button variant='outlined' onClick={handleClear} disabled={loading}>
          Clear
        </Button>
        <Box display='flex' gap={2}>
          <Button variant='outlined' onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button variant='contained' color='primary' onClick={handleSubmit} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit'}
          </Button>
        </Box>
      </Box>
    </Paper>
  )
}
