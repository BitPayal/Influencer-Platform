import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Camera, Building2, LogIn } from 'lucide-react';

const LoginSelection: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-orange-50 flex flex-col items-center justify-center p-4">
      <Head>
        <title>Login - Cehpoint Influence Partners</title>
      </Head>

      <div className="max-w-4xl w-full">
        <div className="text-center mb-12 animate-fade-in-up">
            <Link href="/">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4 cursor-pointer">
                    Welcome <span className="text-indigo-600">Back</span>
                </h1>
            </Link>
          <p className="text-xl text-gray-600">Select your account type to login</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Influencer Card */}
          <Link href="/login/influencer" className="group">
            <div className="bg-white p-8 rounded-2xl shadow-xl border-2 border-transparent hover:border-orange-500 transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-orange-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 p-4 bg-orange-100 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
                <Camera size={48} className="text-orange-600" />
              </div>
              <h2 className="relative z-10 text-2xl font-bold text-gray-900 mb-3">Influencer Login</h2>
              <p className="relative z-10 text-gray-600 mb-8">
                Access your dashboard, view campaigns, and track earnings.
              </p>
              <div className="relative z-10 mt-auto flex items-center text-orange-600 font-bold group-hover:gap-2 transition-all">
                Login <LogIn size={20} className="ml-2" />
              </div>
            </div>
          </Link>

          {/* Brand Card */}
          <Link href="/login/brand" className="group">
            <div className="bg-white p-8 rounded-2xl shadow-xl border-2 border-transparent hover:border-indigo-500 transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 p-4 bg-indigo-100 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
                <Building2 size={48} className="text-indigo-600" />
              </div>
              <h2 className="relative z-10 text-2xl font-bold text-gray-900 mb-3">Brand Login</h2>
              <p className="relative z-10 text-gray-600 mb-8">
                Manage campaigns, approve proposals, and view analytics.
              </p>
              <div className="relative z-10 mt-auto flex items-center text-indigo-600 font-bold group-hover:gap-2 transition-all">
                Login <LogIn size={20} className="ml-2" />
              </div>
            </div>
          </Link>
        </div>

        <div className="text-center mt-12 text-gray-500 text-sm">
          Don't have an account?{' '}
          <Link href="/register" className="text-indigo-600 hover:underline px-1 font-semibold">Get Started</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginSelection;
