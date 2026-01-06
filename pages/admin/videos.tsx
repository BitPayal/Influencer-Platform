import React, { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const AdminVideosPage = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVideos();
  }, []);

  // ✅ Fetch videos + influencer + task
  const fetchVideos = async () => {
  try {
    const { data, error } = await supabase
      .from('video_submissions')
      .select(`
        *,
        influencer:influencers(*)
      `)
      .eq('status', 'submitted')   // ✅ IMPORTANT FIX
      .order('created_at', { ascending: false });

    if (error) throw error;

    setVideos(data || []);
  } catch (error) {
    console.error("Error fetching videos:", error);
  } finally {
    setLoading(false);
  }
};


  // ✅ Approve
  const approveVideo = async (id) => {
    await supabase
      .from("video_submissions")
      .update({
        approval_status: "approved",
        reviewed_at: new Date(),
      })
      .eq("id", id);

    fetchVideos();
  };

  // ❌ Reject
  const rejectVideo = async (id) => {
    await supabase
      .from("video_submissions")
      .update({
        approval_status: "rejected",
        reviewed_at: new Date(),
      })
      .eq("id", id);

    fetchVideos();
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
        <h1 className="text-3xl font-bold text-gray-900">Video Submissions</h1>

        {videos.length === 0 ? (
          <Card className="p-10 text-center text-gray-600">
            No videos submitted yet
          </Card>
        ) : (
          videos.map((v) => (
            <Card key={v.id} className="p-6 space-y-3">
              <h2 className="text-xl font-semibold">
                {v.title || v.task?.title}
              </h2>

              <p className="text-gray-700">{v.description}</p>

              <a
                href={v.video_url}
                className="text-blue-600 underline"
                target="_blank"
              >
                Watch Video
              </a>

              <p className="text-sm">
                <b>Influencer:</b>{" "}
                {v.influencer?.full_name} ({v.influencer?.email})
              </p>

              <p className="text-sm text-gray-500">
                Submitted: {new Date(v.submitted_at).toLocaleString()}
              </p>

              <p className="text-sm">
                Status:{" "}
                <span className="font-semibold text-blue-600">
                  {v.approval_status}
                </span>
              </p>

              {v.approval_status === "pending" && (
                <div className="flex gap-3 mt-3">
                  <Button variant="primary" onClick={() => approveVideo(v.id)}>
                    Approve
                  </Button>
                  <Button variant="danger" onClick={() => rejectVideo(v.id)}>
                    Reject
                  </Button>
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </Layout>
  );
};

export default AdminVideosPage;
