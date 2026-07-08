import { Navigate } from 'react-router-dom'
import { AuthForm } from '../components/AuthForm'
import { AuthLayout } from '../components/AuthLayout'
import { useAuthSession } from '../hooks/use-auth-session'

export function RegisterScreen() {
  const { session, isLoading } = useAuthSession()

  if (!isLoading && session) return <Navigate to="/supervisor" replace />

  return (
    <AuthLayout>
      <AuthForm mode="register" />
    </AuthLayout>
  )
}
