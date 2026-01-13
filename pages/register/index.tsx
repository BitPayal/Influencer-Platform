import React, { useState } from 'react';

import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { FileUpload } from '@/components/FileUpload';
import { indianStates } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { AlertCircle, CheckCircle } from 'lucide-react';

const InfluencerRegister: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [idProofUrl, setIdProofUrl] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [idProofFile, setIdProofFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phoneNumber: '',
    district: '',
    state: '',
    instagram: '',
    youtube: '',
    facebook: '',
    followerCount: '',
    idProofType: '',
    idProofUrl: '',
    upiId: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
 const uploadIdProofToCloudinary = async () => {
    // If we already have a URL, return it immediately
    if (idProofUrl) {
      console.log('Using existing ID proof URL:', idProofUrl);
      return idProofUrl;
    }

  if (!idProofFile) {
    console.error('No file selected');
    throw new Error('Please select an ID proof file');
  }

  const formData = new FormData();
  formData.append('file', idProofFile);

  try {
    console.log('Starting file upload to Cloudinary...');
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    console.log('Upload response:', data);

    if (!res.ok) {
      console.error('Upload failed with status:', res.status);
      throw new Error(data.error || 'ID proof upload failed');
    }

    if (!data.url) {
      console.error('No URL in response:', data);
      throw new Error('Invalid response from server');
    }

    console.log('Upload successful, URL:', data.url);
    setIdProofUrl(data.url);
    return data.url;
  } catch (error) {
    console.error('Upload error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to upload ID proof');
  }
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  console.log('Starting handleSubmit');
  setError('');
  setSuccess('');
  setLoading(true);

  try {
    if (!idProofFile) {
      throw new Error('Please select an ID proof file');
    }

    // ✅ UPLOAD ONLY ONCE
    console.log('Starting file upload...');
    const uploadedIdProofUrl = await uploadIdProofToCloudinary();
    console.log('File upload completed:', uploadedIdProofUrl);

  // 1️⃣ Sign up
  console.log('Starting Supabase SignUp...', formData.email);
  
  // Create a timeout promise to detect hangs (increased to 30s)
  const timeoutPromise = new Promise<{ data: { user: any } | null; error: any }>((_, reject) =>
      setTimeout(() => reject(new Error('Supabase SignUp timed out after 30 seconds. Please check your internet connection.')), 30000)
  );

  const signUpPromise = supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
  });

  console.log('Awaiting Supabase SignUp...');
  const { data: signUpData, error: signUpError } = await Promise.race([signUpPromise, timeoutPromise]) as any;

  console.log('SignUp response received:', { signUpData, signUpError });

let sessionUser = signUpData.user;

    if (signUpError) {
      if (signUpError.message.toLowerCase().includes("already registered") || signUpError.message.toLowerCase().includes("user already registered")) {
        console.warn("User already registered. Showing error...");
        setError("This email is already registered. Please sign in.");
        setLoading(false); // Ensure loading state is reset
        return; 
      } else {
        throw signUpError;
      }
    }

    // If we reach here without sessionUser and no error, something odd happened, but we shouldn't attempt auto-login if it failed before.
    if (!sessionUser) {
        throw new Error("Registration failed. Please try again or use a different email.");
    }

  if (!sessionUser) {
      throw new Error("Authentication failed. Unable to retrieve user session.");
  }

  // 3️⃣ Now we have authenticated user
  const userId = sessionUser.id;


  console.log('Authenticated User ID:', userId);


    // SKIP SELECT - directly upsert to avoid potential read hangs on new accounts
    // const checkUserPromise = ... 
    
    console.log('Upserting into users table...');
    const upsertUserPromise = supabase.from('users').upsert({
      id: userId,
      email: formData.email,
      role: 'influencer',
    } as any, { onConflict: 'id', ignoreDuplicates: true });
  
    const { error: userError } = await Promise.race([
        upsertUserPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Upsert user timed out')), 10000))
    ]) as any;
  
    if (userError) {
        console.error('Users upsert error:', userError);
        throw userError;
    }
  
  // Existing user check block removed as it is replaced by upsert above.
  
    // insert influencer
    console.log('Inserting into influencers table with pending status...');
    const { data: newInfluencer, error: influencerError } = await supabase
      .from('influencers')
      .insert({
        user_id: userId,
        full_name: formData.fullName,
        phone_number: formData.phoneNumber,
        email: formData.email,
        district: formData.district,
        state: formData.state,
        social_media_handles: {
          instagram: formData.instagram,
          youtube: formData.youtube,
          facebook: formData.facebook,
        },
        follower_count: parseInt(formData.followerCount) || 0,
        id_proof_type: formData.idProofType,
        id_proof_url: uploadedIdProofUrl,
        upi_id: formData.upiId,
        approval_status: 'pending',
        // approved_at: new Date().toISOString(), // Removed for pending status
      })
      .select()
      .single();
  
    console.log('Influencers insert result:', { newInfluencer, influencerError });
    
    if (influencerError) throw influencerError;
    if (!newInfluencer) throw new Error('Registration failed: Could not create influencer profile.');
  
      setSuccess('Registration successful! Welcome to Cehpoint. Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      console.error('Registration failed:', err);
      // alert(`Registration failed: ${err.message}`); // REMOVED ALERT
      setError(err.message || 'Failed to register');
    } finally {
      console.log('handleSubmit finally - turning off loading');
      setLoading(false);
    }
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white py-12">
      <Head>
        <title>Influencer Registration - Cehpoint Marketing Partners</title>
      </Head>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-600 mb-2">
            Cehpoint Marketing Partners
          </h1>
          <h2 className="text-2xl font-semibold text-gray-900">
            Influencer Registration
          </h2>
          <p className="mt-2 text-gray-600">
            Join our network and start earning
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-4 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {success && (
              <div className="rounded-md bg-green-50 p-4 border border-green-200 shadow-sm animate-fade-in-down mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-green-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      Registration Successful
                    </h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>{success}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-md bg-red-50 p-4 border border-red-200 shadow-sm animate-fade-in-down mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Registration Error
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                    {error.includes("already registered") && (
                         <div className="mt-4">
                          <div className="-mx-2 -my-1.5 flex">
                            <Link href="/login" className="bg-red-50 px-2 py-1.5 rounded-md text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600">
                              Sign in now
                            </Link>
                          </div>
                        </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="border-b border-gray-200 pb-8">
              <h3 className="text-xl font-semibold mb-6">Account Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  id="email"
                  name="email"
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
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
                />
              </div>
            </div>

            <div className="border-b border-gray-200 pb-8">
              <h3 className="text-xl font-semibold mb-6">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  id="fullName"
                  name="fullName"
                  label="Full Name"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  label="Phone Number"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                />
                <Select
                  id="state"
                  name="state"
                  label="State"
                  value={formData.state}
                  onChange={handleChange}
                  options={indianStates.map((s) => ({ value: s, label: s }))}
                  required
                />
                <Input
                  id="district"
                  name="district"
                  label="District"
                  value={formData.district}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="border-b border-gray-200 pb-8">
              <h3 className="text-xl font-semibold mb-6">Social Media Handles</h3>
              <div className="grid grid-cols-1 gap-6">
                <Input
                  id="instagram"
                  name="instagram"
                  label="Instagram Handle"
                  value={formData.instagram}
                  onChange={handleChange}
                  helperText="e.g., @username"
                />
                <Input
                  id="youtube"
                  name="youtube"
                  label="YouTube Channel"
                  value={formData.youtube}
                  onChange={handleChange}
                  helperText="Channel URL or name"
                />
                <Input
                  id="facebook"
                  name="facebook"
                  label="Facebook Profile/Page"
                  value={formData.facebook}
                  onChange={handleChange}
                />
                <Input
                  id="followerCount"
                  name="followerCount"
                  label="Total Follower Count"
                  type="number"
                  value={formData.followerCount}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="border-b border-gray-200 pb-8">
              <h3 className="text-xl font-semibold mb-6">Verification</h3>
              <div className="grid grid-cols-1 gap-6">
                <Select
                  id="idProofType"
                  name="idProofType"
                  label="ID Proof Type"
                  value={formData.idProofType}
                  onChange={handleChange}
                  options={[
                    { value: 'aadhaar', label: 'Aadhaar Card' },
                    { value: 'pan', label: 'PAN Card' },
                  ]}
                  required
                />
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID Proof (PDF or Image) <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:bg-gray-50 transition-colors cursor-pointer relative">
                    <div className="space-y-1 text-center w-full">
                         <div className="flex text-sm text-gray-600 justify-center">
                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                              <span>Upload a file</span>
                              <input 
                                id="file-upload" 
                                name="file-upload" 
                                type="file" 
                                className="sr-only" 
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
                                      setError('Only images (JPG, PNG) and PDF files are allowed.');
                                      e.target.value = '';
                                      return;
                                    }
                                    if (file.size > 5 * 1024 * 1024) {
                                      setError('File size must be less than 5MB');
                                      return;
                                    }
                                    setError('');
                                    setIdProofFile(file);
                                  }
                                }}
                                accept="image/*,.pdf"
                                required
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                      <p className="text-xs text-gray-500">PNG, JPG, PDF up to 5MB</p>
                      {idProofFile && (
                        <p className="text-sm font-medium text-green-600 mt-2 truncate max-w-[250px] mx-auto">
                          Selected: {idProofFile.name}
                        </p>
                      )}
                      {idProofUrl && (
                        <p className="text-sm text-green-600 mt-1">
                          File uploaded successfully
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pb-8">
              <h3 className="text-xl font-semibold mb-6">Payment Information</h3>
              <Input
                id="upiId"
                name="upiId"
                label="UPI ID"
                value={formData.upiId}
                onChange={handleChange}
                required
                helperText="e.g., yourname@paytm"
              />
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-4">
              <Link href="/login" className="text-sm font-medium text-primary-600 hover:text-primary-500 w-full sm:w-auto text-center">
                Already have an account? Sign in
              </Link>
              <Button type="submit" variant="primary" isLoading={loading} className="w-full sm:w-auto px-8 py-3">
                Register
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};


export default InfluencerRegister;
