import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // 1. Validate email format
    if (!validateEmail(email)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/request-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Something went wrong' });
        // Explicitly return to stop execution, avoiding 'throw' which triggers Next.js overlay in dev
        return;
      }

      setMessage({
        type: 'success',
        text: 'If this email is registered, we have sent a new password to it. Please check your inbox (and server logs for demo).',
      });
      console.log('Reset request successful:', data);
    } catch (error: any) {
      console.error('Password reset error:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to request password reset' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Head>
        <title>Forgot Password - Cehpoint</title>
      </Head>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Forgot your password?
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter your email address and we'll send you a new password.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {message && (
              <div
                className={`p-4 rounded-md ${
                  message.type === 'success'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {message.text}
              </div>
            )}

            <Input
              id="email"
              name="email"
              type="email"
              label="Email address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div>
              <Button type="submit" className="w-full" isLoading={loading}>
                Send New Password
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or return to</span>
              </div>
            </div>

            <div className="mt-6 flex justify-center gap-4">
               <Link href="/login" className="font-medium text-primary-600 hover:text-primary-500">
                  Log in
               </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
