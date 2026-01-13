import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/Input';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const router = useRouter();
  const { login } = useAuth();

  // Prevent state update on unmount
  const mounted = React.useRef(true);
  React.useEffect(() => {
    return () => { mounted.current = false; };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFormLoading(true);

    try {
      const result = await login(email, password);
      
      if (!result.success) {
        setError(result.error || 'Login failed. Please check your credentials.');
        if (mounted.current) setFormLoading(false);
        return;
      }
      
      console.log('Login successful, redirecting...', result.role);
      
      if (result.role === 'admin') {
          router.replace('/admin/dashboard');
      } else {
          router.replace('/influencer/dashboard');
      }
    } catch (err: any) {
      console.warn('Unexpected login error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      if (mounted.current && error) setFormLoading(false);
      // Note: If success, we don't set loading false to avoid UI flicker before redirect
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <Head>
        <title>Login - Cehpoint</title>
      </Head>

      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[10%] left-[5%] w-[35%] h-[35%] rounded-full bg-orange-200/20 blur-3xl"></div>
          <div className="absolute bottom-[20%] right-[5%] w-[30%] h-[30%] rounded-full bg-amber-200/20 blur-3xl"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="text-center mb-8">
            <Link href="/">
                <h1 className="text-4xl font-extrabold cursor-pointer tracking-tight">
                    <span className="text-orange-600">Cehpoint</span> <span className="text-gray-900">Partners</span>
                </h1>
            </Link>
          <p className="mt-3 text-gray-600 text-lg">
            Login to your account
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
              label="Email Address"
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
              className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white transform transition-all duration-200 hover:scale-[1.02] shadow-lg hover:shadow-orange-500/30 font-medium py-2.5"
              isLoading={formLoading}
            >
              Login
            </Button>
            
            <div className="flex items-center justify-end">
              <Link href="/forgot-password" className="text-sm font-medium text-orange-600 hover:text-orange-500">
                Forgot your password?
              </Link>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Not joined yet?{' '}
              <Link href="/register" className="font-semibold text-orange-600 hover:text-orange-500 transition-colors">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
