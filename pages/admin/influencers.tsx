import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
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
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { Influencer } from '@/types';
import { CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import Head from 'next/head';
import type { ReactElement } from 'react';
import type { NextPageWithLayout } from '../_app';
import { toast } from 'react-hot-toast';
import useSWR from 'swr';

const AdminInfluencers: NextPageWithLayout = () => {
    const { user } = useAuth();
    const router = useRouter();
    // Removed local influencers state and loading state in favor of SWR
    const [selectedInfluencer, setSelectedInfluencer] = useState<Influencer | null>(
      null
    );
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
    const [modalOpen, setModalOpen] = useState(false);
    const [editRate, setEditRate] = useState<string>('');
    const mounted = React.useRef(true);
  
    useEffect(() => {
      if (selectedInfluencer) {
        setEditRate(selectedInfluencer.video_rate?.toString() || '0');
      }
    }, [selectedInfluencer]);
  
    useEffect(() => {
      mounted.current = true;
      return () => { mounted.current = false; };
    }, []);

    // Fetcher function for SWR
    const fetcher = async ([key, filter]: [string, string]) => {
        let query = supabase
          .from('influencers')
          .select('*')
          .order('created_at', { ascending: false });
  
        if (filter !== 'all') {
            query = query.eq('approval_status', filter);
        }
  
        const { data, error } = await query;
        if (error) throw error;
        return data as Influencer[];
    };

    // Use SWR for fetching
    const { data: influencers = [], error, isLoading, mutate } = useSWR(
        user && user.role === 'admin' ? ['influencers', statusFilter] : null,
        fetcher
    );

    // Handle initial loading error
    useEffect(() => {
        if (error) {
            console.error('Error fetching influencers:', error);
            toast.error(error.message || 'Failed to fetch influencers');
        }
    }, [error]);
  
    const handleApprove = async (influencerId: string) => {
      try {
        const updates = {
            approval_status: 'approved',
            approved_at: new Date().toISOString(),
            approved_by: user?.id,
        };
  
        const { error } = await (supabase
          .from('influencers') as any)
          .update(updates)
          .eq('id', influencerId);
  
        if (error) throw error;
        toast.success('Influencer approved successfully!');
        mutate(); // Revalidate data
        setModalOpen(false);
      } catch (error: any) {
        toast.error(error.message || 'Failed to approve influencer');
      }
    };
  
    const handleReject = async (influencerId: string) => {
      try {
        const updates = {
            approval_status: 'rejected',
        };
  
        const { error } = await (supabase
          .from('influencers') as any)
          .update(updates)
          .eq('id', influencerId);
  
        if (error) throw error;
        toast.success('Influencer rejected');
        mutate(); // Revalidate data
        setModalOpen(false);
      } catch (error: any) {
        toast.error(error.message || 'Failed to reject influencer');
      }
    };
  
    const handleUpdateRate = async () => {
      if (!selectedInfluencer) return;
      try {
        const rate = parseInt(editRate);
        if (isNaN(rate) || rate < 0) {
          toast.error('Please enter a valid rate');
          return;
        }
  
        const { error } = await (supabase
          .from('influencers') as any)
          .update({ video_rate: rate })
          .eq('id', selectedInfluencer.id);
  
        if (error) throw error;
        toast.success('Video rate updated successfully!');
        
        // Optimistic update or revalidate
        mutate(); 
        setSelectedInfluencer(prev => prev ? { ...prev, video_rate: rate } : null);
      } catch (error: any) {
        console.error('Error updating rate:', error);
        toast.error('Failed to update video rate');
      }
    };
  
    const getStatusBadge = (status: string) => {
      switch (status) {
        case 'approved':
          return <Badge variant="success">Approved</Badge>;
        case 'rejected':
          return <Badge variant="danger">Rejected</Badge>;
        default:
          return <Badge variant="warning">Pending</Badge>;
      }
    };
  
    // Show loading spinner ONLY if we have NO data to show
    if (isLoading && influencers.length === 0) {
      return (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading...</div>
          </div>
      );
    }
  
    return (
      <>
        <Head>
          <title>Influencers - Admin - Cehpoint Marketing Partners</title>
        </Head>
  
        <div>
          <div className="mb-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Influencers</h1>
                  <p className="mt-1 text-gray-600">Manage influencer applications and approvals</p>
                </div>
                <div className="flex gap-2">
                    <Button 
                      variant={statusFilter === 'all' ? 'primary' : 'secondary'} 
                      size="sm"
                      onClick={() => setStatusFilter('all')}
                    >
                        All
                    </Button>
                    <Button 
                      variant={statusFilter === 'pending' ? 'primary' : 'secondary'} 
                      size="sm"
                      onClick={() => setStatusFilter('pending')}
                    >
                        Pending
                    </Button>
                     <Button 
                      variant={statusFilter === 'approved' ? 'primary' : 'secondary'} 
                      size="sm"
                      onClick={() => setStatusFilter('approved')}
                    >
                        Approved
                    </Button>
                </div>
            </div>
          </div>
  
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>District</TableHead>
                  <TableHead>Followers</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {influencers.map((influencer) => (
                  <TableRow key={influencer.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{influencer.full_name}</div>
                        <div className="text-sm text-gray-500">{influencer.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {influencer.district}, {influencer.state}
                    </TableCell>
                    <TableCell>{influencer.follower_count.toLocaleString()}</TableCell>
                    <TableCell>{formatDateTime(influencer.created_at)}</TableCell>
                    <TableCell>{getStatusBadge(influencer.approval_status)}</TableCell>
                    <TableCell>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setSelectedInfluencer(influencer);
                          setModalOpen(true);
                        }}
                      >
                        View Details
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="ml-2"
                        onClick={() => router.push(`/messages?userId=${influencer.user_id}`)}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
  
          {selectedInfluencer && (
            <Modal
              isOpen={modalOpen}
              onClose={() => setModalOpen(false)}
              title="Influencer Details"
              size="lg"
            >
              <div className="space-y-6 max-h-[70vh] overflow-y-auto p-1">
                {/* Header Section with Status */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-gray-100">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedInfluencer.full_name}</h3>
                    <p className="text-sm text-gray-500">{selectedInfluencer.district}, {selectedInfluencer.state}</p>
                  </div>
                  <div className="flex items-center gap-2">
                     <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Status:</span>
                     {getStatusBadge(selectedInfluencer.approval_status)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Contact Info */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2">
                        Contact Info
                    </h4>
                    <div className="grid grid-cols-1 gap-3">
                       <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Email Address</p>
                          <p className="font-medium text-gray-900 break-all">{selectedInfluencer.email}</p>
                       </div>
                       <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Phone Number</p>
                          <p className="font-medium text-gray-900">{selectedInfluencer.phone_number}</p>
                       </div>
                    </div>
                  </div>

                  {/* Platform Stats */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2">
                        Platform Stats
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                            <p className="text-xs text-blue-600 mb-1">Followers</p>
                            <p className="text-lg font-bold text-blue-900">
                                {selectedInfluencer.follower_count.toLocaleString()}
                            </p>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                             <p className="text-xs text-purple-600 mb-1">Joined</p>
                             <p className="font-medium text-purple-900 text-sm">
                                {new Date(selectedInfluencer.created_at).toLocaleDateString()}
                             </p>
                        </div>
                    </div>
                  </div>
                </div>

                {/* Social Media Section */}
                <div>
                   <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2 mb-3">
                        Social Profiles
                    </h4>
                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {selectedInfluencer.social_media_handles?.instagram && (
                        <div className="flex items-center p-3 bg-pink-50 rounded-lg border border-pink-100">
                            <span className="font-bold text-pink-600 mr-2">IG</span>
                            <span className="truncate text-sm font-medium text-pink-900">
                                {selectedInfluencer.social_media_handles.instagram}
                            </span>
                        </div>
                      )}
                      {selectedInfluencer.social_media_handles?.youtube && (
                        <div className="flex items-center p-3 bg-red-50 rounded-lg border border-red-100">
                             <span className="font-bold text-red-600 mr-2">YT</span>
                             <span className="truncate text-sm font-medium text-red-900">
                                {selectedInfluencer.social_media_handles.youtube}
                             </span>
                        </div>
                      )}
                      {selectedInfluencer.social_media_handles?.facebook && (
                        <div className="flex items-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                             <span className="font-bold text-blue-600 mr-2">FB</span>
                             <span className="truncate text-sm font-medium text-blue-900">
                                {selectedInfluencer.social_media_handles.facebook}
                             </span>
                        </div>
                      )}
                   </div>
                </div>

                {/* Payment & Verification Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Payment Settings */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2 mb-3">
                            Payment Settings
                        </h4>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">UPI ID</p>
                                <p className="font-medium text-gray-900">{selectedInfluencer.upi_id}</p>
                            </div>
                            
                            <div className="pt-3 border-t border-gray-200">
                                <label className="text-xs font-semibold text-gray-700 block mb-2">
                                    Video Pay Rate (₹)
                                </label>
                                <div className="flex gap-2">
                                <input
                                    type="number"
                                    className="flex-1 p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                    value={editRate}
                                    onChange={(e) => setEditRate(e.target.value)}
                                    placeholder="Rate"
                                />
                                <Button size="sm" onClick={handleUpdateRate} className="shrink-0">
                                    Update
                                </Button>
                                </div>
                                <p className="text-xs text-gray-500 mt-1.5">
                                    Fixed payment per approved video.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Verification */}
                    <div>
                         <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2 mb-3">
                            Identity Verification
                        </h4>
                        <div className="bg-gray-50 rounded-lg p-4 h-full">
                             <div className="flex justify-between items-center mb-3">
                                <div>
                                    <p className="text-xs text-gray-500">ID Type</p>
                                    <p className="font-medium uppercase">{selectedInfluencer.id_proof_type}</p>
                                </div>
                                {selectedInfluencer.id_proof_url ? (
                                    <Badge variant="success">Uploaded</Badge>
                                ) : (
                                    <Badge variant="danger">Missing</Badge>
                                )}
                             </div>
                             
                             {selectedInfluencer.id_proof_url && (
                                <a
                                href={selectedInfluencer.id_proof_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full py-2 px-4 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 text-center hover:bg-gray-50 hover:text-primary-600 transition-colors"
                                >
                                View Document
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {selectedInfluencer.approval_status === 'pending' && (
                  <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-100 mt-2">
                    <Button
                      variant="danger"
                      className="w-full sm:w-auto justify-center"
                      onClick={() => handleReject(selectedInfluencer.id)}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject Application
                    </Button>
                    <Button
                      variant="primary"
                      className="w-full sm:w-auto justify-center"
                      onClick={() => handleApprove(selectedInfluencer.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve Influencer
                    </Button>
                  </div>
                )}
              </div>
            </Modal>
          )}
        </div>
      </>
    );
  };
  
  AdminInfluencers.getLayout = (page: ReactElement) => {
    return <Layout>{page}</Layout>;
  };
  
  export default AdminInfluencers;
