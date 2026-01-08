import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { supabase } from '@/lib/supabase';
import { Toast } from '@/components/ui/Toast';
import { User, Building2, Globe, MapPin, FileText, ArrowRight, CheckCircle } from 'lucide-react';

const BrandRegister: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

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

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000); // Auto-dismiss
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
             showToast("This email is already registered. Redirecting to login...", "error");
             setTimeout(() => router.push('/login'), 2000);
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

      // Success!
      showToast("Registration successful! Redirecting to dashboard...", "success");
      setTimeout(() => router.push('/brand/dashboard'), 1500);

    } catch (err: any) {
      console.error('Registration error:', err);
      const message = err.message || (typeof err === 'string' ? err : 'An unexpected error occurred during registration');
      showToast(message, "error");
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center relative overflow-hidden bg-gray-50 py-12 sm:px-6 lg:px-8">
      <Head>
        <title>Brand Registration - Cehpoint Marketing Partners</title>
      </Head>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-purple-200/30 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/4 w-72 h-72 rounded-full bg-indigo-200/20 blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-blue-200/30 blur-3xl"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
          Partner with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Cehpoint</span>
        </h1>
        <p className="mt-2 text-base text-gray-600">
          Create your brand account to start collaborating with top influencers.
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-[800px] relative z-10">
        <div className="bg-white py-8 px-4 shadow-xl shadow-indigo-100/50 sm:rounded-2xl sm:px-10 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Step 1: Account Info */}
            <div>
              <div className="flex items-center gap-3 mb-6 pb-2 border-b border-gray-100">
                <div className="bg-indigo-50 text-indigo-600 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">1</div>
                <h3 className="text-lg font-semibold text-gray-900">Account Credentials</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-4 w-4 text-gray-400" />
                      </div>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@company.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="pl-10" 
                      />
                    </div>
                 </div>

                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Password</label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      helperText="Min. 6 characters"
                    />
                 </div>
              </div>
            </div>

            {/* Step 2: Company Info */}
            <div>
              <div className="flex items-center gap-3 mb-6 pb-2 border-b border-gray-100">
                <div className="bg-indigo-50 text-indigo-600 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">2</div>
                <h3 className="text-lg font-semibold text-gray-900">Company Details</h3>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Company Name</label>
                      <div className="relative">
                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Building2 className="h-4 w-4 text-gray-400" />
                          </div>
                        <Input
                          id="companyName"
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleChange}
                          required
                          placeholder="Acme Inc."
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Website URL</label>
                      <div className="relative">
                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Globe className="h-4 w-4 text-gray-400" />
                          </div>
                        <Input
                          id="website"
                          name="website"
                          value={formData.website}
                          onChange={handleChange}
                          placeholder="https://example.com"
                          className="pl-10"
                        />
                      </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Industry</label>
                         <Input
                          id="industry"
                          name="industry"
                          value={formData.industry}
                          onChange={handleChange}
                          placeholder="e.g. Fashion, Tech"
                          required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Location</label>
                         <div className="relative">
                           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <MapPin className="h-4 w-4 text-gray-400" />
                            </div>
                            <Input
                              id="location"
                              name="location"
                              value={formData.location}
                              onChange={handleChange}
                              placeholder="City, Country"
                              required
                              className="pl-10"
                            />
                         </div>
                    </div>
                </div>

                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Description</label>
                    <div className="relative">
                         <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                            <FileText className="h-4 w-4 text-gray-400" />
                          </div>
                        <textarea
                            id="description"
                            name="description"
                            className="flex min-h-[100px] w-full rounded-xl border border-gray-300 bg-white px-3 py-2 pl-10 text-sm ring-offset-background placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 shadow-sm"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Tell us about your brand and what you're looking for..."
                        />
                    </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 flex flex-col md:flex-row items-center justify-between gap-4">
               <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">
                 Already have an account? <span className="underline">Sign in</span>
               </Link>

              <Button 
                type="submit" 
                variant="primary" 
                isLoading={loading} 
                className="w-full md:w-auto bg-gray-900 hover:bg-black text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {loading ? 'Creating Account...' : (
                  <span className="flex items-center">
                    Register Brand <ArrowRight className="ml-2 w-4 h-4" />
                  </span>
                )}
              </Button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default BrandRegister;
