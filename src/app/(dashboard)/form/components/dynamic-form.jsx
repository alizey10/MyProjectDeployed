'use client'

import formService from '@/@services/formService'
import { useState } from 'react'
import {
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography,
  Paper,
  Radio,
  Checkbox,
  FormGroup,
  FormControlLabel,
  RadioGroup
} from '@mui/material'
import { toast } from 'react-toastify'
import { getStatusCode, HttpStatus, getMessage } from '@/utils/getStatusCode'

export default function DynamicForm({ form, onSubmit }) {
  const [responses, setResponses] = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (fieldId, value, type) => {
    setResponses(prev => ({ ...prev, [fieldId]: { type, value } }))
  }

  const submitForm = async () => {
    if (loading) return
    setLoading(true)

    try {
      const formId = form?.formId || form?.id
      if (!formId) {
        toast.error('Form ID missing')
        return
      }

      const payload = {
        formId,
        responseValues: Object.entries(responses || {}).map(([fieldId, resp]) => {
          let value = resp?.value ?? resp
          if (Array.isArray(value)) value = value.join(', ')
          if (typeof value !== 'string') value = value?.toString() || ''
          return { fieldId, fieldValue: value }
        })
      }

      const res = await formService.submitForm(payload)

      const code = getStatusCode(res)
      const message = getMessage(res)

      if (code !== HttpStatus.OK && code !== HttpStatus.Created) {
        toast.error(message || 'Form submission failed')
        return
      }

      toast.success(message || 'Form submitted successfully')

      if (onSubmit) onSubmit(formId, responses)
    } catch (err) {
      toast.error(getMessage(err))
      console.error('Submit Error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant='h5' mb={2}>
        {form.formTitle?.trim() || 'Untitled Form'}
      </Typography>

      {form.formDescription && (
        <Typography variant='body2' mb={3}>
          {form.formDescription}
        </Typography>
      )}

      {(form.fields || []).map((field, idx) => {
        const fieldId = field.fieldId || idx
        const fieldLabel = field.fieldLabel?.trim() || 'Untitled Question'
        const placeholder = field.placeholder?.trim() || 'Your answer'

        let options = { rows: [], columns: [] }
        try {
          if (field.optionsJson) {
            const parsed = JSON.parse(field.optionsJson)
            if (parsed.rows && parsed.columns) options = parsed
            else if (Array.isArray(parsed)) options = { rows: [], columns: parsed }
            else if (parsed.grid?.rows && parsed.grid?.columns) options = parsed.grid
          }
        } catch (e) {
          console.warn('Options parse failed:', fieldLabel, e)
        }

        return (
          <Box key={fieldId} sx={{ mb: 3 }}>
            <Typography variant='subtitle1' mb={1}>
              {fieldLabel}
            </Typography>

            {field.fieldType === 'text' && (
              <TextField
                fullWidth
                variant='standard'
                placeholder={placeholder}
                value={responses[fieldId]?.value || ''}
                onChange={e => handleChange(fieldId, e.target.value, 'text')}
                required={field.isRequired}
              />
            )}

            {field.fieldType === 'paragraph' && (
              <TextField
                fullWidth
                multiline
                rows={3}
                variant='standard'
                placeholder={placeholder}
                value={responses[fieldId]?.value || ''}
                onChange={e => handleChange(fieldId, e.target.value, 'paragraph')}
                required={field.isRequired}
              />
            )}

            {field.fieldType === 'dropdown' && (
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>{fieldLabel}</InputLabel>
                <Select
                  value={responses[fieldId]?.value || ''}
                  onChange={e => handleChange(fieldId, e.target.value, 'dropdown')}
                >
                  {options.columns.map((opt, i) => (
                    <MenuItem key={i} value={opt}>
                      {opt}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {field.fieldType === 'multiple_choice' && (
              <RadioGroup
                value={responses[fieldId]?.value || ''}
                onChange={e => handleChange(fieldId, e.target.value, 'multiple_choice')}
              >
                {options.columns.map((opt, i) => (
                  <FormControlLabel key={i} value={opt} control={<Radio />} label={opt} />
                ))}
              </RadioGroup>
            )}

            {field.fieldType === 'checkbox' && (
              <FormGroup>
                {options.columns.map((opt, i) => {
                  const current = responses[fieldId]?.value || []
                  return (
                    <FormControlLabel
                      key={i}
                      control={
                        <Checkbox
                          checked={current.includes(opt)}
                          onChange={e => {
                            const updated = e.target.checked
                              ? [...current, opt]
                              : current.filter(x => x !== opt)
                            handleChange(fieldId, updated, 'checkbox')
                          }}
                        />
                      }
                      label={opt}
                    />
                  )
                })}
              </FormGroup>
            )}

          
          
          </Box>
        )
      })}

      <Button variant='contained' onClick={submitForm} disabled={loading}>
        {loading ? 'Submitting...' : 'Submit'}
      </Button>
    </Paper>
  )
}
