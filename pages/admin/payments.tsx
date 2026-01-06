import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import { supabase } from '@/lib/supabase';
import { Payment, Influencer } from '@/types';
import { DollarSign, Plus } from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import Head from 'next/head';

const AdminPayments: React.FC = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<
    (Payment & { influencer: Influencer })[]
  >([]);
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [revenueModalOpen, setRevenueModalOpen] = useState(false);
  const [revData, setRevData] = useState({
    influencer_id: '',
    month: new Date().toLocaleString('default', { month: 'long' }),
    year: new Date().getFullYear(),
    totalRevenue: ''
  });

  const [formData, setFormData] = useState({
    influencer_id: '',
    amount: '',
    payment_type: 'fixed' as 'fixed' | 'revenue_share',
    upi_transaction_id: '',
    notes: '',
  });



  const handleRevenueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revData.influencer_id || !revData.totalRevenue) return;

    try {
      const revenue = parseFloat(revData.totalRevenue);
      const share = revenue * 0.05;

      // 1. Create Revenue Share Record
      const { data: shareData, error: shareError } = await (supabase.from('revenue_shares') as any).insert({
        influencer_id: revData.influencer_id,
        month: revData.month,
        year: revData.year,
        revenue_from_leads: revenue,
        performance_share_amount: share,
        total_earning: share, // Assuming only share for now in this record
        payment_status: 'pending'
      }).select().single();

      if (shareError) throw shareError;

      // 2. Create Payment Record
      const { error: payError } = await supabase.from('payments' as any).insert({
        influencer_id: revData.influencer_id,
        amount: share,
        payment_type: 'revenue_share',
        payment_status: 'pending',
        notes: `5% Revenue Share for ${revData.month} ${revData.year} (Revenue: ₹${revenue})`
      } as any);

      if (payError) throw payError;

      alert('Revenue share calculated and payment created!');
      setRevenueModalOpen(false);
      fetchData();
    } catch (error: any) {
      console.error(error);
      alert('Failed to process revenue share');
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const { data: paymentsData } = await supabase
        .from('payments')
        .select(
          `
          *,
          influencer:influencers(*)
        `
        )
        .order('created_at', { ascending: false });

      const { data: influencersData } = await supabase
        .from('influencers')
        .select('*')
        .eq('approval_status', 'approved')
        .order('full_name');

      setPayments(paymentsData || []);
      setInfluencers(influencersData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase.from('payments' as any).insert({
        influencer_id: formData.influencer_id,
        amount: parseFloat(formData.amount),
        payment_type: formData.payment_type,
        payment_status: 'pending',
        upi_transaction_id: formData.upi_transaction_id || null,
        notes: formData.notes || null,
      } as any);

      if (error) throw error;
      
      alert('Payment record created successfully!');
      setModalOpen(false);
      setFormData({
        influencer_id: '',
        amount: '',
        payment_type: 'fixed',
        upi_transaction_id: '',
        notes: '',
      });
      fetchData();
    } catch (error: any) {
      alert(error.message || 'Failed to create payment');
    }
  };

  const markAsPaid = async (paymentId: string, transactionId: string) => {
    if (!transactionId.trim()) {
      alert('Please enter UPI transaction ID');
      return;
    }

    try {
      const { error } = await (supabase
        .from('payments') as any)
        .update({
          payment_status: 'paid',
          upi_transaction_id: transactionId,
          paid_at: new Date().toISOString(),
          paid_by: user?.id,
        })
        .eq('id', paymentId);

      if (error) throw error;
      
      alert('Payment marked as paid!');
      fetchData();
    } catch (error: any) {
      alert(error.message || 'Failed to update payment');
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

  const totalPaid = payments
    .filter((p) => p.payment_status === 'paid')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const totalPending = payments
    .filter((p) => p.payment_status === 'pending')
    .reduce((sum, p) => sum + Number(p.amount), 0);

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
        <title>Payments - Admin - Cehpoint Marketing Partners</title>
      </Head>

      <div>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
            <p className="mt-1 text-gray-600">Manage influencer payments</p>
          </div>
          <div className="flex gap-3">
             <Button variant="secondary" onClick={() => setRevenueModalOpen(true)}>
              <DollarSign className="h-4 w-4 mr-2" />
              Revenue Settlement
            </Button>
            <Button variant="primary" onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Payment
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <div className="text-sm text-gray-600 mb-1">Total Paid</div>
            <div className="text-3xl font-bold text-green-600">
              {formatCurrency(totalPaid)}
            </div>
          </Card>
          <Card>
            <div className="text-sm text-gray-600 mb-1">Pending Payments</div>
            <div className="text-3xl font-bold text-yellow-600">
              {formatCurrency(totalPending)}
            </div>
          </Card>
          <Card>
            <div className="text-sm text-gray-600 mb-1">Total Transactions</div>
            <div className="text-3xl font-bold text-gray-900">
              {payments.length}
            </div>
          </Card>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Influencer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{payment.influencer.full_name}</div>
                      <div className="text-sm text-gray-500">
                        {payment.influencer.district}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(Number(payment.amount))}
                  </TableCell>
                  <TableCell>
                    {payment.payment_type === 'fixed'
                      ? 'Fixed Payment'
                      : 'Revenue Share'}
                  </TableCell>
                  <TableCell>{getStatusBadge(payment.payment_status)}</TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {payment.upi_transaction_id || '-'}
                  </TableCell>
                  <TableCell>{formatDateTime(payment.created_at)}</TableCell>
                  <TableCell>
                    {payment.payment_status === 'pending' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          const txnId = prompt('Enter UPI Transaction ID:');
                          if (txnId) {
                            markAsPaid(payment.id, txnId);
                          }
                        }}
                      >
                        Mark Paid
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Create Payment Record"
          size="md"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label-text">Select Influencer</label>
              <select
                className="input-field"
                value={formData.influencer_id}
                onChange={(e) =>
                  setFormData({ ...formData, influencer_id: e.target.value })
                }
                required
              >
                <option value="">Select an influencer</option>
                {influencers.map((inf) => (
                  <option key={inf.id} value={inf.id}>
                    {inf.full_name} - {inf.district}
                  </option>
                ))}
              </select>
            </div>

            <Input
              id="amount"
              label="Amount (₹)"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />

            <div>
              <label className="label-text">Payment Type</label>
              <select
                className="input-field"
                value={formData.payment_type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    payment_type: e.target.value as 'fixed' | 'revenue_share',
                  })
                }
              >
                <option value="fixed">Fixed Payment</option>
                <option value="revenue_share">Revenue Share</option>
              </select>
            </div>

            <Input
              id="upi_transaction_id"
              label="UPI Transaction ID (optional)"
              value={formData.upi_transaction_id}
              onChange={(e) =>
                setFormData({ ...formData, upi_transaction_id: e.target.value })
              }
              helperText="Can be added later when marking as paid"
            />

            <div>
              <label className="label-text">Notes (optional)</label>
              <textarea
                className="input-field"
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Create Payment
              </Button>
            </div>
          </form>
        </Modal>

        {/* Revenue Share Modal */}
        <Modal
          isOpen={revenueModalOpen}
          onClose={() => setRevenueModalOpen(false)}
          title="Monthly Revenue Settlement"
          size="md"
        >
           <form onSubmit={handleRevenueSubmit} className="space-y-4">
            <div>
               <label className="label-text">Select Influencer</label>
               <select
                 className="input-field"
                 value={revData.influencer_id}
                 onChange={(e) => setRevData({...revData, influencer_id: e.target.value})}
                 required
               >
                 <option value="">Select Influencer</option>
                 {influencers.map(inf => (
                   <option key={inf.id} value={inf.id}>{inf.full_name} ({inf.district})</option>
                 ))}
               </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-text">Month</label>
                <select 
                  className="input-field"
                  value={revData.month}
                  onChange={(e) => setRevData({...revData, month: e.target.value})}
                >
                  {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                 <label className="label-text">Year</label>
                 <Input 
                   type="number" 
                   value={revData.year} 
                   onChange={(e) => setRevData({...revData, year: parseInt(e.target.value)})}
                 />
              </div>
            </div>

            <Input
              label="Total Revenue Generated (₹)"
              type="number"
              value={revData.totalRevenue}
              onChange={(e) => setRevData({...revData, totalRevenue: e.target.value})}
              required
              helperText="Enter total sales/leads revenue generated by this influencer"
            />

            <div className="bg-blue-50 p-3 rounded">
              <p className="text-sm text-blue-800">Calculated 5% Share:</p>
              <p className="text-xl font-bold text-blue-900">
                {formatCurrency(parseFloat(revData.totalRevenue || '0') * 0.05)}
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
               <Button type="button" variant="secondary" onClick={() => setRevenueModalOpen(false)}>Cancel</Button>
               <Button type="submit" variant="primary">Generate Payment</Button>
            </div>
           </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default AdminPayments;
