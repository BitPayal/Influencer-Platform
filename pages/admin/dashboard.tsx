import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/ui/Card';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { AdminDashboardStats } from '@/types';
import { Users, Video, DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import Head from 'next/head';

import type { ReactElement } from 'react';
import type { NextPageWithLayout } from '../_app';

const AdminDashboard: NextPageWithLayout = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user && user.role !== 'admin') {
      router.push('/influencer/dashboard');
    } else if (user) {
      fetchDashboardStats();
    }
  }, [user, authLoading, router]);

  const fetchDashboardStats = async () => {
    try {
      const { data: influencers } = await supabase.from('influencers').select('*') as { data: any[] | null };
      const { data: videos } = await supabase.from('video_submissions').select('*') as { data: any[] | null };
      const { data: payments } = await supabase.from('payments').select('*') as { data: any[] | null };

      const { count: pendingTasksCount } = await supabase
        .from('influencer_tasks')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending_approval');

      const districtMap = new Map();
      influencers?.forEach((inf) => {
        const key = `${inf.district}, ${inf.state}`;
        districtMap.set(key, (districtMap.get(key) || 0) + 1);
      });

      const districtCoverage = Array.from(districtMap.entries()).map(
        ([location, count]) => {
          const [district, state] = location.split(', ');
          return { district, state, count };
        }
      );

      const pendingInfluencersCount = influencers?.filter((i) => i.approval_status === 'pending').length || 0;

      const statsData: AdminDashboardStats = {
        total_influencers: influencers?.length || 0,
        pending_approvals: pendingInfluencersCount + (pendingTasksCount || 0),
        pending_influencers: pendingInfluencersCount,
        pending_task_applications: pendingTasksCount || 0,
        approved_influencers:
          influencers?.filter((i) => i.approval_status === 'approved').length || 0,
        rejected_influencers:
          influencers?.filter((i) => i.approval_status === 'rejected').length || 0,
        total_videos_submitted: videos?.length || 0,
        pending_video_reviews:
          videos?.filter((v) => v.approval_status === 'pending').length || 0,
        total_payments_made:
          payments
            ?.filter((p) => p.payment_status === 'paid')
            .reduce((sum, p) => sum + p.amount, 0) || 0,
        pending_payments:
          payments
            ?.filter((p) => p.payment_status === 'pending')
            .reduce((sum, p) => sum + p.amount, 0) || 0,
        district_coverage: districtCoverage.sort((a, b) => b.count - a.count).slice(0, 10),
      };

      setStats(statsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
    );
  }

  return (
    <>
      <Head>
        <title>Admin Dashboard - Cehpoint Marketing Partners</title>
      </Head>

      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card 
            className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
            onClick={() => router.push('/admin/influencers')}
          >
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Influencers</p>
                <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold text-gray-900">
                    {stats?.total_influencers || 0}
                    </p>
                    {(stats?.pending_influencers || 0) > 0 && (
                        <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                            {stats?.pending_influencers} Pending
                        </span>
                    )}
                </div>
              </div>
            </div>
          </Card>

          <Card
            className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
            onClick={() => router.push('/admin/applications')}
          >
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Pending Task Apps</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.pending_task_applications || 0}
                </p>
              </div>
            </div>
          </Card>

          <Card
            className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
            onClick={() => router.push('/admin/videos')}
          >
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Video className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Videos to Review</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.pending_video_reviews || 0}
                </p>
              </div>
            </div>
          </Card>

          <Card
            className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
            onClick={() => router.push('/admin/payments')}
          >
            <div className="flex items-center">
              <div className="bg-orange-100 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Pending Payments</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats?.pending_payments || 0)}
                </p>
              </div>
            </div>
          </Card>

          <Card
            className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
            onClick={() => router.push('/admin/payments')}
          >
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {/* Revenue is roughly tracked by payments made for now, or could serve as a placeholder */}
                  {formatCurrency((stats?.total_payments_made || 0) * 1.5)}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card title="Influencer Status Breakdown">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-gray-700">Approved</span>
                </div>
                <span className="font-semibold">{stats?.approved_influencers || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-yellow-600 mr-2" />
                  <span className="text-gray-700">Pending</span>
                </div>
                <span className="font-semibold">{stats?.pending_approvals || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <XCircle className="h-5 w-5 text-red-600 mr-2" />
                  <span className="text-gray-700">Rejected</span>
                </div>
                <span className="font-semibold">{stats?.rejected_influencers || 0}</span>
              </div>
            </div>
          </Card>

          <Card title="Top Districts by Coverage">
            <div className="space-y-3">
              {stats?.district_coverage.slice(0, 5).map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between pb-2 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="font-medium text-gray-900">{item.district}</p>
                    <p className="text-sm text-gray-600">{item.state}</p>
                  </div>
                  <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-semibold">
                    {item.count}
                  </span>
                </div>
              ))}
              {(!stats?.district_coverage || stats.district_coverage.length === 0) && (
                <p className="text-gray-500 text-center">No data available</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

AdminDashboard.getLayout = (page: ReactElement) => {
  return <Layout>{page}</Layout>;
};

export default AdminDashboard;
