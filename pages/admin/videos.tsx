import React, { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { VideoSubmission, Influencer } from "@/types";
import { Toast } from '@/components/ui/Toast';
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";

const AdminVideosPage = () => {
  const [videos, setVideos] = useState<VideoSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoSubmission | null>(null);
  const [feedback, setFeedback] = useState("");
  const [rate, setRate] = useState<string>("");
  const [showRateInput, setShowRateInput] = useState(false);
  const [filter, setFilter] = useState<string>("pending");
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchVideos();
  }, [filter]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('video_submissions')
        .select(`
          *,
          influencer:influencers(*)
        `)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('approval_status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;

      console.log("Fetched videos:", data?.length); 
      setVideos(data as VideoSubmission[] || []);
    } catch (error: any) {
      console.error("Error fetching videos:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenApprove = (video: VideoSubmission) => {
    setSelectedVideo(video);
    // Check if influencer has a rate set
    const inf = (video as any).influencer;
    if (inf && (!inf.video_rate || inf.video_rate === 0)) {
        setShowRateInput(true);
        setRate("");
    } else {
        setShowRateInput(false);
        setRate(inf.video_rate?.toString() || "0");
    }
    setApprovalModalOpen(true);
  };

  const handleOpenReject = (video: VideoSubmission) => {
      setSelectedVideo(video);
      setFeedback("");
      setRejectionModalOpen(true);
  };

  const confirmApprove = async () => {
    if (!selectedVideo) return;
    try {
      const inf = (selectedVideo as any).influencer;
      let finalRate = inf?.video_rate || 0;

      if (showRateInput) {
          finalRate = parseInt(rate);
          if (isNaN(finalRate) || finalRate <= 0) {
              setToast({ message: "Please enter a valid rate (positive number).", type: 'error' });
              return;
          }
          
          // Update influencer rate
          const { error: rateError } = await (supabase.from('influencers') as any)
            .update({ video_rate: finalRate })
            .eq('id', inf.id);
            
          if (rateError) throw rateError;
      }

      // 1. Update video status
      const { error: videoError } = await (supabase
        .from("video_submissions") as any)
        .update({
          approval_status: "approved",
          reviewed_at: new Date(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq("id", selectedVideo.id);

      if (videoError) throw videoError;
      
      // 1.5 Update Task Assignment Status (if linked)
      if (selectedVideo.task_assignment_id) {
          await (supabase.from('task_assignments') as any).update({
              status: 'completed',
              completed_at: new Date().toISOString()
          }).eq('id', selectedVideo.task_assignment_id);
      }

      // 2. Create Payment Record (if rate > 0)
      if (finalRate > 0) {
        const { error: paymentError } = await supabase.from('payments' as any).insert({
          influencer_id: selectedVideo.influencer_id,
          video_submission_id: selectedVideo.id,
          task_assignment_id: selectedVideo.task_assignment_id || null,
          amount: finalRate,
          payment_type: 'fixed',
          payment_status: 'pending',
          notes: selectedVideo.task_assignment_id ? `Payment for Task Assignment` : `Fixed payment for video: ${selectedVideo.title}`
        } as any);
        
        if (paymentError) {
          console.error("Error creating payment:", paymentError);
          setToast({ message: "Video approved/paid, but payment record failed. Check console.", type: 'error' });
        } else {
             setToast({ message: "Video approved & payment record created!", type: 'success' });
        }
      } else {
          setToast({ message: "Video approved successfully!", type: 'success' });
      }

      setApprovalModalOpen(false);
      fetchVideos();
    } catch (error: any) {
       console.error("Error approving video:", error);
       setToast({ message: "Failed to approve video: " + error.message, type: 'error' });
    }
  };

  const confirmReject = async () => {
    if (!selectedVideo) return;
    try {
        await (supabase
          .from("video_submissions") as any)
          .update({
            approval_status: "rejected",
            rejection_reason: feedback,
            reviewed_at: new Date(),
            reviewed_by: (await supabase.auth.getUser()).data.user?.id
          })
          .eq("id", selectedVideo.id);

        // Update task assignment if linked
        if (selectedVideo.task_assignment_id) {
            await (supabase.from('task_assignments') as any).update({
                status: 'rejected'
            }).eq('id', selectedVideo.task_assignment_id);
        }

        setToast({ message: "Video rejected successfully.", type: 'success' });
        setRejectionModalOpen(false);
        fetchVideos();
    } catch (error: any) {
        console.error("Error rejecting video:", error);
        setToast({ message: "Failed to reject video.", type: 'error' });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-10 text-center text-gray-600">Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header & Filter */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Video Submissions</h1>
            <p className="mt-1 text-gray-600">Review and manage influencer content</p>
          </div>
          
          {/* Segmented Filter */}
          <div className="bg-gray-100 p-1 rounded-lg flex flex-wrap">
             {[
               { id: 'pending', label: 'Pending' },
               { id: 'approved', label: 'Approved' },
               { id: 'rejected', label: 'Rejected' },
               { id: 'all', label: 'All' }
             ].map((status) => (
                <button
                  key={status.id}
                  onClick={() => setFilter(status.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                    filter === status.id 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {status.label}
                </button>
             ))}
          </div>
        </div>

        {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center gap-2">
                <span>⚠️</span>
                <p>{error}</p>
            </div>
        )}

        {/* Video Grid */}
        {videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
             <div className="text-4xl mb-4">📹</div>
             <h3 className="text-xl font-semibold text-gray-900">No submissions found</h3>
             <p className="text-gray-500 mt-2">Try changing the filter or wait for influencers to submit.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((v) => {
             const influencer = (v as any).influencer;
             return (
            <Card key={v.id} className="flex flex-col h-full border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
              {/* Card Header: Status & Options */}
              <div className="p-4 flex justify-between items-start gap-4">
                 <div>
                    <h2 className="font-bold text-gray-900 line-clamp-2 leading-tight" title={v.title}>
                        {v.title}
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                        {new Date(v.submitted_at).toLocaleDateString()} at {new Date(v.submitted_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                 </div>
                 <span className={`shrink-0 px-2.5 py-0.5 text-xs font-bold uppercase rounded-full tracking-wide ${
                      v.approval_status === 'approved' ? 'bg-green-100 text-green-700' : 
                      v.approval_status === 'rejected' ? 'bg-red-100 text-red-700' : 
                      'bg-yellow-100 text-yellow-700'
                  }`}>
                      {v.approval_status}
                  </span>
              </div>

              {/* Description & Link */}
              <div className="px-4 pb-4 flex-1">
                  <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                      {v.description || 'No description provided.'}
                  </p>
                  
                  <div className="flex gap-2">
                    <a
                        href={v.video_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 inline-flex justify-center items-center px-4 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded hover:bg-blue-100 transition-colors"
                    >
                        Watch Video ↗
                    </a>
                     {v.video_file_url && (
                        <a
                        href={v.video_file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 text-gray-500 hover:text-gray-900 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                        title="Download File"
                        >
                            ⬇
                        </a>
                    )}
                  </div>
              </div>

              {/* Influencer Footer */}
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">
                          {influencer?.full_name?.charAt(0) || '?'}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{influencer?.full_name}</span>
                        <span>{influencer?.follower_count?.toLocaleString()} followers</span>
                      </div>
                  </div>
                  <div className="font-mono">
                      Rate: ₹{influencer?.video_rate || 0}
                  </div>
              </div>

              {/* Action Bar for Pending */}
              {v.approval_status === "pending" && (
                <div className="grid grid-cols-2 divide-x divide-gray-100 border-t border-gray-100">
                  <button 
                    onClick={() => handleOpenReject(v)}
                    className="py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                  >
                    Reject
                  </button>
                  <button 
                    onClick={() => handleOpenApprove(v)}
                    className="py-3 text-sm font-semibold text-green-600 hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
                  >
                    Approve
                  </button>
                </div>
              )}
            </Card>
             );
          })}
          </div>
        )}
      </div>

      {/* REJECTION MODAL */}
      <Modal
        isOpen={rejectionModalOpen}
        onClose={() => setRejectionModalOpen(false)}
        title="Reject Submission"
      >
        <div className="space-y-4">
            <div className="bg-red-50 p-4 rounded text-sm text-red-800">
                You are about to reject <b>{selectedVideo?.title}</b>. This will notify the influencer.
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Rejection</label>
                <textarea
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-red-500 outline-none text-sm"
                    rows={4}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="e.g. Video quality is low, Guidelines missing..."
                />
            </div>
            <div className="flex justify-end gap-3 pt-2">
                <Button variant="secondary" onClick={() => setRejectionModalOpen(false)}>Cancel</Button>
                <Button variant="danger" onClick={confirmReject}>Reject Video</Button>
            </div>
        </div>
      </Modal>

      {/* APPROVAL MODAL */}
      <Modal
        isOpen={approvalModalOpen}
        onClose={() => setApprovalModalOpen(false)}
        title="Approve Submission"
      >
        <div className="space-y-5">
            <div className="bg-green-50 p-4 rounded text-sm text-green-800">
                 You are about to approve <b>{selectedVideo?.title}</b>. This will generate a payment record.
            </div>
            
            {showRateInput ? (
                <div className="border border-orange-200 bg-orange-50 p-4 rounded-md">
                    <h4 className="text-sm font-bold text-orange-900 mb-2">⚠️ Rate Not Set</h4>
                    <p className="text-sm text-orange-800 mb-3">
                        This is the influencer's first approved video. Please set their permanent <b>Rate Per Video</b> based on quality.
                    </p>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold uppercase text-gray-500">Enter Rate (₹)</label>
                        <Input 
                            type="number" 
                            value={rate} 
                            onChange={(e) => setRate(e.target.value)}
                            placeholder="e.g. 5000"
                            className="bg-white"
                        />
                        <p className="text-xs text-gray-500">Typical range: ₹2,000 - ₹10,000</p>
                    </div>
                </div>
            ) : (
                <div className="flex justify-between items-center p-3 border border-gray-200 rounded bg-gray-50">
                     <span className="text-sm text-gray-600">Applicable Rate:</span>
                     <span className="text-lg font-bold text-gray-900">₹{(selectedVideo as any)?.influencer?.video_rate}</span>
                </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
                <Button variant="secondary" onClick={() => setApprovalModalOpen(false)}>Cancel</Button>
                <Button variant="primary" onClick={confirmApprove}>Confirm & Pay</Button>
            </div>
        </div>
      </Modal>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </Layout>
  );
};

export default AdminVideosPage;
