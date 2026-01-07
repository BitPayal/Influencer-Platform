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

import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';

const CampaignDetailsPage = () => {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const { id } = router.query;
    
    const [activeTab, setActiveTab] = useState<Tab>('applications');
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [applications, setApplications] = useState<(CampaignApplication & { influencer: Influencer })[]>([]);
    const [videoSubmissions, setVideoSubmissions] = useState<(VideoSubmission & { influencer: Influencer })[]>([]);
    const [loading, setLoading] = useState(true);

    // Approval Modal State
    const [selectedVideo, setSelectedVideo] = useState<(VideoSubmission & { influencer: Influencer }) | null>(null);
    const [paymentRate, setPaymentRate] = useState<string>('0');
    const [txnId, setTxnId] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);

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
            let query = supabase
                .from('video_submissions')
                .select('*, influencer:influencers(*)')
                .order('created_at', { ascending: false });

            const approvedInfluencerIds = apps
                ?.filter(app => app.status === 'approved')
                .map(app => app.influencer_id) || [];

            if (approvedInfluencerIds.length > 0) {
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
            fetchCampaignDetails();
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

    const initiateApproval = (video: VideoSubmission & { influencer: Influencer }) => {
        setSelectedVideo(video);
        setPaymentRate(video.influencer?.video_rate?.toString() || '0');
        setTxnId('');
    };

    const confirmApproval = async () => {
        if (!selectedVideo) return;
        setIsProcessing(true);

        try {
            const finalRate = parseFloat(paymentRate) || 0;

            // 1. Update Influencer Rate (Dynamic Pricing)
            if (finalRate !== selectedVideo.influencer?.video_rate) {
                 const { error: rateError } = await (supabase
                    .from('influencers') as any)
                    .update({ video_rate: finalRate })
                    .eq('id', selectedVideo.influencer_id);
                
                if (rateError) throw new Error("Failed to update influencer rate: " + rateError.message);
            }

            // 2. Approve Video
            const { error: videoError } = await (supabase
                .from('video_submissions') as any)
                .update({ approval_status: 'approved', reviewed_at: new Date().toISOString() })
                .eq('id', selectedVideo.id);

            if (videoError) throw videoError;

            // 3. Create Payment (if rate > 0)
            if (finalRate > 0) {
                const status = txnId ? 'paid' : 'pending';
                const notes = txnId 
                    ? `Paid via UPI (Txn: ${txnId}) for video: ${selectedVideo?.title}`
                    : `Fixed payment for video: ${selectedVideo?.title} (Brand Approved)`;

                const { error: paymentError } = await supabase.from('payments' as any).insert({
                    influencer_id: selectedVideo.influencer_id,
                    video_submission_id: selectedVideo.id,
                    amount: finalRate,
                    payment_type: 'fixed',
                    status: status,
                    upi_transaction_id: txnId || null,
                    paid_at: txnId ? new Date().toISOString() : null, 
                    notes: notes
                } as any);

                if (paymentError) {
                     console.error("Error creating payment:", paymentError);
                     alert("Video approved but failed to create payment record.");
                } else {
                    alert(`Video Approved! Payment recorded as ${status.toUpperCase()}.`);
                }
            } else {
                alert("Video Approved! No payment recorded (rate is 0).");
            }

            setSelectedVideo(null);
            await fetchCampaignDetails();
            
        } catch (error: any) {
            console.error(error);
            alert(error.message || 'Error approving video');
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (!campaign) return <div className="p-8 text-center">Campaign not found</div>;

    const qrUrl = selectedVideo?.influencer?.upi_id && paymentRate 
        ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=${selectedVideo.influencer.upi_id}&pn=${encodeURIComponent(selectedVideo.influencer.full_name)}&am=${paymentRate}&cu=INR`
        : null;

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
                            {videoSubmissions.map(video => {
                                const embedUrl = (() => {
                                    if (!video.video_url) return null;
                                    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/)|youtu\.be\/)([^"&?\/\s]{11})/;
                                    const match = video.video_url.match(youtubeRegex);
                                    return match && match[1] ? `https://www.youtube.com/embed/${match[1]}` : null;
                                })();

                                return (
                                <div key={video.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                    <div className="aspect-video bg-gray-100 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden group">
                                         {embedUrl ? (
                                             <iframe 
                                                src={embedUrl} 
                                                className="w-full h-full" 
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                                allowFullScreen
                                             />
                                         ) : video.video_url ? (
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
                                            {video.approval_status && video.approval_status !== 'pending' && (
                                                <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                                                    video.approval_status === 'approved' ? 'bg-green-100 text-green-700' :
                                                    video.approval_status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                    {video.approval_status?.toUpperCase()}
                                                </span>
                                            )}
                                            {video.approval_status === 'approved' && video.influencer?.video_rate && (
                                                <span className="text-xs text-gray-500">
                                                    (Paid: ₹{video.influencer.video_rate})
                                                </span>
                                            )}
                                        </div>
                                        {video.approval_status !== 'approved' && (
                                            <Button onClick={() => initiateApproval(video)}>
                                                Approve & Pay
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )})}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'overview' && (
                <div>Stats placeholder</div>
            )}

            {/* Approval Modal */}
            <Modal
                isOpen={!!selectedVideo}
                onClose={() => setSelectedVideo(null)}
                title="Approve & Pay (UPI)"
            >
                <div className="space-y-6">
                    {/* Header */}
                    <div className="bg-blue-50 p-4 rounded-lg text-blue-800 text-sm">
                         <div className="flex justify-between">
                            <span className="font-semibold">Reviewing: {selectedVideo?.title}</span>
                            <span>{new Date().toLocaleDateString()}</span>
                         </div>
                        <p className="mt-1">Creator: {selectedVideo?.influencer?.full_name}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left: Rate Setting */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">
                                1. Set Payment Amount (₹)
                            </label>
                            <Input 
                                type="number" 
                                value={paymentRate} 
                                onChange={(e) => setPaymentRate(e.target.value)}
                                min="0"
                                className="font-bold text-lg"
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                Changing this updates the influencer's global rate for future videos.
                            </p>
                        </div>

                        {/* Right: QR Code */}
                        <div className="flex flex-col items-center justify-center border-l border-gray-100 pl-6">
                             {qrUrl ? (
                                <>
                                    <div className="bg-white p-2 border border-gray-200 rounded-lg shadow-sm">
                                        <img src={qrUrl} alt="UPI QR Code" className="w-32 h-32" />
                                    </div>
                                    <span className="text-xs text-gray-400 mt-2 font-mono">
                                        {selectedVideo?.influencer?.upi_id}
                                    </span>
                                    <span className="text-xs text-indigo-600 font-semibold mt-1">
                                        Scan to Pay ₹{paymentRate}
                                    </span>
                                </>
                             ) : (
                                 <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs text-center p-2">
                                     {selectedVideo?.influencer?.upi_id ? 'Enter amount to generate QR' : 'Influencer has no UPI ID'}
                                 </div>
                             )}
                        </div>
                    </div>

                    {/* Transaction Input */}
                    <div className="border-t border-gray-100 pt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            2. Transaction ID (Optional)
                        </label>
                         <p className="text-xs text-gray-500 mb-2">
                            Enter the UPI Reference ID after paying. If left blank, payment is marked as <strong>Pending</strong>.
                        </p>
                        <Input 
                            placeholder="e.g. 3214XXXXXXXX"
                            value={txnId}
                            onChange={(e) => setTxnId(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end gap-3 mt-4">
                        <Button variant="secondary" onClick={() => setSelectedVideo(null)}>
                            Cancel
                        </Button>
                        <Button 
                            variant="primary" 
                            onClick={confirmApproval} 
                            isLoading={isProcessing}
                            className={txnId ? "bg-green-600 hover:bg-green-700" : "bg-indigo-600 hover:bg-indigo-700"}
                        >
                            {txnId ? "Confirm Paid & Approve" : "Approve (Pay Later)"}
                        </Button>
                    </div>
                </div>
            </Modal>
        </Layout>
    );
};

export default CampaignDetailsPage;
