'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import Divider from '@mui/material/Divider'


import Illustrations from '@components/Illustrations'
import Logo from '@components/layout/shared/Logo'


import { useImageVariant } from '@core/hooks/useImageVariant'
import BaseService from '@/@services/baseService'
import useAuth from '@/app/hooks/useAuth' 

const Register = ({ mode }) => {
  const router = useRouter()
  const { setAccessToken } = useAuth() 


  const [termsAccepted, setTermsAccepted] = useState(false)
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState({
    username: '',
    email: '',
    password: ''
  })


  const darkImg = '/images/pages/auth-v1-mask-dark.png'
  const lightImg = '/images/pages/auth-v1-mask-light.png'


  const authBackground = useImageVariant(mode, lightImg, darkImg)
  const handleClickShowPassword = () => setIsPasswordShown(show => !show)
  const handleChange = (field, value) => setFormData({ ...formData, [field]: value })

  const handleSignUp = async () => {
    let valid = true
    const newErrors = { username: '', email: '', password: '' }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required'
      valid = false
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
      valid = false
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
      valid = false
    }
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required'
      valid = false
    }
    if (!termsAccepted) {
      valid = false
    }

    setErrors(newErrors)
    if (!valid) return

    try {

      const api = new BaseService() 
      const response = await api.Post('Auth/Register', {
        firstName: formData.username,
        email: formData.email,
        password: formData.password,
        avatar: '/images/avatars/1.png'
      })
      
      if (response?.data?.data?.token) {
       
        setAccessToken(response.data.data.token)
        router.push('/dashboard')
      }
    } catch (err) {
      console.error('Registration failed', err)
    
    }
  }

  return (
    <div className='flex flex-col justify-center items-center min-bs-[100dvh] relative p-6'>
      <Card className='flex flex-col sm:is-[450px]'>
        <CardContent className='p-6 sm:!p-12'>
          <Link href='/' className='flex justify-center items-start mbe-6'>
            <Logo />
          </Link>
          <Typography variant='h4'>Adventure starts here 🚀</Typography>
          <div className='flex flex-col gap-5'>
            <Typography className='mbs-1'>Make your app management easy and fun!</Typography>
            <form noValidate autoComplete='off' onSubmit={e => e.preventDefault()} className='flex flex-col gap-5'>
              <TextField
                autoFocus
                fullWidth
                label='Username'
                value={formData.username}
                onChange={e => handleChange('username', e.target.value)}
                error={!!errors.username}
                helperText={errors.username}
              />
              <TextField
                fullWidth
                label='Email'
                value={formData.email}
                onChange={e => handleChange('email', e.target.value)}
                error={!!errors.email}
                helperText={errors.email}
              />
              <TextField
                fullWidth
                label='Password'
                type={isPasswordShown ? 'text' : 'password'}
                value={formData.password}
                onChange={e => handleChange('password', e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        size='small'
                        edge='end'
                        onClick={handleClickShowPassword}
                        onMouseDown={e => e.preventDefault()}
                      >
                        <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                error={!!errors.password}
                helperText={errors.password}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={termsAccepted}
                    onChange={e => setTermsAccepted(e.target.checked)}
                  />
                }
                label={
                  <>
                    <span>I agree to </span>
                    <Link href='/' onClick={e => e.preventDefault()} className='text-primary'>
                      privacy policy & terms
                    </Link>
                  </>
                }
              />
              {!termsAccepted && (
                <Typography variant="caption" color="error">
                  Please accept the terms & policy
                </Typography>
              )}
              <Button fullWidth variant='contained' type='button' onClick={handleSignUp}>
                Sign Up
              </Button>
              <div className='flex justify-center items-center flex-wrap gap-2'>
                <Typography>Already have an account?</Typography>
                <Typography component={Link} href='/login' color='primary'>
                  Sign in instead
                </Typography>
              </div>
              <Divider className='gap-3'>Or</Divider>
              <div className='flex justify-center items-center gap-2'>
                <IconButton size='small' className='text-facebook'>
                  <i className='ri-facebook-fill' />
                </IconButton>
                <IconButton size='small' className='text-twitter'>
                  <i className='ri-twitter-fill' />
                </IconButton>
                <IconButton size='small' className='text-github'>
                  <i className='ri-github-fill' />
                </IconButton>
                <IconButton size='small' className='text-googlePlus'>
                  <i className='ri-google-fill' />
                </IconButton>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
      <Illustrations maskImg={{ src: authBackground }} />
    </div>
  )
}

export default Register
