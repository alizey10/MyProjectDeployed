'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Chip from '@mui/material/Chip'
import BaseService from '@/@services/baseService'
import useAuth from '@/app/hooks/useAuth'

function useSessionStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = typeof window !== 'undefined' ? sessionStorage.getItem(key) : null
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      return initialValue
    }
  })

  const setValue = value => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error('Error setting sessionStorage:', error)
    }
  }

  return [storedValue, setValue]
}

const languageData = ['English', 'Arabic', 'French', 'German', 'Portuguese']

const AccountDetails = () => {
  const router = useRouter()
  const { accessToken, user } = useAuth()
  const jwtService = new BaseService(accessToken)
  jwtService.controllerName = 'Auth'

  const [formData, setFormData] = useSessionStorage('accountForm', {
    firstName: '',
    lastName: '',
    email: '',
    organization: '',
    phoneNumber: '',
    address: '',
    state: '',
    zipCode: '',
    country: '',
    timezone: '',
    currency: ''
  })
  const [imgSrc, setImgSrc] = useSessionStorage('accountImg', '/images/avatars/1.png')
  const [fileInput, setFileInput] = useState('')
  const [language, setLanguage] = useSessionStorage('accountLang', [])

  useEffect(() => {
    if (!accessToken) return

    const fetchUser = async () => {
      try {
        const res = await jwtService.Get('me')
        const saved = res.data?.data || res.data

        const decodedUser = {
          id: user['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
          name: user['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
          email: user['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
          role: user['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
        }

        setFormData(prev => ({
          ...prev,
          firstName: saved?.firstName || decodedUser.name?.split(' ')[0] || '',
          lastName: saved?.lastName || decodedUser.name?.split(' ')[1] || '',
          email: saved?.email || decodedUser.email || prev.email || '',
          organization: saved?.organization || '',
          phoneNumber: saved?.phoneNumber || '',
          address: saved?.address || '',
          state: saved?.state || '',
          zipCode: saved?.zipCode || '',
          country: saved?.country || '',
          timezone: saved?.timezone || '',
          currency: saved?.currency || ''
        }))

        setLanguage(saved?.language || [])
        setImgSrc(saved?.avatar || '/images/avatars/1.png')
      } catch (error) {
        console.error('Failed to fetch user data', error)

        setFormData(prev => ({
          ...prev,
          email: user?.email || user?.data?.email || prev.email || ''
        }))
      }
    }

    fetchUser()
  }, [accessToken, user])

  const handleFormChange = (field, value) => setFormData({ ...formData, [field]: value })

  const handleFileChange = e => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => setImgSrc(reader.result)
      reader.readAsDataURL(file)
      setFileInput(e.target.value)
    }
  }

  const handleReset = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      organization: '',
      phoneNumber: '',
      address: '',
      state: '',
      zipCode: '',
      country: '',
      timezone: '',
      currency: ''
    })
    setLanguage([])
    setImgSrc('/images/avatars/1.png')
    setFileInput('')
  }

  const handleLanguageChange = e => setLanguage(e.target.value)
  const handleDeleteLang = value => setLanguage(lang => lang.filter(l => l !== value))

  const handleSave = async () => {
    const userToSave = { ...formData, language, avatar: imgSrc }

    try {
      router.push('/')
    } catch (error) {}
  }
  return (
    <Card className='shadow-lg rounded-2xl p-4'>
      <CardContent className='border-b pb-6 mb-6'>
         <div className='flex max-sm:flex-col items-center gap-6'>
          <img height={100} width={100} className='rounded-full shadow-md' src={imgSrc} alt='Profile' />
          <div className='flex flex-grow flex-col gap-3'>
            <div className='flex flex-col sm:flex-row gap-3'>
              <Button component='label' size='small' variant='contained'>
                Upload New Photo
                <input
                  hidden
                  type='file'
                  accept='image/png, image/jpeg'
                  value={fileInput}
                  onChange={handleFileChange}
                />
              </Button>
              <Button size='small' variant='outlined' color='error' onClick={() => setImgSrc('/images/avatars/1.png')}>
                Reset
              </Button>
            </div>
            <Typography variant='body2' className='text-gray-500'>
              Allowed JPG, GIF or PNG. Max size of 800K
            </Typography>
          </div>
        </div>
      </CardContent>

      <CardContent>
        <form onSubmit={e => e.preventDefault()}>
          <Grid container spacing={4}>
            {[
              { label: 'First Name', field: 'firstName', placeholder: 'John' },
              { label: 'Last Name', field: 'lastName', placeholder: 'Doe' },
              { label: 'Email', field: 'email', placeholder: 'john.doe@gmail.com' },
              { label: 'Organization', field: 'organization', placeholder: 'ThemeSelection' },
              { label: 'Phone Number', field: 'phoneNumber', placeholder: '+1 (234) 567-8901' },
              { label: 'Address', field: 'address', placeholder: 'Address' },
              { label: 'State', field: 'state', placeholder: 'New York' },
              { label: 'Zip Code', field: 'zipCode', placeholder: '123456', type: 'number' }
            ].map(item => (
              <Grid item xs={12} sm={6} key={item.field}>
                <TextField
                  fullWidth
                  label={item.label}
                  type={item.type || 'text'}
                  placeholder={item.placeholder}
                  value={formData[item.field]}
                  onChange={e => handleFormChange(item.field, e.target.value)}
                />
              </Grid>
            ))}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Country</InputLabel>
                <Select value={formData.country} onChange={e => handleFormChange('country', e.target.value)}>
                  <MenuItem value=''>Select Country</MenuItem>
                  <MenuItem value='USA'>USA</MenuItem>
                  <MenuItem value='UK'>UK</MenuItem>
                  <MenuItem value='Australia'>Australia</MenuItem>
                  <MenuItem value='Germany'>Germany</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Language</InputLabel>
                <Select
                  multiple
                  value={language}
                  onChange={handleLanguageChange}
                  renderValue={selected => (
                    <div className='flex flex-wrap gap-2'>
                      {selected.map(value => (
                        <Chip key={value} label={value} size='small' onDelete={() => handleDeleteLang(value)} />
                      ))}
                    </div>
                  )}
                >
                  {languageData.map(lang => (
                    <MenuItem key={lang} value={lang}>
                      {lang}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>TimeZone</InputLabel>
                <Select value={formData.timezone} onChange={e => handleFormChange('timezone', e.target.value)}>
                  <MenuItem value='gmt-10'>(GMT-10:00) Hawaii</MenuItem>
                  <MenuItem value='gmt-09'>(GMT-09:00) Alaska</MenuItem>
                  <MenuItem value='gmt-08'>(GMT-08:00) Pacific Time (US & Canada)</MenuItem>
                  <MenuItem value='gmt-08-baja'>(GMT-08:00) Tijuana, Baja California</MenuItem>
                  <MenuItem value='gmt-07'>(GMT-07:00) Chihuahua, La Paz, Mazatlan</MenuItem>
                  <MenuItem value='gmt-07-mt'>(GMT-07:00) Mountain Time (US & Canada)</MenuItem>
                  <MenuItem value='gmt-06'>(GMT-06:00) Central America</MenuItem>
                  <MenuItem value='gmt-06-ct'>(GMT-06:00) Central Time (US & Canada)</MenuItem>
                  <MenuItem value='gmt-06-mc'>(GMT-06:00) Guadalajara, Mexico City, Monterrey</MenuItem>
                  <MenuItem value='gmt-06-sk'>(GMT-06:00) Saskatchewan</MenuItem>
                  <MenuItem value='gmt-05'>(GMT-05:00) Bogota, Lima, Quito, Rio Branco</MenuItem>
                  <MenuItem value='gmt-05-et'>(GMT-05:00) Eastern Time (US & Canada)</MenuItem>
                  <MenuItem value='gmt-05-ind'>(GMT-05:00) Indiana (East)</MenuItem>
                  <MenuItem value='gmt-04'>(GMT-04:00) Atlantic Time (Canada)</MenuItem>
                  <MenuItem value='gmt-04-clp'>(GMT-04:00) Caracas, La Paz</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Currency</InputLabel>
                <Select value={formData.currency} onChange={e => handleFormChange('currency', e.target.value)}>
                  <MenuItem value=''>Select Currency</MenuItem>
                  <MenuItem value='USD'>USD</MenuItem>
                  <MenuItem value='EUR'>EUR</MenuItem>
                  <MenuItem value='Pound'>Pound</MenuItem>
                  <MenuItem value='Bitcoin'>Bitcoin</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} className='flex gap-4 justify-end mt-4'>
              <Button variant='contained' type='button' onClick={handleSave}>
                Save Changes
              </Button>
              <Button variant='outlined' type='button' color='secondary' onClick={handleReset}>
                Reset
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default AccountDetails
