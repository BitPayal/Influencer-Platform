import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table } from '@/components/ui/Table';
import { supabase } from '@/lib/supabase';
import { RevenueShare, FollowerBand } from '@/types';
import { DollarSign, TrendingUp, Award, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';

const InfluencerRevenuePage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [revenues, setRevenues] = useState<RevenueShare[]>([]);
  const [loading, setLoading] = useState(true);
  const [followerBand, setFollowerBand] = useState<FollowerBand>('0-5k');
  const [videoRate, setVideoRate] = useState<number>(0);

  useEffect(() => {
    if (user === undefined) return; // Wait for auth to load
    if (user === null) {
      router.push('/login');
      return;
    }
    if (user.role === 'admin') {
      router.push('/admin/dashboard');
      return;
    }
    fetchRevenueData();
  }, [user]);

  const fetchRevenueData = async () => {
    try {
      const { data } = await supabase
        .from('influencers')
        .select('id, follower_count, video_rate')
        .eq('user_id', user?.id)
        .single();

      const influencerData = data as any;

      if (!influencerData) return;

      const band = getFollowerBand(influencerData.follower_count);
      setFollowerBand(band);
      setVideoRate(influencerData.video_rate || 0);

      const { data: revenueSharesData, error } = await supabase
        .from('revenue_shares')
        .select('*')
        .eq('influencer_id', influencerData.id)
        .order('year', { ascending: false })
        .order('month', { ascending: false });

      if (error) throw error;
      setRevenues(revenueSharesData || []);
    } catch (error) {
      console.error('Error fetching revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFollowerBand = (count: number): FollowerBand => {
    if (count >= 100000) return '100k+';
    if (count >= 25000) return '25k-100k';
    if (count >= 5000) return '5k-25k';
    return '0-5k';
  };

  const getPayoutForBand = (band: FollowerBand): number => {
    switch (band) {
      case '100k+':
        return 10000;
      case '25k-100k':
        return 7000;
      case '5k-25k':
        return 4000;
      default:
        return 2000;
    }
  };

  const totalEarnings = revenues.reduce((sum, r) => sum + r.total_earning, 0);
  const totalFixed = revenues.reduce((sum, r) => sum + r.fixed_payout, 0);
  const totalPerformance = revenues.reduce((sum, r) => sum + r.performance_share_amount, 0);
  const currentMonthRevenue = revenues.find(
    (r) =>
      r.month === new Date().toLocaleString('default', { month: 'long' }) &&
      r.year === new Date().getFullYear()
  );

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading revenue data...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Revenue Dashboard</h1>
          <p className="text-gray-600 mt-1">Track your earnings and performance bonuses</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="flex items-center">
              <div className="bg-blue-600 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-700">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">₹{totalEarnings.toLocaleString()}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100">
            <div className="flex items-center">
              <div className="bg-green-600 p-3 rounded-lg">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-700">Fixed Payouts</p>
                <p className="text-2xl font-bold text-gray-900">₹{totalFixed.toLocaleString()}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
            <div className="flex items-center">
              <div className="bg-purple-600 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-700">Performance Bonus</p>
                <p className="text-2xl font-bold text-gray-900">₹{totalPerformance.toLocaleString()}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
            <div className="flex items-center">
              <div className="bg-orange-600 p-3 rounded-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-700">This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{currentMonthRevenue?.total_earning.toLocaleString() || '0'}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Your Revenue Tier</h3>
          <div className="flex items-center justify-between">
            <div>
              <Badge variant="success" className="text-lg px-4 py-2">
                {followerBand} Followers
              </Badge>
              <p className="text-gray-700 mt-2">
                Base payout: <span className="font-bold">₹{(videoRate || getPayoutForBand(followerBand)).toLocaleString()}</span> per
                approved video
              </p>
              <p className="text-sm text-gray-600 mt-1">+ 5% revenue share from generated leads</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-indigo-600">
                ₹{(videoRate || getPayoutForBand(followerBand)).toLocaleString()}
              </div>
              <p className="text-sm text-gray-600">per video</p>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue History</h3>
          {revenues.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              No revenue history yet. Complete tasks to start earning!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Period</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Videos Approved
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Fixed Payout
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Performance Share
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Total Earning
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {revenues.map((revenue) => (
                    <tr key={revenue.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {revenue.month} {revenue.year}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{revenue.videos_approved}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        ₹{revenue.fixed_payout.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        ₹{revenue.performance_share_amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                        ₹{revenue.total_earning.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Badge
                          variant={
                            revenue.payment_status === 'paid'
                              ? 'success'
                              : revenue.payment_status === 'calculated'
                              ? 'info'
                              : 'warning'
                          }
                        >
                          {revenue.payment_status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <h3 className="text-lg font-bold text-gray-900 mb-2">💡 Maximize Your Earnings</h3>
          <ul className="space-y-2 text-gray-700">
            <li>✓ Complete 2 tasks per month to earn fixed payouts</li>
            <li>✓ Generate quality leads to unlock 5% performance bonuses</li>
            <li>✓ Grow your followers to increase your base payout tier</li>
            <li>✓ Create authentic, engaging content that drives action</li>
          </ul>
        </Card>
      </div>
    </Layout>
  );
};

export default InfluencerRevenuePage;
