'use client';

import { useState } from 'react';
import { createClient } from '@/shared/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      console.log('🔧 Initializing Supabase client...');
      const supabase = createClient();

      // Test connection first
      console.log('🔧 Testing Supabase connection...');
      // Note: We use Head request to profile just to check if the API is reachable
      const { error: pingError } = await supabase.from('profiles').select('count', { count: 'exact', head: true });

      if (pingError) {
        console.error('❌ Connection test failed:', pingError);
        // If the error is simply that the table doesn't exist or we don't have access, 
        // that's different from a network 'fetch failed'. 
        // However, if it's a fetch error, it will throw or show up here.
        if (pingError.message.includes('fetch failed') || pingError.code === 'PGRST301') {
          throw new Error(`Cannot connect to Supabase: ${pingError.message}`);
        }
        console.log('⚠️ Ping error (might be just permissions), continuing to signup...');
      }

      console.log('✅ Connection successful');
      console.log('🔧 Attempting signup for:', email);

      const { data, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signupError) {
        console.error('❌ Signup error:', signupError);
        throw new Error(signupError.message);
      }

      console.log('✅ Signup successful:', data);

      if (data?.user) {
        alert('Account created successfully!');
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error('❌ Full error:', err);
      const errorMessage = err.message || 'Unknown error occurred';
      setError(`Error: ${errorMessage}`);
      alert(`Signup failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold mb-2">Create Account</h1>
        <p className="text-gray-600 mb-6">Get started with your free account today</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              minLength={8}
              required
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Must be at least 8 characters with uppercase, lowercase, and numbers
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center mt-4 text-sm text-gray-600">
          Already have an account?{' '}
          <a href="/login" className="text-blue-600 hover:underline">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}
