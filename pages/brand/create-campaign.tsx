
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
    <div className="min-h-screen bg-gray-50 py-12">
      <Head>
        <title>Create Campaign - Cehpoint</title>
      </Head>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-8 rounded-lg shadow">
            <div className="flex items-center gap-3 mb-6">
                <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => router.back()}>
                    &larr; Back
                </Button>
                <h1 className="text-2xl font-bold text-gray-900">Create New Campaign</h1>
            </div>
            
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                    id="title"
                    name="title"
                    label="Campaign Title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Summer Collection Launch"
                />
                
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="description" className="text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        className="flex min-h-[100px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        placeholder="Describe your campaign goals and what you're promoting..."
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label htmlFor="requirements" className="text-sm font-medium text-gray-700">Requirements</label>
                    <textarea
                        id="requirements"
                        name="requirements"
                        className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={formData.requirements}
                        onChange={handleChange}
                        placeholder="e.g. Must have 10k+ followers, Post 1 Reel and 1 Story"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        id="budget"
                        name="budget"
                        label="Budget (₹)"
                        type="number"
                        value={formData.budget}
                        onChange={handleChange}
                        required
                        placeholder="5000"
                    />
                    <Input
                        id="deadline"
                        name="deadline"
                        label="Deadline"
                        type="date"
                        value={formData.deadline}
                        onChange={handleChange}
                    />
                </div>

                <div className="flex justify-between gap-4 pt-4">
                     <Button type="button" variant="secondary" onClick={async () => {
                        console.log("Debug: Checking Campaign Insert...");
                        const { data: { user }, error: authError } = await supabase.auth.getUser();
                        
                        if (!user) {
                            alert("No user!");
                            return;
                        }

                        let log = [`User: ${user.id}`];
                        let brandIdToUse = null;

                        // 1. Fetch Brand
                        const { data: brand, error: fetchErr } = await supabase
                            .from('brands')
                            .select('id')
                            .eq('user_id', user.id)
                            .limit(1)
                            .maybeSingle();
                        
                        if (fetchErr) log.push(`Fetch Brand Err: ${fetchErr.message}`);
                        
                        if (brand) {
                            brandIdToUse = (brand as any).id;
                            log.push(`Found Brand: ${(brand as any).id}`);
                        } else {
                            log.push("No Brand Found. Creating one...");
                            const newId = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `brand-${Date.now()}`;
                            const { error: createErr } = await (supabase.from('brands') as any).insert({
                                id: newId,
                                user_id: user.id,
                                company_name: "Debug Brand " + newId.substr(0,4),
                                created_at: new Date().toISOString(),
                                updated_at: new Date().toISOString()
                            }).select();

                            if (createErr) {
                                log.push(`Create Brand Failed: ${createErr.message}`);
                            } else {
                                brandIdToUse = newId;
                                log.push(`Created Brand: ${newId}`);
                            }
                        }

                        // 2. Insert Campaign
                        if (brandIdToUse) {
                            log.push("Attempting Campaign Insert (Long Text)...");
                            const longText = "This is a very long description text to test if the network or database blocks larger payloads. ".repeat(20);
                            const { data: camp, error: campErr } = await (supabase.from('campaigns') as any).insert({
                                brand_id: brandIdToUse,
                                title: "Debug Long " + Date.now(),
                                description: longText,
                                requirements: "Debug Req",
                                budget: 100,
                                deadline: new Date().toISOString(),
                                status: 'active',
                                created_at: new Date().toISOString(),
                                updated_at: new Date().toISOString()
                            }).select();

                            if (campErr) {
                                log.push(`Campaign Insert FAILED: ${campErr.message} (Code: ${campErr.code})`);
                            } else {
                                log.push("Campaign Insert SUCCESS!");
                                // check if we got data back
                                if (camp) log.push("Data returned OK.");
                                else log.push("No data returned (but no error).");
                            }
                        } else {
                            log.push("Skipping Campaign Insert (No Brand ID).");
                        }

                        alert(log.join('\n'));
                    }}>
                        Debug Campaign
                    </Button>
                    <div className="flex gap-4">
                        <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
                        <Button type="submit" variant="primary" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                    {loadingStatus || 'Creating...'}
                                </>
                            ) : (
                                'Post Campaign'
                            )}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCampaign;
