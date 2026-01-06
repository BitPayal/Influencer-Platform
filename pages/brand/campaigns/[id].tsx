import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Layout } from '@/components/Layout';
import { Loader2, Check, X, Video as VideoIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Campaign, CampaignApplication, VideoSubmission, Influencer, FollowerBand, RevenueShare } from '@/types';

type Tab = 'overview' | 'applications' | 'submissions';

const CampaignDetailsPage = () => {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const { id } = router.query;
    
    const [activeTab, setActiveTab] = useState<Tab>('applications');
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [applications, setApplications] = useState<(CampaignApplication & { influencer: Influencer })[]>([]);
    const [videoSubmissions, setVideoSubmissions] = useState<(VideoSubmission & { influencer: Influencer })[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }

        if (user && id) {
            fetchCampaignDetails();
        }
    }, [user, id, authLoading]);

    const fetchCampaignDetails = async () => {
        try {
            // 1. Fetch Campaign
            const { data: camp, error: campError } = await supabase
                .from('campaigns')
                .select('*')
                .eq('id', id as string)
                .single();
            
            if (campError) throw campError;
            setCampaign(camp);

            // 2. Fetch Applications
            const { data: apps, error: appsError } = await supabase
                .from('campaign_applications')
                .select('*, influencer:influencers(*)')
                .eq('campaign_id', id as string)
                .returns<(CampaignApplication & { influencer: Influencer })[]>();

            if (appsError) throw appsError;
            setApplications(apps || []);

            // 3. Fetch Video Submissions
            // Smart Fetch: Get videos linked to campaign OR unlinked videos from approved influencers
            let query = supabase
                .from('video_submissions')
                .select('*, influencer:influencers(*)')
                .order('created_at', { ascending: false });

            const approvedInfluencerIds = apps
                ?.filter(app => app.status === 'approved')
                .map(app => app.influencer_id) || [];

            if (approvedInfluencerIds.length > 0) {
                // Fetch videos for this campaign OR (unlinked AND from approved influencers)
                query = query.or(`campaign_id.eq.${id},and(campaign_id.is.null,influencer_id.in.(${approvedInfluencerIds.join(',')}))`);
            } else {
                query = query.eq('campaign_id', id);
            }

            const { data: videos, error: videoError } = await query;
            
            if (videoError) throw videoError;
            setVideoSubmissions(videos as any || []);

        } catch (error) {
            console.error("Error fetching campaign details:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveApplication = async (appId: string) => {
        try {
            const { error } = await (supabase
                .from('campaign_applications') as any)
                .update({ status: 'approved' })
                .eq('id', appId);

            if (error) throw error;
            fetchCampaignDetails(); // Refresh
        } catch (error) {
            alert('Error approving application');
        }
    };

    const handleRejectApplication = async (appId: string) => {
         try {
            const { error } = await (supabase
                .from('campaign_applications') as any)
                .update({ status: 'rejected' })
                .eq('id', appId);

            if (error) throw error;
            fetchCampaignDetails(); 
        } catch (error) {
            alert('Error rejecting application');
        }
    };

    const handleApproveVideo = async (video: VideoSubmission & { influencer: Influencer }) => {
        if (video.approval_status === 'approved') return;
        
        try {
            const rate = video.influencer?.video_rate || 0;

            // 1. Approve Video
            const { error: videoError } = await (supabase
                .from('video_submissions') as any)
                .update({ approval_status: 'approved', reviewed_at: new Date().toISOString() })
                .eq('id', video.id);

            if (videoError) throw videoError;

            // 2. Create Payment Record (if rate > 0)
            if (rate > 0) {
                const { error: paymentError } = await supabase.from('payments' as any).insert({
                    influencer_id: video.influencer_id,
                    video_submission_id: video.id,
                    amount: rate,
                    payment_type: 'fixed',
                    payment_status: 'pending',
                    notes: `Fixed payment for video: ${video.title} (Brand Approved)`
                } as any);

                if (paymentError) {
                     console.error("Error creating payment:", paymentError);
                     // Don't throw, just warn, as video is approved.
                     alert("Video approved but failed to create payment record.");
                }
            }

            fetchCampaignDetails();
            alert("Video Approved Successfully!");
        } catch (error: any) {
            console.error(error);
            alert(error.message || 'Error approving video');
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (!campaign) return <div className="p-8 text-center">Campaign not found</div>;

    return (
        <Layout>
             <Head>
                <title>{campaign.title} - Management</title>
            </Head>

            <div className="mb-6">
                <Button variant="secondary" onClick={() => router.push('/brand/campaigns')}>&larr; Back to Campaigns</Button>
                <h1 className="text-3xl font-bold text-gray-900 mt-4">{campaign.title}</h1>
                <p className="text-gray-600">Budget: ₹{campaign.budget?.toLocaleString()}</p>
            </div>

            <div className="flex gap-4 border-b border-gray-200 mb-6">
                {(['overview', 'applications', 'submissions'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {activeTab === 'applications' && (
                <div>
                     <h2 className="text-xl font-semibold mb-4">Pending Applications</h2>
                     {applications.filter(a => a.status === 'pending').length === 0 ? (
                         <p className="text-gray-500">No pending applications.</p>
                     ) : (
                        <div className="space-y-4">
                            {applications.filter(a => a.status === 'pending').map(app => (
                                <div key={app.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold text-gray-900">{app.influencer?.full_name}</h3>
                                        <p className="text-sm text-gray-600">{app.cover_message}</p>
                                        <p className="text-xs text-gray-500 mt-1">Bid: ₹{app.bid_amount}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="secondary" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleRejectApplication(app.id)}>Reject</Button>
                                        <Button size="sm" onClick={() => handleApproveApplication(app.id)}>Approve</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                     )}

                     <h2 className="text-xl font-semibold mt-8 mb-4">Approved Influencers</h2>
                     <div className="space-y-2">
                        {applications.filter(a => a.status === 'approved').map(app => (
                            <div key={app.id} className="bg-gray-50 p-3 rounded flex justify-between">
                                <span>{app.influencer?.full_name}</span>
                                <span className="text-green-600 text-sm font-medium">Approved</span>
                            </div>
                        ))}
                     </div>
                </div>
            )}

            {activeTab === 'submissions' && (
                <div>
                    <h2 className="text-xl font-semibold mb-4">Video Submissions</h2>
                    {videoSubmissions.length === 0 ? (
                        <p className="text-gray-500">No videos submitted yet.</p>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-6">
                            {videoSubmissions.map(video => (
                                <div key={video.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                    <div className="aspect-video bg-gray-100 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden group">
                                         {video.video_url ? (
                                            <video src={video.video_url} controls className="w-full h-full object-cover" />
                                         ) : (
                                             <VideoIcon className="h-12 w-12 text-gray-300" />
                                         )}
                                    </div>
                                    <h3 className="font-bold text-lg">{video.title}</h3>
                                    <p className="text-gray-600 text-sm mb-2">By {video.influencer?.full_name}</p>
                                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">{video.description}</p>
                                    
                                    <div className="flex justify-between items-center mt-4">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                                                video.approval_status === 'approved' ? 'bg-green-100 text-green-700' :
                                                video.approval_status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {video.approval_status?.toUpperCase() || 'PENDING'}
                                            </span>
                                        </div>
                                        {video.approval_status !== 'approved' && (
                                            <Button onClick={() => handleApproveVideo(video)}>
                                                Approve & Pay
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'overview' && (
                <div>Stats placeholder</div>
            )}

        </Layout>
    );
};

export default CampaignDetailsPage;
