
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';
import { supabase } from '@/lib/supabase';
import { 
  Loader2, 
  AlertCircle, 
  Layout, 
  FileText, 
  ListChecks, 
  IndianRupee, 
  Calendar, 
  Sparkles, 
  Megaphone, 
  Target, 
  ArrowLeft,
  CheckCircle2,
  Image as ImageIcon
} from 'lucide-react';

const CreateCampaign: React.FC = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("");
  const [brandId, setBrandId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    budget: '',
    deadline: '',
  });

  const [error, setError] = useState<string | null>(null);

  // Auth Guard
  useEffect(() => {
    if (!authLoading && !user) {
        router.push('/login');
    }
  }, [user, authLoading, router]);

  // Initial Brand Fetch
  useEffect(() => {
    if (authLoading) return;
    const fetchBrand = async () => {
        if (!user) return;
        console.log("Fetching brand for user:", user.id);
        try {
            const { data, error } = await supabase
                .from('brands')
                .select('id')
                .eq('user_id', user.id)
                .limit(1)
                .maybeSingle();

            if (error) console.error("Error fetching brand:", error);
            if (data && mounted.current) {
                console.log("Brand found:", (data as any).id);
                setBrandId((data as any).id);
            } else {
                console.log("No brand found, will create one.");
            }
        } catch (err) {
            console.error("Brand fetch exception:", err);
        }
    }
    fetchBrand();
  }, [user, authLoading]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null); // Clear error on edit
  };

  // Prevent state update on unmount
  const mounted = React.useRef(true);
  useEffect(() => {
    console.log("Create Campaign Component Mounted v4 (.select fix)"); 
    return () => { mounted.current = false; };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting campaign...");
    
    setLoading(true);
    setError(null);
    
    // Fail-Safe: Hard timeout for the ENTIRE operation
    const TIMEOUT_MS = 120000; 
    const opPromise = (async () => {
        // 0. Immediate Offline Check
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
            throw new Error("You appear to be offline. Please check your internet connection.");
        }

        // Validation: Refresh session to ensure token is valid after long page time
        setLoadingStatus("Checking connection...");
        
        // Timeout specific for auth check
        const authPromise = supabase.auth.getUser();
        // 5s strict timeout for connection check
        const authTimeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Connection check timed out")), 5000));
        
        let freshUser = null;
        try {
            const { data } = await Promise.race([authPromise, authTimeout]) as any;
            freshUser = data?.user;
        } catch (e) {
            console.warn("Auth/Connection check failed:", e);
            // RELAXED FAIL: Fallback to existing user so we don't block valid users with slow Auth checks
            setLoadingStatus("Connection slow, proceeding...");
            freshUser = user;
        }
        
        if (!freshUser) {
            throw new Error("Session expired. Please log in again.");
        }

        let currentBrandId = brandId;
        console.log("Current Brand ID from state:", currentBrandId);

        if (!currentBrandId) {
             setLoadingStatus("Checking brand info...");
             console.log("Brand ID missing. Checking DB directly before creating...");
             // Emergency check to avoid duplicate creation if state laid
             const { data: existingBrand } = await supabase.from('brands').select('id').eq('user_id', freshUser.id).limit(1).maybeSingle();
             
             if (existingBrand) {
                 console.log("Found existing brand in DB (recovery):", (existingBrand as any).id);
                 currentBrandId = (existingBrand as any).id;
             } else {
                 setLoadingStatus("Defining new brand...");
                 console.log("No brand found in DB. Auto-creating brand...");
                 const newId = (typeof crypto !== 'undefined' && crypto.randomUUID) 
                    ? crypto.randomUUID() 
                    : `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                 
                 console.log("Sending Brand INSERT request...");
                 
                 const { error: createError } = await (supabase.from('brands') as any).insert({
                        id: newId,
                        user_id: freshUser.id, 
                        company_name: freshUser.email?.split('@')[0] || 'My Brand',
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }).select();
    
                 if (createError) {
                     console.error("Brand creation failed:", createError);
                     throw createError;
                 }
                 console.log("Brand INSERT finished. ID:", newId);
                 currentBrandId = newId;
                 if (mounted.current) setBrandId(newId);
             }
        }

        console.log("Proceeding to Campaign Creation with Brand ID:", currentBrandId);
        
        // Helper to perform the insert with a specific timeout
        const uploadCampaignWithRetry = async () => {
             // ATTEMPT 1: Quick "Jiggle" attempt (15s) using Promise.race
             setLoadingStatus("Uploading (Attempt 1)...");
             console.log("Attempt 1: Uploading campaign...");
             try {
                const controller = new AbortController();
                
                // Promise A: DB Call
                const dbPromise = (supabase.from('campaigns') as any).insert({
                        brand_id: currentBrandId,
                        title: formData.title,
                        description: formData.description,
                        requirements: formData.requirements,
                        budget: parseFloat(formData.budget),
                        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
                        status: 'active'
                    })
                    .select()
                    .abortSignal(controller.signal);

                // Promise B: Strict Timeout
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error("Attempt 1 Timeout")), 15000)
                );
                
                // RACE THEM
                const { error } = await Promise.race([dbPromise, timeoutPromise]) as any;
                
                if (error) throw error;
                return; // Success!

             } catch (err: any) {
                 console.warn("Attempt 1 failed:", err);
                 // Force abort if we timed out
                 setLoadingStatus("Connection unstable, retrying...");
             }

             // ATTEMPT 2: Fallback to long timeout usually works if socket was stuck
             console.log("Attempt 2: Retrying upload (fresh connection)...");
             await new Promise(r => setTimeout(r, 1500)); // Wait 1.5s for socket cleanup
             
             const controller = new AbortController();
             // We race this too, just to be safe, but give it 90s
             const dbPromise2 = (supabase.from('campaigns') as any).insert({
                    brand_id: currentBrandId,
                    title: formData.title,
                    description: formData.description,
                    requirements: formData.requirements,
                    budget: parseFloat(formData.budget),
                    deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
                    status: 'active'
                })
                .select()
                .abortSignal(controller.signal);
                
             const timeoutPromise2 = new Promise((_, reject) => 
                setTimeout(() => reject(new Error("Attempt 2 Timeout")), 90000)
             );

            const { error: error2 } = await Promise.race([dbPromise2, timeoutPromise2]) as any;
            
            if (error2) throw error2;
        };

        await uploadCampaignWithRetry();

        console.log("Campaign created successfully!");
        setToast({ type: 'success', message: 'Campaign created successfully!' });
        
        // Reset form
        setFormData({
            title: '',
            description: '',
            requirements: '',
            budget: '',
            deadline: ''
        });
        
        // Delay redirect to show toast
        setTimeout(() => {
            router.push('/brand/campaigns');
        }, 1500);

    })();

    // Race against hard timeout
    try {
        await Promise.race([
            opPromise,
            new Promise((_, reject) => setTimeout(() => reject(new Error("Operation timed out (UI). Please check your internet connection and try again.")), TIMEOUT_MS))
        ]);
    } catch (error: any) {
        console.warn("Error creating campaign:", error);
        
        if (mounted.current) {
            let msg = error.message || "Failed to create campaign";
            if (error.name === 'AbortError') {
                msg = "Network request timed out. Please check your connection.";
            }
            setError(msg);
        }
    } finally {
        if (mounted.current) {
            setLoading(false);
            setLoadingStatus("");
        }
    }
  };

  if (authLoading) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
            <Loader2 className="h-10 w-10 text-indigo-600 animate-spin mb-4" />
            <p className="text-gray-500">Checking authentication...</p>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <Head>
        <title>Create Campaign - Cehpoint</title>
      </Head>

      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm backdrop-blur-md bg-white/80">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
             <Button variant="ghost" className="p-2 -ml-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100" onClick={() => router.back()}>
                <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                Create New Campaign
            </h1>
          </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
             
             {/* Left Column: Context/Help */}
             <div className="w-full lg:w-1/3 space-y-6 order-2 lg:order-1">
                <div className="hidden lg:block">
                     <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Megaphone className="w-5 h-5 text-indigo-600" />
                        Campaign Details
                     </h2>
                     <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                        Design a compelling campaign to attract the best influencers. Clear instructions lead to better content.
                     </p>
                </div>
                
                {/* Pro Tips Card */}
                <div className="rounded-2xl p-6 border border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 shadow-sm relative overflow-hidden">
                    {/* Decorative background element */}
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-indigo-100 rounded-full opacity-50 blur-xl"></div>
                    
                    <div className="flex items-center gap-2 mb-4 relative z-10">
                        <div className="p-2 bg-white rounded-lg shadow-sm text-indigo-600">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <h3 className="font-semibold text-indigo-900">Pro Tips</h3>
                    </div>
                    
                    <ul className="space-y-4 relative z-10">
                        <li className="flex gap-3 text-sm text-indigo-900/80">
                            <Target className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                            <span>Be specific about deliverables (e.g., "1 Reel + 1 Story").</span>
                        </li>
                        <li className="flex gap-3 text-sm text-indigo-900/80">
                            <IndianRupee className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                            <span>Set a competitive budget to attract top talent.</span>
                        </li>
                        <li className="flex gap-3 text-sm text-indigo-900/80">
                            <ImageIcon className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                            <span>Provide visual examples or mood boards in the description.</span>
                        </li>
                    </ul>
                </div>
             </div>

             {/* Right Column: Form */}
             <div className="w-full lg:w-2/3 order-1 lg:order-2">
                 <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Progress Bar (Decorative) */}
                    <div className="h-1.5 bg-gray-50 w-full">
                       <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 w-1/3 rounded-r-full"></div>
                    </div>

                    <div className="p-5 md:p-8">
                         {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-700 animate-in fade-in slide-in-from-top-2">
                                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                <div className="text-sm">
                                    <span className="font-semibold block mb-1">Unable to create campaign</span>
                                    {error}
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-8">
                            
                            {/* Section 1: Basic Info */}
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Campaign Title <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                            <Layout className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <Input
                                            id="title"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            required
                                            placeholder="e.g. Summer Collection Launch 2024"
                                            className="pl-11 h-12 text-base font-medium"
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
                                        Description <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute top-3.5 left-3.5 pointer-events-none">
                                            <FileText className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <textarea
                                            id="description"
                                            name="description"
                                            rows={5}
                                            className="block w-full rounded-xl border-gray-300 pl-11 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base leading-relaxed resize-none py-3"
                                            value={formData.description}
                                            onChange={handleChange}
                                            required
                                            placeholder="Describe your brand, your goals for this campaign, and what you're promoting..."
                                        />
                                        <div className="absolute bottom-3 right-3 text-xs font-medium text-gray-400 bg-white px-2 py-1 rounded-md border border-gray-100 shadow-sm">
                                            {formData.description.length} chars
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-gray-100" />

                            {/* Section 2: Requirements */}
                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
                                        Requirements
                                    </label>
                                    <div className="relative">
                                        <div className="absolute top-3.5 left-3.5 pointer-events-none">
                                            <ListChecks className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <textarea
                                            id="requirements"
                                            name="requirements"
                                            rows={4}
                                            className="block w-full rounded-xl border-gray-300 pl-11 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm leading-relaxed"
                                            value={formData.requirements}
                                            onChange={handleChange}
                                            placeholder="• Must have 10k+ followers&#10;• Post 1 Reel and 1 Story&#10;• Tag @yourbrand in the first line"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2 ml-1">List specific deliverables or criteria for approval.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
                                            Budget <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative rounded-md shadow-sm">
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                                                <IndianRupee className="h-5 w-5 text-gray-500" />
                                            </div>
                                            <input
                                                type="number"
                                                name="budget"
                                                id="budget"
                                                className="block w-full rounded-xl border-gray-300 pl-11 focus:border-indigo-500 focus:ring-indigo-500 h-12 text-base font-semibold text-gray-900"
                                                placeholder="0.00"
                                                value={formData.budget}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                         <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
                                            Deadline
                                        </label>
                                        <div className="relative">
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                                                <Calendar className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="date"
                                                name="deadline"
                                                id="deadline"
                                                className="block w-full rounded-xl border-gray-300 pl-11 focus:border-indigo-500 focus:ring-indigo-500 h-12 text-gray-900"
                                                value={formData.deadline}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="pt-6 flex items-center justify-end gap-3">
                                <Button type="button" variant="ghost" onClick={() => router.back()} className="h-12 px-6">Cancel</Button>
                                <Button 
                                    type="submit" 
                                    disabled={loading} 
                                    className="h-12 px-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-200 transition-all transform active:scale-95"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                                            {loadingStatus || 'Creating Campaign...'}
                                        </>
                                    ) : (
                                        <>
                                            Create Campaign
                                            <CheckCircle2 className="ml-2 h-5 w-5 opacity-90" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                 </div>
             </div>
        </div>
      </div>
      
      {/* Toast Notification */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default CreateCampaign;
