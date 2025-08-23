import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { PermissionsProvider } from '../hooks/permissionContext'

// Layout Imports
import LayoutWrapper from '../../@layouts/LayoutWrapper'
import VerticalLayout from '../../@layouts/VerticalLayout'

// Component Imports
import Providers from '@/components/Providers'
import Navigation from '@components/layout/vertical/Navigation'
import Navbar from '@components/layout/vertical/Navbar'
import VerticalFooter from '@components/layout/vertical/Footer'

import AuthGuard from '@/components/AuthGuard'

const Layout = ({ children }) => {
  const direction = 'ltr'

  return (
    <Providers direction={direction}>
      <PermissionsProvider>
        <AuthGuard>
          <LayoutWrapper
            verticalLayout={
              <VerticalLayout navigation={<Navigation />} navbar={<Navbar />} footer={<VerticalFooter />}>
                <ToastContainer position='top-right' autoClose={3000} hideProgressBar />
                {children}
              </VerticalLayout>
            }
          />
        </AuthGuard>
      </PermissionsProvider>
    </Providers>
  )
}

export default Layout
