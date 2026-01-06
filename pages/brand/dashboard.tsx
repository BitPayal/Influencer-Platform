
import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Layout } from '@/components/Layout';
import { AlertCircle, RefreshCw } from 'lucide-react';

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

          setStats({
              activeCampaigns: campaignCount || 0,
              pendingApplications: applicationCount,
              totalSpent: 0 // Placeholder for now
          });

      } catch (error) {
          console.error("Error fetching stats:", error);
          throw error; // Propagate to main loader
      }
  };

  if (authLoading || loading) {
      return (
          <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
              <p className="text-gray-500 font-medium">Loading Dashboard...</p>
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
                  <Button onClick={loadDashboardData} variant="primary" className="w-full">
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
        <title>Brand Dashboard - Cehpoint</title>
      </Head>

      <div className="animate-fade-in">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
                <p className="mt-1 text-gray-600">Welcome back, {profile?.company_name || 'Partner'}!</p>
            </div>
            <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div 
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:border-indigo-100 transition-all duration-200 group"
                onClick={() => router.push('/brand/campaigns')}
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-700 group-hover:text-indigo-600 transition-colors">Active Campaigns</h3>
                    <div className="h-8 w-8 bg-indigo-50 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 text-xs">●</span>
                    </div>
                </div>
                <p className="text-4xl font-extrabold text-gray-900 mt-2">{stats.activeCampaigns}</p>
                <p className="text-sm text-gray-400 mt-2">Live and running</p>
            </div>
            
            <div 
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:border-orange-100 transition-all duration-200 group"
                onClick={() => router.push('/brand/applications')}
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-700 group-hover:text-orange-600 transition-colors">Pending Applications</h3>
                     <div className="h-8 w-8 bg-orange-50 rounded-full flex items-center justify-center">
                        <span className="text-orange-600 text-xs">●</span>
                    </div>
                </div>
                <p className="text-4xl font-extrabold text-gray-900 mt-2">{stats.pendingApplications}</p>
                 <p className="text-sm text-gray-400 mt-2">Waiting for approval</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-700">Total Spent</h3>
                     <div className="h-8 w-8 bg-green-50 rounded-full flex items-center justify-center">
                        <span className="text-green-600 text-xs">₹</span>
                    </div>
                </div>
                <p className="text-4xl font-extrabold text-gray-900 mt-2">₹{stats.totalSpent.toLocaleString()}</p>
                 <p className="text-sm text-gray-400 mt-2">Lifetime investment</p>
            </div>
        </div>

        <div className="border-2 border-dashed border-gray-200 rounded-2xl h-80 flex flex-col items-center justify-center bg-gray-50 hover:bg-white hover:border-indigo-200 transition-all duration-300">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Get Started</h2>
            <p className="text-gray-500 mb-8 max-w-sm text-center">Ready to grow your brand? Launch a new campaign or connect with top influencers today.</p>
            <div className="flex flex-wrap justify-center gap-4">
               <Button variant="primary" onClick={() => router.push('/brand/create-campaign')} className="shadow-lg shadow-indigo-200">
                   Create Campaign
               </Button>
               <Button variant="secondary" onClick={() => router.push('/brand/search')} className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700">
                   Find Influencers
               </Button>
               <Button variant="secondary" onClick={() => router.push('/admin/influencers')} className="border-indigo-200 text-indigo-600 hover:bg-indigo-50">
                   Approve Influencers
               </Button>
            </div>
        </div>
      </div>
    </Layout>
  );
};

export default BrandDashboard;
