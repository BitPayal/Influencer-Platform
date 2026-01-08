
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';
import { 
  Briefcase, 
  MapPin, 
  Calendar, 
  DollarSign, 
  AlertCircle, 
  FileText, 
  ArrowLeft 
} from 'lucide-react';

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
        <div className="min-h-screen bg-gray-50/50 pb-12">
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

            {/* Header / Nav */}
            <div className="bg-white border-b border-gray-200 sticky top-14 z-20 shadow-sm">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                     <Button variant="ghost" onClick={() => router.back()} className="text-gray-500 hover:text-gray-900 -ml-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Campaigns
                     </Button>
                     <span className="text-sm text-gray-400 font-mono">ID: {campaign.id.slice(0,8)}</span>
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    
                    {/* Left Column: Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Title Card */}
                        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200">
                            <div className="flex justify-between items-start gap-4 mb-6">
                                <div className="flex items-center gap-4">
                                     <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-600 shadow-inner">
                                        {campaign.brands?.company_name?.charAt(0).toUpperCase() || 'B'}
                                     </div>
                                     <div>
                                         <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-1">{campaign.title}</h1>
                                         <div className="flex items-center text-gray-500 text-sm font-medium">
                                             <span>by {campaign.brands?.company_name}</span>
                                             <span className="mx-2">•</span>
                                             <span className="text-indigo-600">{campaign.brands?.industry || 'Brand Partner'}</span>
                                         </div>
                                     </div>
                                </div>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200 shadow-sm">
                                    Active Campaign
                                </span>
                            </div>

                            <div className="prose prose-indigo max-w-none text-gray-600 leading-relaxed">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">About the Campaign</h3>
                                <p className="mb-0">{campaign.description}</p>
                            </div>
                        </div>

                        {/* Requirements Card */}
                        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200">
                             <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Requirements & Deliverables</h2>
                             </div>
                            
                            {campaign.requirements ? (
                                <div className="space-y-4">
                                    <div className="bg-orange-50/50 rounded-xl p-5 border border-orange-100/50">
                                        <div className="prose prose-orange max-w-none text-gray-700">
                                            {campaign.requirements}
                                        </div>
                                    </div>
                                    <div className="flex gap-3 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                                        <AlertCircle className="w-5 h-5 text-gray-400 shrink-0" />
                                        <p>Please ensure you can meet all requirements before applying. Incomplete submissions may be rejected.</p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">No specific requirements listed.</p>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Sticky Sidebar */}
                    <div className="lg:col-span-1 lg:sticky lg:top-36 space-y-6">
                        
                        {/* Campaign Meta Card */}
                        <div className="bg-white rounded-2xl shadow-lg shadow-indigo-100/50 border border-indigo-50 overflow-hidden">
                            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4 text-white">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-indigo-200" />
                                    Campaign Details
                                </h3>
                            </div>
                            <div className="p-6 space-y-5">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-green-50 rounded-lg text-green-600 mt-1">
                                        <DollarSign className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Budget</p>
                                        <p className="text-xl font-bold text-gray-900 font-mono">₹{campaign.budget?.toLocaleString()}</p> 
                                        <p className="text-xs text-gray-400 mt-0.5">Negotiable based on reach</p>
                                    </div>
                                </div>

                                <div className="w-full h-px bg-gray-100"></div>

                                <div className="flex items-start gap-4">
                                     <div className="p-2 bg-blue-50 rounded-lg text-blue-600 mt-1">
                                        <Calendar className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Deadline</p>
                                        <p className="text-sm font-bold text-gray-900">
                                            {campaign.deadline ? new Date(campaign.deadline).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'No Deadline'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                     <div className="p-2 bg-purple-50 rounded-lg text-purple-600 mt-1">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Location</p>
                                        <p className="text-sm font-bold text-gray-900">{campaign.brands?.location || 'Remote'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Application Form Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold">1</span>
                                Submit Application
                            </h3>

                            {applicationStatus ? (
                                <div className={`p-4 rounded-xl text-center border-2 border-dashed ${
                                    applicationStatus === 'approved' ? 'bg-green-50 border-green-200 text-green-800' :
                                    applicationStatus === 'rejected' ? 'bg-red-50 border-red-200 text-red-800' :
                                    'bg-yellow-50 border-yellow-200 text-yellow-800'
                                }`}>
                                    <div className="mb-2 text-2xl">
                                        {applicationStatus === 'approved' ? '🎉' : applicationStatus === 'rejected' ? '❌' : '⏳'}
                                    </div>
                                    <p className="font-semibold">Application {applicationStatus.charAt(0).toUpperCase() + applicationStatus.slice(1)}</p>
                                    <p className="text-xs opacity-75 mt-1">Check back later for updates</p>
                                </div>
                            ) : (
                                <form onSubmit={handleApply} className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Your Bid Amount</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-gray-400 font-semibold">₹</span>
                                            <Input
                                                id="bid"
                                                type="number"
                                                value={bidAmount}
                                                onChange={(e) => setBidAmount(e.target.value)}
                                                required
                                                placeholder={campaign.budget?.toString()}
                                                className="pl-8 font-mono text-lg font-semibold text-gray-900"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Cover Message</label>
                                        <textarea 
                                            className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-none"
                                            rows={4}
                                            value={coverMessage}
                                            onChange={(e) => setCoverMessage(e.target.value)}
                                            placeholder="Introduce yourself and explain why you're perfect for this campaign..."
                                            required
                                        />
                                    </div>

                                    <Button 
                                        type="submit" 
                                        variant="primary" 
                                        className="w-full py-6 font-bold text-base shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all rounded-xl" 
                                        isLoading={applying}
                                    >
                                        Send Proposal
                                    </Button>
                                    <p className="text-center text-xs text-gray-400 mt-2">
                                        By applying you agree to our terms of service.
                                    </p>
                                </form>
                            )}
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
};

export default CampaignDetails;
