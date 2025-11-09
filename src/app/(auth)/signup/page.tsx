/**
 * Signup Page
 * User registration page
 */

import { SignupForm } from '@/features/auth/components/SignupForm'

export const metadata = {
  title: 'Sign Up - eBook Creator',
  description: 'Create your free eBook Creator account',
}

export default function SignupPage() {
  return <SignupForm />
}
