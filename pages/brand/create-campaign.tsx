
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { supabase } from '@/lib/supabase';
import { Loader2, AlertCircle } from 'lucide-react';

const CreateCampaign: React.FC = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("");
  const [brandId, setBrandId] = useState<string | null>(null);

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

  // Helper needs to be available to both effects
  const withTimeout = async (promise: Promise<any>, ms: number, msg: string) => {
        let timeoutId: NodeJS.Timeout;
        const TIMEOUT_SENTINEL = { __timeout: true }; 

        const timeoutPromise = new Promise((resolve) => {
            timeoutId = setTimeout(() => {
                console.log(`Timeout triggered: ${msg}`);
                resolve(TIMEOUT_SENTINEL);
            }, ms);
        });

        try {
            const result = await Promise.race([promise, timeoutPromise]);
            clearTimeout(timeoutId!);
            
            // Return error object mimicking Supabase structure instead of throwing
            if (result === TIMEOUT_SENTINEL) {
                return { data: null, error: { message: msg } };
            }
            
            return result;
        } catch (error: any) {
            clearTimeout(timeoutId!);
             // Return normalized error object
            return { data: null, error: error?.message ? error : { message: "Unknown error occurred" } };
        }
    };

  // Initial Brand Fetch
  useEffect(() => {
    if (authLoading) return;
    const fetchBrand = async () => {
        if (!user) return;
        console.log("Fetching brand for user:", user.id);
        try {
            // FIX: Remove timeout wrapper for simple reads
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
        // Reset form
        setFormData({
            title: '',
            description: '',
            requirements: '',
            budget: '',
            deadline: ''
        });
        
        alert("Campaign created successfully!");
        router.push('/brand/campaigns'); // Redirect to list
    })();

    // Race against hard timeout
    try {
        await Promise.race([
            opPromise,
            new Promise((_, reject) => setTimeout(() => reject(new Error("Operation timed out (UI). Please check your internet connection and try again.")), TIMEOUT_MS))
        ]);
    } catch (error: any) {
        // Use warn instead of error to avoid Next.js overlay for expected timeouts
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
    <div className="min-h-screen bg-gray-50/50">
      <Head>
        <title>Create Campaign - Cehpoint</title>
      </Head>

      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <Button variant="ghost" className="p-2 -ml-2 text-gray-500 hover:text-gray-900" onClick={() => router.back()}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                </Button>
                <div className="h-6 w-px bg-gray-200 mx-2 hidden sm:block"></div>
                <h1 className="text-xl font-semibold text-gray-900">Create New Campaign</h1>
              </div>
          </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        <div className="flex flex-col md:flex-row gap-8 items-start">
             {/* Left Column: Context/Help */}
             <div className="w-full md:w-1/3 space-y-6">
                <div>
                     <h2 className="text-lg font-medium text-gray-900">Campaign Details</h2>
                     <p className="text-sm text-gray-500 mt-1">Provide clear instructions to help influencers understand your goals.</p>
                </div>
                
                <div className="bg-indigo-50 rounded-lg p-5 border border-indigo-100">
                    <h3 className="text-sm font-semibold text-indigo-900 mb-2">Tips for a great campaign</h3>
                    <ul className="text-sm text-indigo-800 space-y-2 list-disc list-inside">
                        <li>Be specific about the deliverables.</li>
                        <li>Set a realistic budget for your requirements.</li>
                        <li>Provide visual examples if possible in the description.</li>
                    </ul>
                </div>
             </div>

             {/* Right Column: Form */}
             <div className="w-full md:w-2/3">
                 <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Progress Bar (Decorative) */}
                    <div className="h-1 bg-gray-100 w-full">
                       <div className="h-full bg-indigo-600 w-1/3"></div>
                    </div>

                    <div className="p-6 md:p-8">
                         {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3 text-red-700">
                                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                <div className="text-sm">
                                    <span className="font-semibold block">Error</span>
                                    {error}
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-5">
                                <Input
                                    id="title"
                                    name="title"
                                    label="Campaign Title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. Summer Collection Launch 2024"
                                    className="text-lg font-medium"
                                />
                                
                                <div className="space-y-1.5">
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                        Description <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <textarea
                                            id="description"
                                            name="description"
                                            rows={5}
                                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm resize-none p-3"
                                            value={formData.description}
                                            onChange={handleChange}
                                            required
                                            placeholder="Describe your brand, your goals for this campaign, and what you're promoting..."
                                        />
                                        <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                                            {formData.description.length} chars
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label htmlFor="requirements" className="block text-sm font-medium text-gray-700">
                                        Requirements
                                    </label>
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <textarea
                                            id="requirements"
                                            name="requirements"
                                            rows={3}
                                            className="block w-full border-0 bg-transparent p-0 text-sm placeholder-gray-500 focus:ring-0"
                                            value={formData.requirements}
                                            onChange={handleChange}
                                            placeholder="• Must have 10k+ followers&#10;• Post 1 Reel and 1 Story&#10;• Tag @yourbrand in the first line"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500">List specific deliverables or criteria for approval.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label htmlFor="budget" className="block text-sm font-medium text-gray-700">
                                            Budget <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative rounded-md shadow-sm">
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                <span className="text-gray-500 sm:text-sm">₹</span>
                                            </div>
                                            <input
                                                type="number"
                                                name="budget"
                                                id="budget"
                                                className="block w-full rounded-md border-gray-300 pl-7 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10"
                                                placeholder="0.00"
                                                value={formData.budget}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                         <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">
                                            Deadline
                                        </label>
                                        <input
                                            type="date"
                                            name="deadline"
                                            id="deadline"
                                            className="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10"
                                            value={formData.deadline}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-3">
                                <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
                                <Button type="submit" variant="primary" disabled={loading} className="px-8 shadow-md hover:shadow-lg transition-shadow">
                                    {loading ? (
                                        <>
                                            <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                            {loadingStatus || 'Creating Campaign...'}
                                        </>
                                    ) : (
                                        'Create Campaign'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                 </div>
             </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCampaign;
