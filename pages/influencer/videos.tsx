import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { VideoSubmission, Influencer } from '@/types';
import { Plus, Video } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import Head from 'next/head';

const InfluencerVideos: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [influencer, setInfluencer] = useState<Influencer | null>(null);
  const [videos, setVideos] = useState<VideoSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoUrl: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [activeCampaigns, setActiveCampaigns] = useState<any[]>([]); // New state

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  // Handle URL query parameters
  useEffect(() => {
    if (router.query.campaign) {
      setSelectedCampaignId(router.query.campaign as string);
      setModalOpen(true);
    }

    if (router.query.status) {
      setFilterStatus(router.query.status as string);
    } else {
      setFilterStatus(null);
    }
  }, [router.query]);

  const fetchData = async () => {
    try {
      const { data: influencerData } = await supabase
        .from('influencers')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      setInfluencer(influencerData);
      
      if (influencerData) {
        // Fetch approved campaigns for selection
        const { data: approvedApps } = await supabase
            .from('campaign_applications')
            .select('campaign_id, campaigns(title)')
            .eq('influencer_id', (influencerData as any).id)
            .eq('status', 'approved') as any; 
            
        const campaigns = (approvedApps as any)?.map((app: any) => ({
            id: app.campaign_id,
            title: app.campaigns?.title
        })) || [];
        
        setActiveCampaigns(campaigns);

        // Auto-select if a query param exists OR if there's only one active campaign and we are not filtering
        if (!selectedCampaignId && campaigns.length === 1 && !router.query.campaign) {
             // Optional: Auto-select single campaign for convenience?
             // Let's not force it unless they click a "Submit for Campaign" button, generic submissions might exist.
             // But for safer UX to prevent "I forgot to select":
             // setSelectedCampaignId(campaigns[0].id);
        }
      }

      if (influencerData) {
        const { data: videosData } = await (supabase
          .from('video_submissions') as any)
          .select('*, campaigns(title)')
          .eq('influencer_id', (influencerData as any).id)
          .order('created_at', { ascending: false });

        setVideos(videosData as any || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilter = () => {
    setFilterStatus(null);
    router.replace('/influencer/videos', undefined, { shallow: true });
  };

  // ... handleSubmit ...
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload: any = {
        influencer_id: influencer?.id,
        title: formData.title,
        description: formData.description,
        video_url: formData.videoUrl,
        approval_status: 'pending',
        submitted_at: new Date().toISOString(),
      };

      if (selectedCampaignId) {
        payload.campaign_id = selectedCampaignId;
      }

      const { error } = await supabase.from('video_submissions').insert(payload);

      if (error) throw error;

      alert('Video submitted successfully! It will be reviewed shortly.');
      setModalOpen(false);
      setFormData({ title: '', description: '', videoUrl: '' });
      setSelectedCampaignId(null); // Reset
      // Clear query param without reload
      router.replace('/influencer/videos', undefined, { shallow: true });
      fetchData();
    } catch (error: any) {
      alert(error.message || 'Failed to submit video');
    } finally {
      setSubmitting(false);
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

  const filteredVideos = filterStatus
    ? videos.filter((v) => v.approval_status === filterStatus)
    : videos;

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (influencer?.approval_status !== 'approved') {
    return (
      <Layout>
        <Head>
          <title>My Videos - Cehpoint Marketing Partners</title>
        </Head>
        <div className="text-center py-12">
          <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Account Not Approved
          </h2>
          <p className="text-gray-600">
            Your account must be approved before you can submit videos.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>My Videos - Cehpoint Marketing Partners</title>
      </Head>

      <div>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Videos</h1>
            <p className="mt-1 text-gray-600">Submit and track your promotional videos</p>
            {filterStatus && (
              <div className="mt-2 flex items-center">
                <span className="text-sm text-gray-500 mr-2">Filtered by:</span>
                <Badge variant={filterStatus === 'approved' ? 'success' : filterStatus === 'pending' ? 'warning' : 'default'} className="mr-2">
                  {filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
                </Badge>
                <button
                  onClick={clearFilter}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Clear filter
                </button>
              </div>
            )}
          </div>
          <Button
            variant="primary"
            onClick={() => setModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Submit New Video
          </Button>
        </div>

        <Card>
          {videos.length === 0 ? (
            <div className="text-center py-12">
              <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No videos yet
              </h3>
              <p className="text-gray-600 mb-6">
                Get started by submitting your first promotional video
              </p>
              <Button variant="primary" onClick={() => setModalOpen(true)}>
                Submit Video
              </Button>
            </div>
          ) : filteredVideos.length === 0 ? (
            <div className="text-center py-12">
              <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No videos found
              </h3>
              <p className="text-gray-600 mb-6">
                No videos match the current filter ({filterStatus}).
              </p>
              <Button variant="secondary" onClick={clearFilter}>
                Clear Filter
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVideos.map((video) => (
                  <TableRow key={video.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{video.title}</div>
                        <div className="text-sm text-gray-500">
                          {video.description.substring(0, 60)}...
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{formatDateTime(video.submitted_at)}</TableCell>
                    <TableCell>{getStatusBadge(video.approval_status)}</TableCell>
                    <TableCell>
                      {video.video_url && (
                        <a
                          href={video.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700"
                        >
                          View
                        </a>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>

        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Submit New Video"
          size="md"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="title"
              label="Video Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            
            <div>
              <label className="label-text">Select Campaign (Important for Payment)</label>
              <select
                className="input-field"
                value={selectedCampaignId || ''}
                onChange={(e) => setSelectedCampaignId(e.target.value || null)}
                required // Recommend making this required if they have active campaigns? 
                // Let's keep it optional but warned for now, or users with no campaigns can't submit generic videos.
              >
                 <option value="">-- General / Portfolio Video (No Payment) --</option>
                 {activeCampaigns.map(c => (
                     <option key={c.id} value={c.id}>Campaign: {c.title}</option>
                 ))}
              </select>
              <p className="text-xs text-amber-600 mt-1">
                  ⚠ Please select the campaign to ensure your submission is tracked for payment.
              </p>
            </div>
            <div>
              <label className="label-text">Description</label>
              <textarea
                className="input-field"
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
              />
            </div>
            <Input
              id="videoUrl"
              label="Video URL or Link"
              value={formData.videoUrl}
              onChange={(e) =>
                setFormData({ ...formData, videoUrl: e.target.value })
              }
              required
              helperText="YouTube, Instagram, or any video link"
            />
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={submitting}>
                Submit for Review
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default InfluencerVideos;
