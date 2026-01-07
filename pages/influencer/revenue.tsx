import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Layout } from '@/components/Layout';
import { Loader2, DollarSign, Calendar, CheckCircle, Clock } from 'lucide-react';
import { Payment } from '@/types';

const InfluencerRevenuePage = () => {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalEarned: 0,
        pending: 0,
        paid: 0
    });

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }
        if (user) {
            fetchEarnings();
        }
    }, [user, authLoading]);

    const fetchEarnings = async () => {
        try {
            // 1. Get Influencer ID
            const { data: influencer } = await supabase
                .from('influencers')
                .select('id')
                .eq('user_id', user?.id)
                .single();

            if (!influencer) return;

            // 2. Fetch Payments
            const { data: paymentsData, error } = await supabase
                .from('payments')
                .select('*')
                .eq('influencer_id', influencer.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const typedPayments = (paymentsData || []) as Payment[];
            setPayments(typedPayments);

            // 3. Calculate Stats
            const total = typedPayments.reduce((acc, curr) => acc + (curr.amount || 0), 0);
            const pending = typedPayments.filter(p => p.status === 'pending').reduce((acc, curr) => acc + (curr.amount || 0), 0);
            const paid = typedPayments.filter(p => p.status === 'paid').reduce((acc, curr) => acc + (curr.amount || 0), 0);

            setStats({ totalEarned: total, pending, paid });

        } catch (error) {
            console.error("Error fetching earnings:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <Layout>
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        </Layout>
    );

    return (
        <Layout>
            <Head>
                <title>My Earnings - Cehpoint</title>
            </Head>

            <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-12">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">Earnings & Payments</h1>
                    <p className="mt-2 text-lg text-gray-600">Track your video approvals and revenue.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-500 font-medium">Total Earnings</h3>
                            <DollarSign className="h-6 w-6 text-indigo-600 bg-indigo-50 p-1 rounded-full" />
                        </div>
                        <p className="text-3xl font-bold text-gray-900">₹{stats.totalEarned.toLocaleString()}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-500 font-medium">Pending Payout</h3>
                            <Clock className="h-6 w-6 text-amber-600 bg-amber-50 p-1 rounded-full" />
                        </div>
                        <p className="text-3xl font-bold text-amber-600">₹{stats.pending.toLocaleString()}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-500 font-medium">Paid Out</h3>
                            <CheckCircle className="h-6 w-6 text-green-600 bg-green-50 p-1 rounded-full" />
                        </div>
                        <p className="text-3xl font-bold text-green-600">₹{stats.paid.toLocaleString()}</p>
                    </div>
                </div>

                {/* Transactions List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900">Payment History</h2>
                    </div>
                    
                    {payments.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            No payment records found. Start submitting videos to earn!
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">Date</th>
                                        <th className="px-6 py-4 font-semibold">Description</th>
                                        <th className="px-6 py-4 font-semibold">Transaction ID</th>
                                        <th className="px-6 py-4 font-semibold">Type</th>
                                        <th className="px-6 py-4 font-semibold">Status</th>
                                        <th className="px-6 py-4 font-semibold text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {payments.map((payment) => (
                                        <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {new Date(payment.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                                                {payment.notes || 'Video Submission Payment'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                                                {payment.upi_transaction_id || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className="capitalize bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs">
                                                    {payment.payment_type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                    payment.status === 'paid' ? 'bg-green-100 text-green-700' :
                                                    payment.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-gray-100 text-gray-700'
                                                }`}>
                                                    {payment.status?.toUpperCase() || 'PENDING'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                                                ₹{payment.amount.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default InfluencerRevenuePage;
