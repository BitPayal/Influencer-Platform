
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
            // Fetch Campaigns
            const { data: campaignsData, error: campaignsError } = await supabase
                .from('campaigns')
                .select(`
                    *,
                    brands (
                        company_name,
                        logo_url,
                        location
                    )
                `)
                .eq('status', 'active')
                .order('created_at', { ascending: false });

            if (campaignsError) throw campaignsError;

            // Fetch Tasks (Admin created)
            const { data: tasksData, error: tasksError } = await supabase
                .from('tasks')
                .select('*')
                //.eq('is_default', true) // or just all? User said "Admin post a campaign" -> Task.
                .order('created_at', { ascending: false });

            if (tasksError) console.error('Error fetching tasks:', tasksError);

            // Normalize Tasks to look like Campaigns
            const normalizedTasks = (tasksData || []).map(task => ({
                id: task.id,
                title: task.title,
                description: task.description,
                budget: task.reward, // Map reward to budget
                deadline: null, // Tasks might not have deadline
                created_at: task.created_at,
                type: 'task', // innovative flag
                brands: {
                    company_name: 'Platform Task',
                    logo_url: null, // Could use a default icon
                    location: 'Remote'
                }
            }));
            
            // Normalize Campaigns (keep existing structure)
            const normalizedCampaigns = (campaignsData || []).map(c => ({
                ...c,
                type: 'campaign'
            }));

            // Combine
            const allOpportunities = [...normalizedCampaigns, ...normalizedTasks].sort(
                (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );

            setCampaigns(allOpportunities);
        } catch (error) {
            console.error("Error fetching opportunities:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50">
            <Head>
                <title>Active Opportunities - Cehpoint</title>
            </Head>

            <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Active Opportunities</h1>
                        <p className="text-gray-500 mt-2 text-lg">Discover and apply to campaigns that match your brand.</p>
                    </div>
                    <Button variant="secondary" onClick={() => router.push('/influencer/dashboard')} className="shrink-0">
                        Back to Dashboard
                    </Button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {campaigns.length === 0 ? (
                            <div className="col-span-full py-16 text-center bg-white rounded-2xl border-2 border-dashed border-gray-200">
                                <div className="mx-auto h-16 w-16 text-gray-300 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">No active campaigns</h3>
                                <p className="text-gray-500 mt-1">Check back later for new opportunities.</p>
                            </div>
                        ) : (
                            campaigns.map((campaign) => (
                                <div key={campaign.id} className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col h-full transform hover:-translate-y-1">
                                    {/* Brand Header */}
                                    <div className="p-6 pb-4 relative">
                                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                                        <div className="flex justify-between items-start mb-4 mt-2">
                                           <div className="flex items-center gap-3">
                                                <div className="h-12 w-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center p-2 text-indigo-600 font-bold text-xl">
                                                    {campaign.brands?.logo_url ? (
                                                        <img src={campaign.brands.logo_url} alt="" className="h-full w-full object-contain" />
                                                    ) : (
                                                        campaign.brands?.company_name?.charAt(0).toUpperCase() || 'B'
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Campaign by</p>
                                                    <p className="text-sm font-bold text-gray-900">{campaign.brands?.company_name || 'Brand'}</p>
                                                </div>
                                           </div>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                Active
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem] group-hover:text-indigo-600 transition-colors">
                                            {campaign.title}
                                        </h3>
                                        
                                        <p className="text-gray-600 text-sm line-clamp-2 mb-4 leading-relaxed">
                                            {campaign.description}
                                        </p>

                                        {/* Metadata Tags */}
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            <div className="inline-flex items-center px-3 py-1 rounded-lg bg-gray-50 text-xs font-medium text-gray-700 border border-gray-100">
                                                <svg className="w-3.5 h-3.5 mr-1.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                {campaign.brands?.location || 'Remote'}
                                            </div>
                                            <div className="inline-flex items-center px-3 py-1 rounded-lg bg-gray-50 text-xs font-medium text-gray-700 border border-gray-100">
                                                <svg className="w-3.5 h-3.5 mr-1.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                {campaign.deadline ? new Date(campaign.deadline).toLocaleDateString() : 'ASAP'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer / CTA */}
                                    <div className="bg-gray-50 p-6 pt-4 mt-auto border-t border-gray-100">
                                        <div className="flex items-end justify-between">
                                            <div>
                                                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Total Budget</p>
                                                <p className="text-2xl font-bold text-gray-900 tracking-tight">
                                                    ₹{campaign.budget?.toLocaleString() ?? 'Negotiable'}
                                                </p>
                                            </div>
                                            <Button 
                                                variant="primary" 
                                                onClick={() => {
                                                    if ((campaign as any).type === 'task') {
                                                        router.push(`/influencer/tasks/${campaign.id}`);
                                                    } else {
                                                        router.push(`/influencer/campaigns/${campaign.id}`);
                                                    }
                                                }}
                                                className="shadow-md shadow-indigo-200 hover:shadow-indigo-300 transition-all"
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
