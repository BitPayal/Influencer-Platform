import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { Download, FileText } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import Head from 'next/head';

interface ReportData {
  totalInfluencers: number;
  approvedInfluencers: number;
  pendingInfluencers: number;
  rejectedInfluencers: number;
  totalVideos: number;
  approvedVideos: number;
  rejectedVideos: number;
  pendingVideos: number;
  totalPaymentsMade: number;
  pendingPayments: number;
  influencersByState: { state: string; count: number }[];
  influencersByDistrict: { district: string; state: string; count: number }[];
  eligibleForRevShare: number;
}

const AdminReports: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchReportData();
    }
  }, [user]);

  const fetchReportData = async () => {
    try {
      const { data: influencers } = await supabase.from('influencers').select('*');
      const { data: videos } = await supabase.from('video_submissions').select('*');
      const { data: payments } = await supabase.from('payments').select('*');

      const stateMap = new Map();
      const districtMap = new Map();
      
      influencers?.forEach((inf) => {
        stateMap.set(inf.state, (stateMap.get(inf.state) || 0) + 1);
        const key = `${inf.district}|${inf.state}`;
        districtMap.set(key, (districtMap.get(key) || 0) + 1);
      });

      const currentMonth = new Date().toISOString().slice(0, 7);
      const eligibleInfluencers = new Set();
      
      influencers?.forEach((inf) => {
        const influencerVideos = videos?.filter(
          (v) =>
            v.influencer_id === inf.id &&
            v.approval_status === 'approved' &&
            v.submitted_at.startsWith(currentMonth)
        );
        if ((influencerVideos?.length || 0) >= 2) {
          eligibleInfluencers.add(inf.id);
        }
      });

      setData({
        totalInfluencers: influencers?.length || 0,
        approvedInfluencers:
          influencers?.filter((i) => i.approval_status === 'approved').length || 0,
        pendingInfluencers:
          influencers?.filter((i) => i.approval_status === 'pending').length || 0,
        rejectedInfluencers:
          influencers?.filter((i) => i.approval_status === 'rejected').length || 0,
        totalVideos: videos?.length || 0,
        approvedVideos:
          videos?.filter((v) => v.approval_status === 'approved').length || 0,
        rejectedVideos:
          videos?.filter((v) => v.approval_status === 'rejected').length || 0,
        pendingVideos:
          videos?.filter((v) => v.approval_status === 'pending').length || 0,
        totalPaymentsMade:
          payments
            ?.filter((p) => p.payment_status === 'paid')
            .reduce((sum, p) => sum + Number(p.amount), 0) || 0,
        pendingPayments:
          payments
            ?.filter((p) => p.payment_status === 'pending')
            .reduce((sum, p) => sum + Number(p.amount), 0) || 0,
        influencersByState: Array.from(stateMap.entries())
          .map(([state, count]) => ({ state, count }))
          .sort((a, b) => b.count - a.count),
        influencersByDistrict: Array.from(districtMap.entries())
          .map(([key, count]) => {
            const [district, state] = key.split('|');
            return { district, state, count };
          })
          .sort((a, b) => b.count - a.count),
        eligibleForRevShare: eligibleInfluencers.size,
      });
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = async (type: string) => {
    try {
      let csvContent = '';
      let filename = '';

      if (type === 'influencers') {
        const { data } = await supabase.from('influencers').select('*');
        filename = `influencers_${new Date().toISOString().split('T')[0]}.csv`;
        csvContent =
          'Full Name,Email,Phone,District,State,Follower Count,Status,UPI ID,Created At\n';
        data?.forEach((inf) => {
          csvContent += `"${inf.full_name}","${inf.email}","${inf.phone_number}","${inf.district}","${inf.state}",${inf.follower_count},"${inf.approval_status}","${inf.upi_id}","${inf.created_at}"\n`;
        });
      } else if (type === 'payments') {
        const { data } = await supabase
          .from('payments')
          .select('*, influencer:influencers(full_name, email)');
        filename = `payments_${new Date().toISOString().split('T')[0]}.csv`;
        csvContent =
          'Influencer Name,Email,Amount,Type,Status,Transaction ID,Created At,Paid At,Notes\n';
        data?.forEach((payment: any) => {
          csvContent += `"${payment.influencer.full_name}","${payment.influencer.email}",${payment.amount},"${payment.payment_type}","${payment.payment_status}","${payment.upi_transaction_id || ''}","${payment.created_at}","${payment.paid_at || ''}","${payment.notes || ''}"\n`;
        });
      } else if (type === 'videos') {
        const { data } = await supabase
          .from('video_submissions')
          .select('*, influencer:influencers(full_name, email, district)');
        filename = `videos_${new Date().toISOString().split('T')[0]}.csv`;
        csvContent =
          'Title,Influencer,Email,District,Status,Submitted At,Video URL\n';
        data?.forEach((video: any) => {
          csvContent += `"${video.title}","${video.influencer.full_name}","${video.influencer.email}","${video.influencer.district}","${video.approval_status}","${video.submitted_at}","${video.video_url || ''}"\n`;
        });
      }

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export data');
    }
  };

  if (loading) {
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
        <title>Reports - Admin - Cehpoint Marketing Partners</title>
      </Head>

      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Reports & Analytics</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card title="Influencer Statistics">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b">
                <span className="text-gray-700">Total Influencers</span>
                <span className="text-2xl font-bold text-gray-900">
                  {data?.totalInfluencers}
                </span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b">
                <span className="text-gray-700">Approved</span>
                <span className="text-xl font-semibold text-green-600">
                  {data?.approvedInfluencers}
                </span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b">
                <span className="text-gray-700">Pending Approval</span>
                <span className="text-xl font-semibold text-yellow-600">
                  {data?.pendingInfluencers}
                </span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b">
                <span className="text-gray-700">Rejected</span>
                <span className="text-xl font-semibold text-red-600">
                  {data?.rejectedInfluencers}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-gray-700">Eligible for Revenue Share</span>
                <span className="text-xl font-semibold text-primary-600">
                  {data?.eligibleForRevShare}
                </span>
              </div>
            </div>
          </Card>

          <Card title="Video Submissions">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b">
                <span className="text-gray-700">Total Videos</span>
                <span className="text-2xl font-bold text-gray-900">
                  {data?.totalVideos}
                </span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b">
                <span className="text-gray-700">Approved</span>
                <span className="text-xl font-semibold text-green-600">
                  {data?.approvedVideos}
                </span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b">
                <span className="text-gray-700">Pending Review</span>
                <span className="text-xl font-semibold text-yellow-600">
                  {data?.pendingVideos}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Rejected</span>
                <span className="text-xl font-semibold text-red-600">
                  {data?.rejectedVideos}
                </span>
              </div>
            </div>
          </Card>

          <Card title="Payment Summary">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b">
                <span className="text-gray-700">Total Paid</span>
                <span className="text-2xl font-bold text-green-600">
                  {formatCurrency(data?.totalPaymentsMade || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Pending Payments</span>
                <span className="text-2xl font-bold text-yellow-600">
                  {formatCurrency(data?.pendingPayments || 0)}
                </span>
              </div>
            </div>
          </Card>

          <Card title="Export Reports">
            <div className="space-y-3">
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => exportToCSV('influencers')}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Influencers (CSV)
              </Button>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => exportToCSV('payments')}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Payments (CSV)
              </Button>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => exportToCSV('videos')}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Videos (CSV)
              </Button>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Top States by Influencers">
            <div className="space-y-3">
              {data?.influencersByState.slice(0, 10).map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between pb-2 border-b border-gray-100 last:border-0"
                >
                  <span className="font-medium text-gray-900">{item.state}</span>
                  <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-semibold">
                    {item.count}
                  </span>
                </div>
              ))}
              {(!data?.influencersByState ||
                data.influencersByState.length === 0) && (
                <p className="text-gray-500 text-center">No data available</p>
              )}
            </div>
          </Card>

          <Card title="Top Districts by Coverage">
            <div className="space-y-3">
              {data?.influencersByDistrict.slice(0, 10).map((item, index) => (
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
              {(!data?.influencersByDistrict ||
                data.influencersByDistrict.length === 0) && (
                <p className="text-gray-500 text-center">No data available</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AdminReports;
