/**
 * Login Page
 * User login page
 */

import { LoginForm } from '@/features/auth/components/LoginForm'

export const metadata = {
  title: 'Login - eBook Creator',
  description: 'Log in to your eBook Creator account',
}

export default function LoginPage() {
  return <LoginForm />
}
