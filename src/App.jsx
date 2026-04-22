import React, { Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ROUTES } from './constants/routes'
import OwnerGuard from './guards/OwnerGuard'
import { AuthProvider } from './app/providers/AuthProvider'
import { SidebarProvider } from './layout/DashboardLayout'
import './layout/DashboardLayout.css'

// Public pages
const HomePage                  = React.lazy(() => import('./pages/HomePage'))
const MessListingPage           = React.lazy(() => import('./pages/MessListingPage'))
const MessDetailsPage           = React.lazy(() => import('./pages/MessDetailsPage'))
const LoginPage                 = React.lazy(() => import('./pages/LoginPage'))

// Portal pages
const OwnerDashboardPage        = React.lazy(() => import('./pages/OwnerDashboardPage'))
const OwnerMessManagementPage   = React.lazy(() => import('./pages/OwnerMessManagementPage'))
const OwnerRegisterMessPage     = React.lazy(() => import('./pages/OwnerRegisterMessPage'))

const OnboardingPage            = React.lazy(() => import('./pages/OnboardingPage'))

// Loading fallback
const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--primary)', fontSize: '1.2rem', fontWeight: 'bold' }}>
    Loading Tiffo...
  </div>
)

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* ── Public Routes ── */}
              <Route path={ROUTES.HOME}               element={<HomePage />} />
              <Route path={ROUTES.MESSES}             element={<MessListingPage />} />
              <Route path={ROUTES.MESS_DETAILS(':id')} element={<MessDetailsPage />} />
              <Route path={ROUTES.LOGIN}              element={<LoginPage />} />
              <Route path={ROUTES.ONBOARDING}         element={<OnboardingPage />} />


              {/* ── Owner Portal Routes (Protected) ── */}
              <Route path="/owner/*" element={
                <OwnerGuard>
                  <SidebarProvider>
                    <Routes>
                      <Route path="dashboard" element={<OwnerDashboardPage />} />
                      <Route path="manage-mess" element={<OwnerMessManagementPage />} />
                      <Route path="register" element={<OwnerRegisterMessPage />} />
                    </Routes>
                  </SidebarProvider>
                </OwnerGuard>
              } />

              {/* ── 404 ── */}
              <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
            </Routes>
          </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
