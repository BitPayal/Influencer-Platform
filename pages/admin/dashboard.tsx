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

const AdminDashboard: React.FC = () => {
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

      const statsData: AdminDashboardStats = {
        total_influencers: influencers?.length || 0,
        pending_approvals:
          influencers?.filter((i) => i.approval_status === 'pending').length || 0,
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
        <title>Admin Dashboard - Cehpoint Marketing Partners</title>
      </Head>

      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Influencers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.total_influencers || 0}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Pending Approvals</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.pending_approvals || 0}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Video className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Pending Video Reviews</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.pending_video_reviews || 0}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Paid</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats?.total_payments_made || 0)}
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
    </Layout>
  );
};

export default AdminDashboard;
