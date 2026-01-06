import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { supabase } from '@/lib/supabase';
import { Payment, Influencer } from '@/types';
import { DollarSign } from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import Head from 'next/head';

const InfluencerPayments: React.FC = () => {
  const { user } = useAuth();
  const [influencer, setInfluencer] = useState<Influencer | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const { data: influencerData } = await supabase
        .from('influencers')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      setInfluencer(influencerData);

      if (influencerData) {
        const { data: paymentsData } = await supabase
          .from('payments')
          .select('*')
          .eq('influencer_id', influencerData.id)
          .order('created_at', { ascending: false });

        setPayments(paymentsData || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="success">Paid</Badge>;
      case 'under_review':
        return <Badge variant="warning">Under Review</Badge>;
      default:
        return <Badge variant="info">Pending</Badge>;
    }
  };

  const totalEarnings = payments
    .filter((p) => p.payment_status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingPayments = payments
    .filter((p) => p.payment_status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

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
        <title>Payments - Cehpoint Marketing Partners</title>
      </Head>

      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Payments</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <div className="text-sm text-gray-600 mb-1">Total Earnings</div>
            <div className="text-3xl font-bold text-gray-900">
              {formatCurrency(totalEarnings)}
            </div>
          </Card>
          <Card>
            <div className="text-sm text-gray-600 mb-1">Pending Payments</div>
            <div className="text-3xl font-bold text-yellow-600">
              {formatCurrency(pendingPayments)}
            </div>
          </Card>
          <Card>
            <div className="text-sm text-gray-600 mb-1">UPI ID</div>
            <div className="text-lg font-medium text-gray-900">
              {influencer?.upi_id || 'Not set'}
            </div>
          </Card>
        </div>

        <Card title="Payment History">
          {payments.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No payments yet
              </h3>
              <p className="text-gray-600">
                Payments will appear here once videos are approved and processed
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Transaction ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{formatDateTime(payment.created_at)}</TableCell>
                    <TableCell>
                      {payment.payment_type === 'fixed'
                        ? 'Fixed Payment'
                        : 'Revenue Share'}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(payment.amount)}
                    </TableCell>
                    <TableCell>{getStatusBadge(payment.payment_status)}</TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {payment.upi_transaction_id || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default InfluencerPayments;
