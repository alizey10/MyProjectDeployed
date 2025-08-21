'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import CircularProgress from '@mui/material/CircularProgress'
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
import { useSessionStorage } from '@/app/hooks/session'
import Logo from '@components/layout/shared/Logo'
import Illustrations from '@components/Illustrations'
import themeConfig from '@configs/themeConfig'
import { useImageVariant } from '@core/hooks/useImageVariant'
import AuthService from '@/views/authservice'
import useAuth from '@/app/hooks/useAuth'

const authService = new AuthService()

const Login = ({ mode }) => {
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({ email: '', password: '' })
  const [apiError, setApiError] = useState('')
  const router = useRouter()
  const { setAccessToken } = useAuth()
  const [loading, setLoading] = useState(false)
  const [sessionAccess, setSessionAccess] = useSessionStorage('accessToken', null)
  const [sessionRefresh, setSessionRefresh] = useSessionStorage('refreshToken', null)

  const handleClickShowPassword = () => setIsPasswordShown(prev => !prev)
  const handleChange = (field, value) => setFormData({ ...formData, [field]: value })

  const handleSubmit = async e => {
    e.preventDefault()
    setApiError('')
    setLoading(true)

    let valid = true
    const newErrors = { email: '', password: '' }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
      valid = false
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
      valid = false
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required'
      valid = false
    }

    setErrors(newErrors)
    if (!valid) {
      setLoading(false)
      return
    }

    try {
      const res = await authService.login(formData.email, formData.password)
      if (res.success) {
        setSessionAccess(res.accessToken)
        setSessionRefresh(res.refreshToken)
        setAccessToken(res.accessToken)

        router.replace('/')
      } else {
        setApiError(res.message)
      }
    } catch (err) {
      const backendMessage = err?.response?.data?.message
      setApiError(backendMessage || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex flex-col justify-center items-center min-bs-[100dvh] relative p-6'>
      <Card className='flex flex-col sm:is-[450px]'>
        <CardContent className='p-6 sm:!p-12'>
          <Link href='/' className='flex justify-center mbe-6'>
            <Logo />
          </Link>

          <div className='flex flex-col gap-5'>
            <div>
              <Typography variant='h4'>{`Welcome to ${themeConfig.templateName}!👋🏻`}</Typography>
              <Typography className='mbs-1'>Please sign-in to your account and start the adventure</Typography>
            </div>

            {apiError && <Typography sx={{ color: 'red', mt: 1 }}>{apiError}</Typography>}

            <form noValidate autoComplete='off' onSubmit={handleSubmit} className='flex flex-col gap-5'>
              <TextField
                autoFocus
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

              {/* <div className='flex justify-between items-center gap-x-3 gap-y-1 flex-wrap'>
                <FormControlLabel control={<Checkbox />} label='Remember me' />
                <Typography className='text-end' color='primary' component={Link} href='/forgot-password'>
                  Forgot password?
                </Typography>
              </div> */}

              <Button
                fullWidth
                variant='contained'
                type='submit'
                disabled={loading} // disable during loading
              >
                {loading ? <CircularProgress size={24} color='inherit' /> : 'Log In'}
              </Button>

              {/* <div className='flex justify-center items-center flex-wrap gap-2'>
                <Typography>New on our platform?</Typography>
                <Typography component={Link} href='/register' color='primary' className='underline cursor-pointer'>
                  Create an account
                </Typography>
              </div>

              <Divider className='my-2'>or</Divider>

              <div className='flex justify-center items-center gap-2'>
                <IconButton size='small' className='text-facebook'><i className='ri-facebook-fill' /></IconButton>
                <IconButton size='small' className='text-twitter'><i className='ri-twitter-fill' /></IconButton>
                <IconButton size='small' className='text-github'><i className='ri-github-fill' /></IconButton>
                <IconButton size='small' className='text-googlePlus'><i className='ri-google-fill' /></IconButton>
              </div> */}
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Login
