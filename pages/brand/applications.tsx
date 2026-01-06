import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Layout } from '@/components/Layout';
import { Loader2, AlertCircle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CampaignApplication, Influencer, Campaign } from '@/types';

type ApplicationWithDetails = CampaignApplication & {
    influencer: Influencer;
    campaign: Campaign;
};

const BrandApplicationsPage = () => {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [applications, setApplications] = useState<ApplicationWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const mounted = useRef(true);

    useEffect(() => {
        mounted.current = true;
        return () => { mounted.current = false; };
    }, []);

    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            router.push('/login');
            return;
        }

        if (user.role !== 'marketing') {
             // Not authorized or wrong role
             setLoading(false);
             setError("Access denied. Authorized for Brand accounts only.");
             return;
        }

        fetchApplications();
    }, [user, authLoading]);

    const fetchApplications = async () => {
        if (!mounted.current) return;
        setLoading(true);
        setError('');

        try {
            if (!user?.id) throw new Error("User ID not found");
            
            // 1. Get Brand ID
            const brandPromise = supabase.from('brands').select('id').eq('user_id', user.id).limit(1).maybeSingle();
            const brandTimeout = new Promise((resolve) => setTimeout(() => resolve({ data: null, error: { message: 'Fetching brand details timed out' } }), 60000));
            
            const { data: brand, error: brandError } = await Promise.race([
                brandPromise,
                brandTimeout
            ]) as any;

            if (brandError) throw new Error("Could not fetch brand details: " + (brandError.message || JSON.stringify(brandError)));
            if (!brand) throw new Error("Brand profile not found.");

            // 2. Get all campaigns for this brand
            const campaignsPromise = supabase.from('campaigns').select('id').eq('brand_id', brand.id);
            const campaignsTimeout = new Promise((resolve) => setTimeout(() => resolve({ data: [], error: { message: 'Fetching campaigns timed out' } }), 60000));
            
            const { data: campaigns, error: campaignsError } = await Promise.race([
                campaignsPromise,
                campaignsTimeout
            ]) as any;

            if (campaignsError) throw new Error("Could not fetch campaigns: " + (campaignsError.message || JSON.stringify(campaignsError)));
            
            const campaignIds = campaigns?.map((c: any) => c.id) || [];

            if (campaignIds.length === 0) {
                if(mounted.current) {
                    setApplications([]);
                    setLoading(false);
                }
                return;
            }

            // 3. Fetch pending applications for these campaigns
            const applicationsPromise = supabase
                .from('campaign_applications')
                .select(`
                    *,
                    influencer:influencers(*),
                    campaign:campaigns(*)
                `)
                .in('campaign_id', campaignIds)
                .eq('status', 'pending')
                .order('applied_at', { ascending: false });

            const appsTimeout = new Promise((resolve) => setTimeout(() => resolve({ data: [], error: { message: 'Fetching applications timed out' } }), 60000));

            const { data, error: appsError } = await Promise.race([
                applicationsPromise,
                appsTimeout
            ]) as any;

            if (appsError) throw new Error("Could not fetch applications: " + (appsError.message || JSON.stringify(appsError)));
            
            if (mounted.current) {
                setApplications(data as any || []);
            }

        } catch (error: any) {
            console.error("Error fetching applications:", error);
            if (mounted.current) setError(error.message || "Failed to load applications. Please check your connection.");
        } finally {
            if (mounted.current) setLoading(false);
        }
    };

    const handleAction = async (appId: string, action: 'approved' | 'rejected') => {
        try {
            // Optimistic update could be done here, but let's stick to safe confirm
            const updatePromise = (supabase
                .from('campaign_applications') as any)
                .update({ status: action })
                .eq('id', appId);

            const updateTimeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Update timed out')), 60000));
            updateTimeout.catch(() => {}); // Prevent unhandled rejection

            const { error: updateError } = await Promise.race([
                updatePromise,
                updateTimeout
            ]) as any;
            
            if (updateError) throw updateError;

            // Remove from list on success
            setApplications(prev => prev.filter(a => a.id !== appId));
        } catch (error: any) {
            console.error("Error updating application:", error);
            alert(`Failed to ${action} application: ${error.message}`);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                <p className="text-gray-500 font-medium">Loading applications...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <Button onClick={fetchApplications} variant="primary" className="w-full">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <Layout>
            <Head>
                <title>Pending Applications - Cehpoint</title>
            </Head>

            <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                         <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Pending Applications</h1>
                         <p className="mt-2 text-lg text-gray-600">Review incoming proposals from influencers.</p>
                    </div>
                    <Button variant="secondary" onClick={() => fetchApplications()}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                </div>

                {applications.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                        <div className="mx-auto h-16 w-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="h-8 w-8 text-indigo-500" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">All Caught Up!</h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                            No pending applications found. Check back later or create a new campaign to attract more influencers.
                        </p>
                        <Button 
                            className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white"
                            onClick={() => router.push('/brand/create-campaign')}
                            variant="primary"
                        >
                            Create New Campaign
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {applications.map((app) => (
                            <div 
                                key={app.id} 
                                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col lg:flex-row gap-6 transition-all duration-200 hover:shadow-md hover:border-indigo-100"
                            >
                                {/* Influencer Info */}
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                                    {app.campaign?.title || 'Unknown Campaign'}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    Applied {new Date(app.applied_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                                {app.influencer?.full_name || 'Unknown Influencer'}
                                            </h3>
                                            <p className="text-gray-500 text-sm">{app.influencer?.email}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 italic border border-gray-100">
                                        "{app.cover_message || "No cover message provided."}"
                                    </div>

                                    <div className="flex items-center gap-6 text-sm">
                                         <div className="flex flex-col">
                                            <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Followers</span>
                                            <span className="font-medium text-gray-900">{app.influencer?.follower_count?.toLocaleString() || 0}</span>
                                         </div>
                                         <div className="flex flex-col">
                                            <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Bid Amount</span>
                                            <span className="font-medium text-indigo-600">₹{app.bid_amount?.toLocaleString() || 0}</span>
                                         </div>
                                         <div className="flex flex-col">
                                            <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Platform</span>
                                            <span className="font-medium text-gray-900 capitalize">
                                                {app.influencer?.social_media_handles?.instagram ? 'Instagram' : 'YouTube'}
                                            </span>
                                         </div>
                                    </div>
                                </div>
                                
                                {/* Actions */}
                                <div className="flex lg:flex-col items-center justify-center gap-3 border-t lg:border-t-0 lg:border-l border-gray-100 pt-4 lg:pt-0 lg:pl-6 min-w-[200px]">
                                    <Button 
                                        onClick={() => handleAction(app.id, 'approved')}
                                        className="w-full bg-green-600 hover:bg-green-700 text-white shadow-sm"
                                        variant="primary"
                                    >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Approve
                                    </Button>
                                    <Button 
                                        variant="secondary"
                                        onClick={() => handleAction(app.id, 'rejected')}
                                        className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                                    >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Reject
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={() => router.push(`/brand/campaigns/${app.campaign_id}`)}
                                        className="w-full text-gray-500 hover:text-indigo-600"
                                    >
                                        View Details
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default BrandApplicationsPage;
