
import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Layout } from '@/components/Layout';
import { AlertCircle, RefreshCw, TrendingUp, Users, CreditCard, Plus, Search } from 'lucide-react';

const BrandDashboard: React.FC = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const [profile, setProfile] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const router = useRouter();

  const [stats, setStats] = React.useState({
    activeCampaigns: 0,
    pendingApplications: 0,
    totalSpent: 0
  });

  React.useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user?.role === 'marketing') {
      loadDashboardData();
    }
  }, [user, authLoading]);

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
        await Promise.all([
            fetchBrandProfile(),
            fetchDashboardStats()
        ]);
    } catch (err: any) {
        console.error("Dashboard loading error:", err);
        setError(err.message || "Failed to load dashboard data");
    } finally {
        setLoading(false);
    }
  };

  const fetchBrandProfile = async () => {
    try {
      const promise = supabase
        .from('brands')
        .select('*')
        .eq('user_id', user?.id)
        .limit(1)
        .maybeSingle();
      
      const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve({ data: null, error: { message: 'Profile fetch timed out' } }), 60000));
      // No strict need for catch here as it resolves, but good practice if we switched to reject
      
      const { data, error } = await Promise.race([
          promise,
          timeoutPromise
      ]) as any;
      
      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.warn('Error fetching brand profile:', error);
      // Don't crash dashboard for profile error, just log it
    }
  };

  const fetchDashboardStats = async () => {
      if (!user) return;
      
      try {
          // Get Brand ID first (with timeout)
          // Handle potential duplicate brands by taking the first one
          const brandPromise = supabase.from('brands').select('id').eq('user_id', user.id).limit(1).maybeSingle();
          const brandTimeout = new Promise((resolve) => setTimeout(() => resolve({ data: null, error: { message: 'Brand details fetch timed out' } }), 60000));
          
          const { data: brand, error: brandError } = await Promise.race([
             brandPromise,
             brandTimeout
          ]) as any;

          if (brandError || !brand) {
             console.warn("Brand not found or error:", brandError);
             return;
          }

          // Campaigns
          const campaignsPromise = supabase
              .from('campaigns')
              .select('*', { count: 'exact', head: true })
              .eq('brand_id', brand.id)
              .eq('status', 'active');
          
          const campaignsTimeout = new Promise((resolve) => setTimeout(() => resolve({ count: 0, error: { message: 'Campaigns fetch timed out' } }), 60000));
          
          const { count: campaignCount, error: campaignError } = await Promise.race([
              campaignsPromise,
              campaignsTimeout
          ]) as any;

          if (campaignError) throw campaignError;

          // Applications 
          // Fetch campaigns first to get IDs
          const { data: campaigns } = await supabase.from('campaigns').select('id').eq('brand_id', brand.id);
          const campaignIds = campaigns?.map((c: any) => c.id) || [];
          
          let applicationCount = 0;
          if (campaignIds.length > 0) {
              const applicationsPromise = supabase
                  .from('campaign_applications')
                  .select('*', { count: 'exact', head: true })
                  .in('campaign_id', campaignIds)
                  .eq('status', 'pending');

              const appsTimeout = new Promise((resolve) => setTimeout(() => resolve({ count: 0, error: { message: 'Applications fetch timed out' } }), 60000));

              const { count, error: appError } = await Promise.race([
                applicationsPromise,
                appsTimeout
              ]) as any;
              
              if (appError) throw appError;

              applicationCount = count || 0;
          }


          // Total Spent Calculation
          let totalSpent = 0;
          if (campaignIds.length > 0) {
                // 1. Get all video submissions for these campaigns
                const { data: videos } = await supabase
                    .from('video_submissions')
                    .select('id')
                    .in('campaign_id', campaignIds);
                
                const videoIds = videos?.map((v: any) => v.id) || [];

                if (videoIds.length > 0) {
                    // 2. Get all PAID payments for these videos
                    const { data: payments } = await supabase
                        .from('payments')
                        .select('amount')
                        .in('video_submission_id', videoIds)
                        .eq('status', 'paid');
                    
                    if (payments) {
                        totalSpent = (payments as any[]).reduce((sum, p) => sum + (p.amount || 0), 0);
                    }
                }
          }

          setStats({
              activeCampaigns: campaignCount || 0,
              pendingApplications: applicationCount,
              totalSpent: totalSpent
          });

      } catch (error) {
          console.error("Error fetching stats:", error);
          throw error; // Propagate to main loader
      }
  };

  if (authLoading || loading) {
      return (
          <Layout>
              <Head>
                <title>Brand Dashboard - Cehpoint</title>
              </Head>
              <div className="flex flex-col justify-center items-center h-[calc(100vh-100px)]">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                  <p className="text-gray-500 font-medium">Loading Dashboard...</p>
              </div>
          </Layout>
      );
  }

  if (error) {
      return (
          <Layout>
              <Head>
                <title>Brand Dashboard - Cehpoint</title>
              </Head>
              <div className="flex flex-col justify-center items-center h-[calc(100vh-100px)] p-4">
                  <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
                      <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                      <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
                      <p className="text-gray-600 mb-6">{error}</p>
                      <Button onClick={loadDashboardData} variant="primary" className="w-full">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Retry
                      </Button>
                  </div>
              </div>
          </Layout>
      );
  }

  return (
    <Layout>
      <Head>
        <title>Brand Dashboard - Cehpoint</title>
      </Head>

      <div className="animate-fade-in space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-6">
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Dashboard</h1>
                <p className="mt-2 text-gray-600 text-lg">
                    Welcome back, <span className="font-semibold text-indigo-600">{profile?.company_name || 'Partner'}</span>!
                </p>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-indigo-700 bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100 shadow-sm">
                 <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Active Campaigns Card */}
            <div 
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
                onClick={() => router.push('/brand/campaigns')}
            >
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                     <TrendingUp className="w-32 h-32 text-indigo-600 transform rotate-12 translate-x-8 -translate-y-8" />
                </div>
                <div className="flex items-center justify-between mb-6 relative z-10">
                    <div className="p-3.5 bg-indigo-50 rounded-2xl group-hover:bg-indigo-600 transition-colors duration-300 shadow-sm">
                        <TrendingUp className="w-6 h-6 text-indigo-600 group-hover:text-white transition-colors" />
                    </div>
                    <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        Live
                    </span>
                </div>
                <div className="relative z-10">
                     <p className="text-sm font-medium text-gray-500 mb-1">Active Campaigns</p>
                     <h3 className="text-4xl font-bold text-gray-900 tracking-tight">{stats.activeCampaigns}</h3>
                </div>
            </div>

            {/* Pending Applications Card */}
            <div 
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
                onClick={() => router.push('/brand/applications')}
            >
                 <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                     <Users className="w-32 h-32 text-orange-600 transform rotate-12 translate-x-8 -translate-y-8" />
                </div>
                <div className="flex items-center justify-between mb-6 relative z-10">
                    <div className="p-3.5 bg-orange-50 rounded-2xl group-hover:bg-orange-600 transition-colors duration-300 shadow-sm">
                        <Users className="w-6 h-6 text-orange-600 group-hover:text-white transition-colors" />
                    </div>
                     {stats.pendingApplications > 0 && (
                        <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-orange-700 bg-orange-50 px-3 py-1 rounded-full border border-orange-100 animate-pulse">
                            Approvals Pending
                        </span>
                     )}
                </div>
                <div className="relative z-10">
                     <p className="text-sm font-medium text-gray-500 mb-1">Pending Applications</p>
                     <h3 className="text-4xl font-bold text-gray-900 tracking-tight">{stats.pendingApplications}</h3>
                </div>
            </div>

            {/* Total Spent Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                     <CreditCard className="w-32 h-32 text-emerald-600 transform rotate-12 translate-x-8 -translate-y-8" />
                </div>
                <div className="flex items-center justify-between mb-6 relative z-10">
                    <div className="p-3.5 bg-emerald-50 rounded-2xl group-hover:bg-emerald-600 transition-colors duration-300 shadow-sm">
                        <CreditCard className="w-6 h-6 text-emerald-600 group-hover:text-white transition-colors" />
                    </div>
                </div>
                <div className="relative z-10">
                     <p className="text-sm font-medium text-gray-500 mb-1">Total Spent</p>
                     <h3 className="text-4xl font-bold text-gray-900 tracking-tight">₹{stats.totalSpent.toLocaleString()}</h3>
                </div>
            </div>
        </div>

        {/* Quick Actions Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-purple-700 shadow-xl">
            {/* Abstract Background Shapes */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-purple-500 opacity-20 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 px-8 py-10 sm:px-10 sm:py-12 flex flex-col lg:flex-row items-center justify-between gap-8">
                <div className="text-center lg:text-left max-w-2xl">
                    <h2 className="text-3xl font-extrabold text-white mb-4 tracking-tight">Ready to expand your reach?</h2>
                    <p className="text-indigo-100 text-lg leading-relaxed">
                        Launch a new campaign today or discover the perfect influencers to elevate your brand's presence.
                    </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                     <Button 
                        onClick={() => router.push('/brand/create-campaign')} 
                        className="bg-white text-indigo-700 hover:bg-gray-50 border-transparent shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all font-bold px-8 py-4 h-auto text-base rounded-xl w-full sm:w-auto justify-center"
                     >
                        <Plus className="w-5 h-5 mr-2 stroke-[3]" />
                        Create Campaign
                    </Button>
                     <Button 
                        variant="ghost"
                        onClick={() => router.push('/brand/search')} 
                        className="bg-indigo-800/40 text-white hover:bg-indigo-800/50 border border-indigo-400/30 shadow-lg backdrop-blur-md font-semibold px-8 py-4 h-auto text-base rounded-xl w-full sm:w-auto justify-center"
                     >
                        <Search className="w-5 h-5 mr-2" />
                        Find Influencers
                    </Button>
                </div>
            </div>
        </div>
      </div>
    </Layout>
  );
};

export default BrandDashboard;
