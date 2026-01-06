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

const InfluencerRegister: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [idProofUrl, setIdProofUrl] = useState('');

  const [error, setError] = useState('');
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
      console.warn("User already registered. Redirecting to login...");
      alert("This email is already registered. Please sign in.");
      router.push('/login');
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
    name: formData.fullName,
    role: 'influencer',
  }, { onConflict: 'id', ignoreDuplicates: true });

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
console.log('Inserting into influencers table...');
const insertInfluencerPromise = supabase
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
  });

const { error: influencerError } = await Promise.race([
    insertInfluencerPromise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Insert influencer timed out')), 10000))
]) as any;

console.log('Influencers insert error:', influencerError);

if (influencerError) throw influencerError;


    alert(
      'Registration successful! Your application is under review.'
    );
    router.push('/login');
  } catch (err: any) {
    console.error('Registration failed:', err);
    alert(`Registration failed: ${err.message}`); // Alert specific error
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

        <div className="bg-white shadow-lg rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold mb-4">Account Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold mb-4">Social Media Handles</h3>
              <div className="grid grid-cols-1 gap-4">
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

            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold mb-4">Verification</h3>
              <div className="grid grid-cols-1 gap-4">
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
               <div>
  <label className="block text-sm font-medium text-gray-700">
    ID Proof (PDF or Image)
  </label>
  <input
    type="file"
    onChange={(e) => {
      const file = e.target.files?.[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          setError('File size must be less than 5MB');
          return;
        }
        setIdProofFile(file);
      }
    }}
    accept="image/*,.pdf"
    className="block w-full text-sm text-gray-500
      file:mr-4 file:py-2 file:px-4
      file:rounded-md file:border-0
      file:text-sm file:font-semibold
      file:bg-primary-50 file:text-primary-700
      hover:file:bg-primary-100"
    required
  />
  <p className="text-xs text-gray-500">
    Upload a clear photo or scan of your ID (JPG, PNG, or PDF, max 5MB)
  </p>
  {idProofUrl && (
    <p className="text-sm text-green-600">
      File uploaded successfully
    </p>
  )}
</div>


              </div>
            </div>

            <div className="pb-6">
              <h3 className="text-lg font-semibold mb-4">Payment Information</h3>
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

            <div className="flex items-center justify-between pt-6">
              <Link href="/login" className="text-primary-600 hover:text-primary-500">
                Already have an account? Sign in
              </Link>
              <Button type="submit" variant="primary" isLoading={loading}>
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
