import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Influencer, InfluencerStats } from '@/types';
import { Video, DollarSign, CheckCircle, Clock } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import Head from 'next/head';

const InfluencerDashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [influencer, setInfluencer] = useState<Influencer | null>(null);
  const [stats, setStats] = useState<InfluencerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const mounted = React.useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user && user.role !== 'influencer') {
      router.push('/admin/dashboard');
    } else if (user) {
      fetchInfluencerData();
    }
  }, [user, authLoading, router]);

  const fetchInfluencerData = async () => {
    try {
      const influencerPromise = supabase
        .from('influencers')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      const { data: influencerData, error: influencerError } = await Promise.race([
          influencerPromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Fetching profile timed out')), 10000))
      ]) as any;

      if (influencerError) throw influencerError;
      setInfluencer(influencerData);

      // Fetch videos and payments in parallel
      const videosPromise = supabase
        .from('video_submissions')
        .select('*')
        .eq('influencer_id', influencerData.id);

      const paymentsPromise = supabase
        .from('payments')
        .select('*')
        .eq('influencer_id', influencerData.id);

      const [videosResult, paymentsResult] = await Promise.all([
          Promise.race([
              videosPromise, 
              new Promise((resolve) => setTimeout(() => resolve({ data: [], error: { message: 'Fetching videos timed out' } }), 10000))
          ]) as any,
          Promise.race([
              paymentsPromise,
              new Promise((resolve) => setTimeout(() => resolve({ data: [], error: { message: 'Fetching payments timed out' } }), 10000))
          ]) as any
      ]);

      const videosData = videosResult.data || [];
      const paymentsData = paymentsResult.data || [];

      // Calculate stats
      const thisMonth = new Date().toISOString().slice(0, 7);
      const thisMonthVideos =
        videosData.filter(
          (v: any) =>
            v.submitted_at.startsWith(thisMonth) &&
            v.approval_status === 'approved'
        ) || [];

      const statsData: InfluencerStats = {
        total_videos_submitted: videosData.length,
        approved_videos:
          videosData.filter((v: any) => v.approval_status === 'approved').length,
        rejected_videos:
          videosData.filter((v: any) => v.approval_status === 'rejected').length,
        pending_videos:
          videosData.filter((v: any) => v.approval_status === 'pending').length,
        total_earnings:
          paymentsData
            .filter((p: any) => p.payment_status === 'paid')
            .reduce((sum: number, p: any) => sum + p.amount, 0),
        pending_payments:
          paymentsData
            .filter((p: any) => p.payment_status === 'pending')
            .reduce((sum: number, p: any) => sum + p.amount, 0),
        this_month_posts: thisMonthVideos.length,
        eligible_for_revenue_share: thisMonthVideos.length >= 2,
      };

      setStats(statsData);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      // Optional: set an error state here if you want to show it in UI
    } finally {
      if (mounted.current) setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>Dashboard - Cehpoint Marketing Partners</title>
      </Head>

      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-gray-600">Welcome back, {influencer?.full_name}!</p>
        </div>

        {influencer?.approval_status === 'pending' && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-yellow-600 mr-2" />
              <p className="text-yellow-800">
                Your account is pending approval. You will be notified once your
                application is reviewed.
              </p>
            </div>
          </div>
        )}

        {influencer?.approval_status === 'rejected' && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">
              Your application was not approved. Please contact support for more
              information.
            </p>
          </div>
        )}

        {influencer?.approval_status === 'approved' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Link href="/influencer/videos">
                <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
                  <div className="flex items-center h-full">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <Video className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">Total Videos</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats?.total_videos_submitted || 0}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>

              <Link href="/influencer/videos?status=approved">
                <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
                  <div className="flex items-center h-full">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">Approved</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats?.approved_videos || 0}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>

              <Link href="/influencer/videos?status=pending">
                <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
                  <div className="flex items-center h-full">
                    <div className="bg-yellow-100 p-3 rounded-lg">
                      <Clock className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">Pending Review</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats?.pending_videos || 0}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>

              <Link href="/influencer/revenue">
                <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
                  <div className="flex items-center h-full">
                    <div className="bg-primary-100 p-3 rounded-lg">
                      <DollarSign className="h-6 w-6 text-primary-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">Total Earnings</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(stats?.total_earnings || 0)}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card title="Quick Actions">
                <div className="space-y-3">
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => router.push('/influencer/videos')}
                  >
                    Submit New Video
                  </Button>
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => router.push('/influencer/campaigns')}
                  >
                    Browse Campaigns
                  </Button>
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => router.push('/influencer/guidelines')}
                  >
                    View Guidelines
                  </Button>
                </div>
              </Card>

              <Card title="Account Status">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Approval Status</span>
                    <Badge variant="success">Approved</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">District</span>
                    <span className="font-medium">{influencer?.district}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">This Month Posts</span>
                    <span className="font-medium">{stats?.this_month_posts || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Revenue Share Eligible</span>
                    <Badge
                      variant={
                        stats?.eligible_for_revenue_share ? 'success' : 'warning'
                      }
                    >
                      {stats?.eligible_for_revenue_share ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default InfluencerDashboard;
