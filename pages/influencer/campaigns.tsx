
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Campaign, Brand } from '@/types';

interface CampaignWithBrand extends Campaign {
    brands: Brand; // Supabase returns joined data in this format
}

const BrowseCampaigns: React.FC = () => {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }
        fetchCampaigns();
    }, [user, authLoading]);

    const fetchCampaigns = async () => {
        try {
            const { data, error } = await supabase
                .from('campaigns')
                .select(`
                    *,
                    brands (
                        company_name,
                        logo_url
                    )
                `)
                .eq('status', 'active')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setCampaigns(data || []);
        } catch (error) {
            console.error("Error fetching campaigns:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Head>
                <title>Browse Campaigns - Cehpoint</title>
            </Head>

            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Active Opportunities</h1>
                    <Button variant="secondary" onClick={() => router.push('/influencer/dashboard')}>Back to Dashboard</Button>
                </div>

                {loading ? (
                    <div className="text-center py-12">Loading campaigns...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {campaigns.length === 0 ? (
                            <div className="col-span-full text-center py-12 text-gray-500">
                                No active campaigns found at the moment. Check back later!
                            </div>
                        ) : (
                            campaigns.map((campaign) => (
                                <div key={campaign.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex flex-col h-full">
                                    <div className="p-6 flex-1">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-xs font-semibold uppercase tracking-wide text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                                                Active
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                {new Date(campaign.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">{campaign.title}</h3>
                                        <p className="text-sm text-gray-600 mb-4 font-medium">
                                            by {campaign.brands?.company_name || 'Unknown Brand'}
                                        </p>
                                        
                                        <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                                            {campaign.description}
                                        </p>

                                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                                            <div className="text-sm">
                                                <span className="text-gray-500 block">Budget</span>
                                                <span className="font-semibold text-gray-900">₹{campaign.budget?.toLocaleString() ?? 'Negotiable'}</span>
                                            </div>
                                            <Button 
                                                variant="primary" 
                                                size="sm"
                                                onClick={() => router.push(`/influencer/campaigns/${campaign.id}`)}
                                            >
                                                View Details
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BrowseCampaigns;
