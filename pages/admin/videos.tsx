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
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Video Submissions</h1>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Filter:</span>
            <select
              className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="pending">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="all">All Videos</option>
            </select>
          </div>
        </div>

        {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                <p className="font-bold">Error loading videos:</p>
                <p>{error}</p>
            </div>
        )}

        {videos.length === 0 ? (
          <Card className="p-10 text-center text-gray-600">
            No video submissions found
          </Card>
        ) : (
          videos.map((v) => {
             const influencer = (v as any).influencer;
             return (
            <Card key={v.id} className="p-6 space-y-3 relative overflow-hidden">
              {v.approval_status !== 'pending' && (
                  <div className={`absolute top-0 right-0 px-3 py-1 text-xs font-bold uppercase ${
                      v.approval_status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                      {v.approval_status}
                  </div>
              )}
              
              <h2 className="text-xl font-semibold pr-20">
                {v.title}
              </h2>

              <p className="text-gray-700">{v.description}</p>

              <div className="flex gap-4 items-center">
                  <a
                    href={v.video_url}
                    className="text-white bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 transition-colors no-underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Watch Video
                  </a>
                  {v.video_file_url && (
                       <a
                       href={v.video_file_url}
                       className="text-blue-600 hover:text-blue-800 underline"
                       target="_blank"
                       rel="noreferrer"
                     >
                       Download File
                     </a>
                  )}
              </div>

              <div className="bg-gray-50 p-3 rounded text-sm">
                <p><b>Influencer:</b> {influencer?.full_name}</p>
                <p><b>Email:</b> {influencer?.email}</p>
                <p><b>Followers:</b> {influencer?.follower_count?.toLocaleString()}</p>
                <p><b>Current Rate:</b> ₹{influencer?.video_rate || 0}</p>
              </div>

              <p className="text-sm text-gray-500">
                Submitted: {new Date(v.submitted_at).toLocaleString()}
              </p>

              {v.approval_status === "pending" && (
                <div className="flex gap-3 mt-3 pt-3 border-t">
                  <Button variant="primary" onClick={() => handleOpenApprove(v)}>
                    Approve
                  </Button>
                  <Button variant="danger" onClick={() => handleOpenReject(v)}>
                    Reject
                  </Button>
                </div>
              )}
            </Card>
             );
          })
        )}
      </div>

      <Modal
        isOpen={rejectionModalOpen}
        onClose={() => setRejectionModalOpen(false)}
        title="Reject Video"
      >
        <div className="space-y-4">
            <p className="text-gray-600">Please provide a reason for rejection.</p>
            <textarea
                className="w-full border rounded p-2 focus:ring-2 focus:ring-red-500 outline-none"
                rows={4}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="E.g., Low audio quality, script deviation..."
            />
            <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setRejectionModalOpen(false)}>Cancel</Button>
                <Button variant="danger" onClick={confirmReject}>Confirm Reject</Button>
            </div>
        </div>
      </Modal>

      <Modal
        isOpen={approvalModalOpen}
        onClose={() => setApprovalModalOpen(false)}
        title="Approve Video"
      >
        <div className="space-y-4">
            <p className="text-gray-600">Are you sure you want to approve this video?</p>
            
            {showRateInput && (
                <div className="bg-orange-50 p-4 rounded border border-orange-200">
                    <p className="text-sm text-orange-800 font-bold mb-2">First Video Review</p>
                    <p className="text-sm text-orange-700 mb-2">
                        This influencer does not have a set rate yet. Based on this video's quality, please assign their permanent per-video rate.
                    </p>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rate (₹)</label>
                    <Input 
                        type="number" 
                        value={rate} 
                        onChange={(e) => setRate(e.target.value)}
                        placeholder="e.g. 5000"
                    />
                    <p className="text-xs text-gray-500 mt-1">Recommended: ₹2,000 - ₹10,000</p>
                </div>
            )}

            {!showRateInput && selectedVideo && (
                 <p className="text-sm bg-green-50 text-green-700 p-2 rounded">
                    Influencer Rate: <b>₹{(selectedVideo as any).influencer?.video_rate}</b>
                 </p>
            )}

            <div className="flex justify-end gap-2 mt-4">
                <Button variant="secondary" onClick={() => setApprovalModalOpen(false)}>Cancel</Button>
                <Button variant="primary" onClick={confirmApprove}>Confirm Approve & Pay</Button>
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
