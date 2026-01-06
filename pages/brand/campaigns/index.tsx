import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Layout } from '@/components/Layout';
import { Loader2, Plus } from 'lucide-react';
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

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <Layout>
            <Head>
                <title>My Campaigns - Cehpoint</title>
            </Head>

            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Campaigns</h1>
                    <p className="mt-1 text-gray-600">Manage your active campaigns and applications</p>
                </div>
                <Button onClick={() => router.push('/brand/create-campaign')} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" /> Create Campaign
                </Button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {campaigns.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No campaigns found. Create your first campaign to get started!
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Title</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Status</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Budget</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Applications</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Created</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {campaigns.map((campaign) => (
                                    <tr key={campaign.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{campaign.title}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                campaign.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                            }`}>
                                                {campaign.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">₹{campaign.budget?.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-gray-600">{campaign.application_count}</td>
                                        <td className="px-6 py-4 text-gray-500 text-sm">
                                            {new Date(campaign.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Button 
                                                variant="secondary" 
                                                size="sm"
                                                onClick={() => router.push(`/brand/campaigns/${campaign.id}`)}
                                            >
                                                Manage
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default BrandCampaignsPage;
