
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';

const CampaignDetails: React.FC = () => {
    const router = useRouter();
    const { id } = router.query;
    const { user, loading: authLoading } = useAuth();
    
    const [campaign, setCampaign] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
    const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    // Application Form
    const [bidAmount, setBidAmount] = useState('');
    const [coverMessage, setCoverMessage] = useState('');

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }
        if (id && user) {
            fetchCampaignDetails();
            checkApplicationStatus();
        }
    }, [id, user, authLoading]);

    const fetchCampaignDetails = async () => {
        try {
            const { data, error } = await supabase
                .from('campaigns')
                .select(`
                    *,
                    brands (
                        company_name,
                        website,
                        industry,
                        location
                    )
                `)
                .eq('id', id)
                .single();

            if (error) throw error;
            setCampaign(data);
        } catch (error) {
            console.error("Error fetching campaign:", error);
        } finally {
            setLoading(false);
        }
    };

    const checkApplicationStatus = async () => {
        try {
            // Need to get influencer ID first
            const { data: influencer } = await supabase
                .from('influencers')
                .select('id')
                .eq('user_id', user?.id)
                .single() as { data: any | null };

            if (influencer) {
                const { data } = await supabase
                    .from('campaign_applications')
                    .select('status')
                    .eq('campaign_id', id)
                    .eq('influencer_id', influencer.id)
                    .maybeSingle() as { data: any | null }; // Use maybeSingle to avoid 406 if not found
                
                if (data) setApplicationStatus(data.status);
            }
        } catch (error) {
             console.error("Error checking status:", error);
        }
    };

    const handleApply = async (e: React.FormEvent) => {
        e.preventDefault();
        setApplying(true);
        setToast(null);

        try {
             const { data: influencer } = await supabase
                .from('influencers')
                .select('id')
                .eq('user_id', user?.id)
                .single() as { data: any | null };

            if (!influencer) {
                setToast({ type: 'error', message: "Please complete your influencer profile first." });
                setTimeout(() => {
                    router.push('/influencer/profile');
                }, 2000);
                return;
            }

            const { error } = await supabase.from('campaign_applications').insert({
                campaign_id: id,
                influencer_id: influencer.id,
                bid_amount: parseFloat(bidAmount) || 0,
                cover_message: coverMessage,
                status: 'pending' // Default status
            } as any);

            if (error) throw error;

            setApplicationStatus('pending');
            setToast({ type: 'success', message: "Application submitted successfully!" });

        } catch (error: any) {
            console.error("Error applying:", error);
            if (error.code === '23505') { // Unique violation
                setToast({ type: 'error', message: "You have already applied to this campaign." });
            } else {
                setToast({ type: 'error', message: "Failed to submit application. Please try again." });
            }
        } finally {
            setApplying(false);
        }
    };

    if (loading) return <div className="text-center py-12">Loading...</div>;
    if (!campaign) return <div className="text-center py-12">Campaign not found</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <Head>
                <title>{campaign.title} - Cehpoint</title>
            </Head>
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <Button variant="ghost" onClick={() => router.back()} className="mb-6">← Back to Campaigns</Button>

                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="bg-indigo-600 px-8 py-6">
                        <h1 className="text-3xl font-bold text-white mb-2">{campaign.title}</h1>
                        <p className="text-indigo-100 text-lg">by {campaign.brands?.company_name}</p>
                    </div>
                    
                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="md:col-span-2 space-y-8">
                                <section>
                                    <h2 className="text-xl font-bold text-gray-900 mb-3">Description</h2>
                                    <div className="prose text-gray-700 whitespace-pre-wrap">
                                        {campaign.description}
                                    </div>
                                </section>

                                {campaign.requirements && (
                                    <section className="bg-orange-50 p-6 rounded-lg border border-orange-100">
                                        <h2 className="text-xl font-bold text-gray-900 mb-3">Requirements</h2>
                                        <div className="prose text-gray-700 whitespace-pre-wrap">
                                            {campaign.requirements}
                                        </div>
                                    </section>
                                )}
                            </div>

                            <div className="space-y-6">
                                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                                    <h3 className="font-semibold text-gray-900 mb-4">Campaign Details</h3>
                                    <div className="space-y-3 text-sm">
                                        <div>
                                            <span className="text-gray-500 block">Budget</span>
                                            <span className="font-bold text-gray-900 text-lg">₹{campaign.budget?.toLocaleString() ?? 'Negotiable'}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 block">Deadline</span>
                                            <span className="font-medium text-gray-900">
                                                {campaign.deadline ? new Date(campaign.deadline).toLocaleDateString() : 'No Deadline'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 block">Location</span>
                                            <span className="font-medium text-gray-900">{campaign.brands?.location || 'Remote'}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 block">Industry</span>
                                            <span className="font-medium text-gray-900">{campaign.brands?.industry}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Application Status / Form */}
                                <div className="border-t border-gray-200 pt-6">
                                    {applicationStatus ? (
                                        <div className={`p-4 rounded-lg text-center font-medium ${
                                            applicationStatus === 'approved' ? 'bg-green-100 text-green-800' :
                                            applicationStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            Application Status: {applicationStatus.charAt(0).toUpperCase() + applicationStatus.slice(1)}
                                        </div>
                                    ) : (
                                        <form onSubmit={handleApply} className="space-y-4">
                                            <h3 className="font-bold text-gray-900">Apply Now</h3>
                                            <Input
                                                id="bid"
                                                label="Your Bid (₹)"
                                                type="number"
                                                value={bidAmount}
                                                onChange={(e) => setBidAmount(e.target.value)}
                                                required
                                                placeholder={campaign.budget?.toString()}
                                            />
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-sm font-medium text-gray-700">Cover Message</label>
                                                <textarea 
                                                    className="w-full rounded-md border border-gray-300 p-2 text-sm"
                                                    rows={3}
                                                    value={coverMessage}
                                                    onChange={(e) => setCoverMessage(e.target.value)}
                                                    placeholder="Why are you a good fit?"
                                                    required
                                                />
                                            </div>
                                            <Button type="submit" variant="primary" className="w-full" isLoading={applying}>
                                                Submit Application
                                            </Button>
                                        </form>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CampaignDetails;
