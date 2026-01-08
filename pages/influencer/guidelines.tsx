import React from 'react';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/ui/Card';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Head from 'next/head';

const InfluencerGuidelines: React.FC = () => {
  return (
    <Layout>
      <Head>
        <title>Guidelines - Cehpoint Marketing Partners</title>
      </Head>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
              Promotion Guidelines
            </h1>
            <p className="text-lg text-gray-600">
                To ensure quality and consistency, please follow these standards when creating content for our partner brands.
            </p>
        </div>

        {/* Do's and Don'ts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-green-50/50 rounded-2xl border border-green-100 p-6 sm:p-8">
               <div className="flex items-center gap-3 mb-6">
                   <div className="p-2 bg-green-100 rounded-lg text-green-700">
                      <CheckCircle className="h-6 w-6" />
                   </div>
                   <h3 className="text-xl font-bold text-gray-900">Do's</h3>
               </div>
               <ul className="space-y-4">
                  {[
                    "Follow the approved script and caption templates",
                    "Clearly mention the brand name and product features",
                    "Include local contact information or service links if provided",
                    "Use high-quality video and audio",
                    "Be authentic and engaging with your audience",
                    "Post during peak engagement hours",
                    "Respond to comments about the product",
                    "Tag our official social media handles"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start text-gray-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 shrink-0" />
                        <span>{item}</span>
                    </li>
                  ))}
               </ul>
            </div>

            <div className="bg-red-50/50 rounded-2xl border border-red-100 p-6 sm:p-8">
               <div className="flex items-center gap-3 mb-6">
                   <div className="p-2 bg-red-100 rounded-lg text-red-700">
                      <XCircle className="h-6 w-6" />
                   </div>
                   <h3 className="text-xl font-bold text-gray-900">Don'ts</h3>
               </div>
               <ul className="space-y-4">
                  {[
                    "Don't include political or religious content",
                    "Don't make false or exaggerated claims",
                    "Don't use offensive language",
                    "Don't delete posts within 30 days (No Delete Policy)",
                    "Don't modify approved content without permission",
                    "Don't promote competing brands in the same content",
                    "Don't use copyrighted music without checks"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start text-gray-700">
                        <XCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5 shrink-0" />
                        <span>{item}</span>
                    </li>
                  ))}
               </ul>
            </div>
        </div>

        {/* Process Steps */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
           <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Video Submission Process</h2>
           <div className="relative">
             {/* Connector Line (Desktop) */}
             <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -z-10 transform -translate-y-1/2"></div>
             
             <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
               {[
                 { step: 1, title: "Create", desc: "Film engaging content following guidelines" },
                 { step: 2, title: "Submit", desc: "Upload video for brand approval" },
                 { step: 3, title: "Review", desc: "Wait for 24-48h approval turnaround" },
                 { step: 4, title: "Post", desc: "Share publicly and submit proof link" },
                 { step: 5, title: "Earn", desc: "Receive payment via UPI" },
               ].map((s) => (
                 <div key={s.step} className="flex flex-col items-center text-center bg-white p-2">
                    <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg mb-4 shadow-md ring-4 ring-white">
                        {s.step}
                    </div>
                    <h4 className="font-bold text-gray-900 mb-1">{s.title}</h4>
                    <p className="text-sm text-gray-500">{s.desc}</p>
                 </div>
               ))}
             </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Revenue Share Highlight */}
           <div className="lg:col-span-2 bg-gradient-to-br from-indigo-900 to-blue-800 rounded-2xl p-8 text-white relative overflow-hidden shadow-xl">
               <div className="absolute top-0 right-0 p-12 opacity-10">
                   <AlertCircle className="w-64 h-64" />
               </div>
               <div className="relative z-10">
                   <div className="flex items-center gap-3 mb-4">
                       <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">Exclusive</span>
                       <h2 className="text-2xl font-bold">Revenue Share Program</h2>
                   </div>
                   <p className="text-blue-100 mb-6 max-w-2xl text-lg">
                       Unlock ongoing earnings! Maintain consistent performance to qualify for our revenue sharing tier.
                   </p>
                   
                   <div className="grid sm:grid-cols-2 gap-6">
                       <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                           <div className="text-3xl font-bold text-yellow-400 mb-1">5%</div>
                           <div className="text-sm text-blue-100">Additional Commission</div>
                           <p className="text-xs text-blue-200 mt-2">On leads/sales from your district</p>
                       </div>
                       <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                           <div className="text-3xl font-bold text-green-400 mb-1">2+</div>
                           <div className="text-sm text-blue-100">Videos Per Month</div>
                           <p className="text-xs text-blue-200 mt-2">Required to maintain eligibility</p>
                       </div>
                   </div>
               </div>
           </div>

           {/* Policy Card */}
           <div className="bg-gray-900 rounded-2xl p-8 text-gray-300 flex flex-col justify-center">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <AlertCircle className="text-red-500 h-5 w-5" /> 
                  No Delete Policy
              </h3>
              <p className="mb-4 leading-relaxed">
                  All promotional videos must remain public for a minimum of <strong>30 days</strong>. 
              </p>
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-200">
                  Deleting content early results in payment reversals and account suspension.
              </div>
           </div>
        </div>

      </div>
    </Layout>
  );
};

export default InfluencerGuidelines;
