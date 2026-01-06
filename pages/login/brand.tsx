import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/Input';

const BrandLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFormLoading(true);

    try {
      const result = await login(email, password, 'marketing');
      
      if (!result.success) {
        setError(result.error || 'Login failed. Please check your credentials.');
        return;
      }
      
      router.replace('/brand/dashboard');
    } catch (err: any) {
      console.warn('Unexpected login error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      if (mounted.current) setFormLoading(false);
    }
  };

  // Prevent state update on unmount
  const mounted = React.useRef(true);
  React.useEffect(() => {
    return () => { mounted.current = false; };
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-center relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Head>
        <title>Brand Login - Cehpoint</title>
      </Head>

      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-indigo-200/20 blur-3xl"></div>
          <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-purple-200/20 blur-3xl"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="text-center mb-8">
            <Link href="/">
                <h1 className="text-4xl font-extrabold cursor-pointer tracking-tight">
                    <span className="text-indigo-600">Cehpoint</span> <span className="text-gray-900">Brands</span>
                </h1>
            </Link>
          <p className="mt-3 text-gray-600 text-lg">
            Login to manage your campaigns
          </p>
        </div>
      </div>

      <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/80 backdrop-blur-lg py-10 px-8 shadow-2xl rounded-2xl border border-white/50">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <Input
              id="email"
              label="Company Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white/50"
            />

            <Input
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-white/50"
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white transform transition-all duration-200 hover:scale-[1.02] shadow-lg hover:shadow-indigo-500/30 font-medium py-2.5"
              isLoading={formLoading}
            >
              Login as Brand
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              New to Cehpoint?{' '}
              <Link href="/register/brand" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
                Register your Brand here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandLogin;
