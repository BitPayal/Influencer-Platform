
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { supabase } from '@/lib/supabase';

const BrandRegister: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    companyName: '',
    website: '',
    industry: '',
    description: '',
    location: '',
  });

  // Prevent state update on unmount
  const mounted = React.useRef(true);
  useEffect(() => {
    return () => { mounted.current = false; };
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Sign up with Timeout
      const signUpPromise = supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      const { data: signUpData, error: signUpError } = await Promise.race([
        signUpPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Sign Up timed out. Please check your internet connection.')), 30000))
      ]) as any;

      if (signUpError) {
        const msg = signUpError.message || "Sign up failed";
        if (msg.toLowerCase().includes("already registered")) {
             alert("This email is already registered. Please sign in.");
             router.push('/login');
             return;
        } else {
             throw new Error(msg);
        }
      }

      const sessionUser = signUpData?.user;
      if (!sessionUser) {
           throw new Error("Registration failed. Please check your email for a confirmation link or try again.");
      }
      
      const userId = sessionUser.id;

      // 3. User table entry (Upsert to avoid hang on select)
      console.log('Upserting into users table...');
      const upsertUserPromise = (supabase.from('users') as any).upsert({
          id: userId,
          email: formData.email,
          role: 'marketing', // Brand role
      }, { onConflict: 'id' });

      const { error: userError } = await Promise.race([
          upsertUserPromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error('User profile creation timed out')), 20000))
      ]) as any;

      if (userError) throw new Error(userError.message || "Failed to create user profile");

      // 4. Brands table entry
      const insertBrandPromise = (supabase.from('brands') as any).insert({
          user_id: userId,
          company_name: formData.companyName,
          website: formData.website,
          industry: formData.industry,
          description: formData.description,
          location: formData.location,
      });

      const { error: brandError } = await Promise.race([
          insertBrandPromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Brand profile creation timed out')), 20000))
      ]) as any;

      if (brandError) throw new Error(brandError.message || "Failed to create brand profile");

      alert('Registration successful! Redirecting to dashboard...');
      router.push('/brand/dashboard');

    } catch (err: any) {
      console.error('Registration error:', err);
      // Ensure we display a readable error message
      const message = err.message || (typeof err === 'string' ? err : 'An unexpected error occurred during registration');
      setError(message);
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12">
      <Head>
        <title>Brand Registration - Cehpoint Marketing Partners</title>
      </Head>

      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-indigo-200/20 blur-3xl"></div>
          <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-purple-200/20 blur-3xl"></div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-indigo-900 mb-3 tracking-tight">
            Partner with <span className="text-indigo-600">Cehpoint</span>
          </h1>
          <h2 className="text-xl font-medium text-gray-600">
            Brand Registration
          </h2>
          <p className="mt-2 text-gray-500 text-sm">
            Find the perfect influencers for your campaigns
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-lg shadow-2xl rounded-2xl border border-white/50 p-8 animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-8">
             {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded text-sm animate-fade-in">
                {error}
              </div>
            )}

            <div className="border-b border-gray-200/60 pb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                <span className="bg-indigo-100 text-indigo-600 rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm">1</span>
                Account Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  id="email"
                  name="email"
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="bg-white/50"
                />
                <Input
                  id="password"
                  name="password"
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  helperText="Minimum 6 characters"
                  className="bg-white/50"
                />
              </div>
            </div>

            <div className="border-b border-gray-200/60 pb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                 <span className="bg-indigo-100 text-indigo-600 rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm">2</span>
                Company Information
              </h3>
              <div className="grid grid-cols-1 gap-6">
                <Input
                  id="companyName"
                  name="companyName"
                  label="Company Name"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                  className="bg-white/50"
                />
                 <Input
                  id="website"
                  name="website"
                  label="Website Url"
                  value={formData.website}
                  onChange={handleChange}
                  className="bg-white/50"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    id="industry"
                    name="industry"
                    label="Industry"
                    value={formData.industry}
                    onChange={handleChange}
                    placeholder="e.g. Fashion, Tech, Health"
                    required
                    className="bg-white/50"
                  />
                   <Input
                    id="location"
                    name="location"
                    label="Location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="City, Country"
                    required
                    className="bg-white/50"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="description" className="text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        className="flex min-h-[100px] w-full rounded-lg border border-gray-300 bg-white/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Tell us about your brand..."
                    />
                </div>
              </div>
            </div>

             <div className="flex items-center justify-between pt-6">
              <Link href="/login" className="text-indigo-600 hover:text-indigo-500 font-medium transition-colors">
                Already have an account? Sign in
              </Link>
              <Button 
                type="submit" 
                variant="primary" 
                isLoading={loading} 
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-indigo-500/30 px-8 py-2.5 rounded-lg transform transition-all duration-200 hover:scale-[1.02]"
              >
                Register as Brand
              </Button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default BrandRegister;
