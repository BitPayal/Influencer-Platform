import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Layout } from '@/components/Layout';
import { Loader2, Plus, Megaphone, Calendar, Layers, Search, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Campaign {
  id: string;
  title: string;
  status: string;
  budget: number;
  created_at: string;
  application_count?: number;
}

const BrandCampaignsPage = () => {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }

        if (user?.role === 'marketing') {
            fetchCampaigns();
        }
    }, [user, authLoading]);

    const fetchCampaigns = async () => {
        try {
            const { data: brand } = await supabase.from('brands').select('id').eq('user_id', user?.id).limit(1).maybeSingle();
            if(!brand) return;

            const { data, error } = await supabase
                .from('campaigns')
                .select('*')
                .eq('brand_id', (brand as any).id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            
            // Fetch application counts for each campaign
            const campaignsWithCounts = await Promise.all(data.map(async (c) => {
                const { count } = await (supabase
                    .from('campaign_applications') as any)
                    .select('*', { count: 'exact', head: true })
                    .eq('campaign_id', (c as any).id);
                return { ...(c as any), application_count: count || 0 } as unknown as Campaign;
            }));

            setCampaigns(campaignsWithCounts);
        } catch (error) {
            console.error("Error fetching campaigns:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCampaigns = campaigns.filter(c => 
        c.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <Layout>
            <Head>
                <title>My Campaigns - Cehpoint</title>
            </Head>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                            My Campaigns
                        </h1>
                        <p className="mt-1 text-gray-500 text-sm sm:text-base">
                            Manage your active campaigns and track influencer applications
                        </p>
                    </div>
                    <Button 
                        onClick={() => router.push('/brand/create-campaign')} 
                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-200 transition-all w-full sm:w-auto"
                    >
                        <Plus className="h-5 w-5" /> 
                        Create Campaign
                    </Button>
                </div>

                {/* Filters & Search (Optional but good for UI) */}
                {campaigns.length > 0 && (
                     <div className="mb-6 flex flex-col sm:flex-row gap-4">
<div className="flex w-full max-w-md gap-2">
                             <div className="relative flex-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search campaigns..."
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm hover:shadow-md transition-all">
                                Search
                            </Button>
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {campaigns.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                            <div className="bg-indigo-50 p-4 rounded-full mb-4">
                                <Megaphone className="h-10 w-10 text-indigo-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No campaigns yet</h3>
                            <p className="text-gray-500 max-w-sm mb-8">
                                Get started by creating your first campaign to connect with influencers and grow your brand.
                            </p>
                            <Button 
                                onClick={() => router.push('/brand/create-campaign')} 
                                variant="secondary"
                                className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                            >
                                Start Your First Campaign
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        <th className="px-6 py-4">Campaign</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Budget</th>
                                        <th className="px-6 py-4">Applications</th>
                                        <th className="px-6 py-4">Created</th>
                                        <th className="px-6 py-4">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredCampaigns.map((campaign) => (
                                        <tr key={campaign.id} className="hover:bg-gray-50/80 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div>
                                                        <div className="font-medium text-gray-900">{campaign.title}</div>
                                                        <div className="text-xs text-gray-400 hidden sm:block">ID: {campaign.id.slice(0, 8)}...</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    campaign.status === 'active' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : campaign.status === 'completed'
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900 font-medium">₹{campaign.budget?.toLocaleString()}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                                    <Layers className="h-4 w-4 text-gray-400" />
                                                    {campaign.application_count}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                                    <Calendar className="h-4 w-4 text-gray-400" />
                                                    {new Date(campaign.created_at).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm"
                                                    onClick={() => router.push(`/brand/campaigns/${campaign.id}`)}
                                                    className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-medium gap-1 group-hover:translate-x-1 transition-transform"
                                                >
                                                    Manage <ArrowRight className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredCampaigns.length === 0 && (
                                <div className="p-8 text-center text-gray-500">
                                    No campaigns match your search.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default BrandCampaignsPage;
