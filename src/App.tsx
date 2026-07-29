import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { FullPageLoader } from '@/components/ui/FullPageLoader'
import { LoginScreen } from '@/features/auth/LoginScreen'
import { AccessDenied } from '@/features/auth/AccessDenied'
import { DashboardView } from '@/features/dashboard/DashboardView'
import { LifecycleView } from '@/features/lifecycle/LifecycleView'
import { MilestonesView } from '@/features/milestones/MilestonesView'
import { DocumentsView } from '@/features/documents/DocumentsView'
import { RequestsView } from '@/features/requests/RequestsView'
import { useAuth } from '@/providers/AuthProvider'
import { useTenant } from '@/providers/TenantProvider'

export default function App() {
  const { session, initialising } = useAuth()
  const { client, loading, accessDenied } = useTenant()

  // Restoring a persisted session — avoids a login-screen flash on reload.
  if (initialising) return <FullPageLoader label="Restoring your session" />
  if (!session) return <LoginScreen />
  if (accessDenied) return <AccessDenied />
  if (loading || !client) return <FullPageLoader label="Loading your workspace" />

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<DashboardView />} />
        <Route path="/lifecycle" element={<LifecycleView />} />
        <Route path="/milestones" element={<MilestonesView />} />
        <Route path="/documents" element={<DocumentsView />} />
        <Route path="/requests" element={<RequestsView />} />
        {/* Legacy paths from the previous IA. */}
        <Route path="/staging" element={<Navigate to="/" replace />} />
        <Route path="/vault" element={<Navigate to="/documents" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  )
}
