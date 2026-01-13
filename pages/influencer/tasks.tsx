import React, { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { supabase } from "@/lib/supabase";
import { CheckCircle, Clock, Target, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useRouter } from "next/router";

const InfluencerTasksPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    if (user?.role === "admin") {
      router.push("/admin/dashboard");
      return;
    }
    fetchTasks();
  }, [user]);

  // Add approval status state
  const [approvalStatus, setApprovalStatus] = useState<string | null>(null);

  const fetchTasks = async () => {
    try {
      // 1. Fetch influencer ID & Status
      const { data: influencer } = await supabase
        .from("influencers")
        .select("id, approval_status")
        .eq("user_id", user?.id)
        .single();

      if (!influencer) return;
      
      setApprovalStatus((influencer as any).approval_status);

      if ((influencer as any).approval_status !== 'approved') {
          setLoading(false);
          return;
      }

      const influencerId = (influencer as any).id;

      // 2. Fetch standard task assignments
      const { data: assignments } = await supabase
        .from("task_assignments")
        .select(`
          *,
          tasks(*)
        `)
        .eq("influencer_id", influencerId)
        .order("created_at", { ascending: false });

      // 3. Fetch approved campaign applications
      const { data: campaigns } = await supabase
        .from("campaign_applications")
        .select(`
          *,
          campaigns (*)
        `)
        .eq("influencer_id", influencerId)
        .eq("status", "approved")
        .order("updated_at", { ascending: false });

      // 4. Fetch ALL video submissions for this influencer
      const { data: submissions } = await supabase
        .from("video_submissions")
        .select("*")
        .eq("influencer_id", influencerId);
        
      // 5. Fetch approved task applications (influencer_tasks)
      // These are tasks the influencer applied for and got approved
      const { data: approvedApplications } = await supabase
        .from("influencer_tasks")
        .select(`
            *,
            tasks(*)
        `)
        .eq("influencer_id", influencerId)
        .eq("status", "assigned"); // Admin approves by setting status to 'assigned'

      const typedSubmissions = (submissions || []) as any[];

      // Helper to find submission for campaign
      const getCampaignSubmission = (campaignId: string) => {
        return typedSubmissions?.find(s => s.campaign_id === campaignId);
      };

      // 5. Normalize Assignments
      const normalizedAssignments = (assignments || []).map((a: any) => ({
        id: a.id,
        type: 'assignment',
        title: a.tasks?.title || 'Untitled Task',
        description: a.tasks?.description,
        topic: a.tasks?.topic,
        guidelines: a.tasks?.guidelines,
        status: a.status, 
        created_at: a.created_at,
        assigned_month: a.assigned_month,
        assigned_year: a.assigned_year,
        raw: a
      }));

      // 6. Normalize Campaigns
      const normalizedCampaigns = (campaigns || []).map((c: any) => {
        const submission = getCampaignSubmission(c.campaign_id);
        let status = 'assigned';
        if (submission) {
          if (submission.approval_status === 'approved') {
            status = 'completed';
          } else {
            status = 'submitted';
          }
        }

        return {
          id: c.id,
          type: 'campaign',
          title: c.campaigns?.title || 'Campaign Task',
          description: `Campaign: ${c.campaigns?.title}`,
          status: status,
          created_at: c.updated_at,
          assigned_month: new Date(c.updated_at).toLocaleString("default", { month: "long" }),
          assigned_year: new Date(c.updated_at).getFullYear(),
          raw: c
        };
      });

      // 7. Normalize Approved Applications
      const normalizedApplications = (approvedApplications || []).map((app: any) => ({
        id: app.id,
        type: 'assignment', // Treat as standard assignment for UI consistency
        title: app.tasks?.title || 'Approved Task',
        description: app.tasks?.description,
        topic: app.tasks?.topic,
        guidelines: app.tasks?.guidelines,
        status: app.status, 
        created_at: app.created_at,
        assigned_month: app.assigned_month,
        assigned_year: app.assigned_year,
        raw: app
      }));

      // Combine and sort by date
      const allTasks = [...normalizedCampaigns, ...normalizedAssignments, ...normalizedApplications].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setTasks(allTasks);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "success";
      case "submitted": return "info";
      case "assigned": return "warning";
      default: return "default";
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading tasks...</div>
        </div>
      </Layout>
    );
  }

  if (approvalStatus !== 'approved') {
    return (
      <Layout>
        <div className="text-center py-12">
          <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Account Not Approved
          </h2>
          <p className="text-gray-600">
            {approvalStatus === 'rejected' 
              ? "Your application was not approved. Please contact support." 
              : "Your account is pending approval. You will be notified once reviewed."}
          </p>
        </div>
      </Layout>
    );
  }

  const currentMonth = new Date().toLocaleString("default", { month: "long" });
  const currentYear = new Date().getFullYear();

  // Filter for active tasks (not completed)
  const activeTasks = tasks.filter(t => t.status !== 'completed');
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const submittedCount = tasks.filter(t => t.status === 'submitted').length;

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
          <p className="text-gray-600 mt-1">
            Complete your assigned tasks to earn rewards and build your influence
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Active Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{activeTasks.length}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{completedTasks.length}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Submitted</p>
                <p className="text-2xl font-bold text-gray-900">{submittedCount}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Active Tasks</h2>

          {activeTasks.length === 0 ? (
            <Card className="text-center py-12">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No active tasks</h3>
              <p className="text-gray-600">Check back soon for assignments or apply to campaigns.</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {activeTasks.map((task) => (
                <Card key={`${task.type}-${task.id}`} className="hover:shadow-lg transition-shadow p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={task.type === 'campaign' ? 'info' : 'default'} className="text-xs">
                          {task.type === 'campaign' ? 'Campaign' : 'Monthly Task'}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(task.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">{task.title}</h3>
                      {task.topic && (
                         <Badge variant="info" className="mt-1 mb-2">{task.topic}</Badge>
                      )}
                      
                      <p className="text-gray-600 mt-1 mb-2">{task.description}</p>
                      
                      {(task.guidelines && (task.status === 'assigned')) && (
                          <div className="bg-blue-50 p-3 rounded text-sm text-blue-800 mb-3">
                              <p className="font-bold mb-1">Guidelines:</p>
                              <p className="whitespace-pre-wrap">{task.guidelines}</p>
                          </div>
                      )}
                    </div>
                    <Badge variant={getStatusColor(task.status)}>{task.status}</Badge>
                  </div>

                  {task.status === "assigned" || task.status === "submitted" ? (
                    <div className="mt-4">
                      {task.type === 'assignment' ? (
                        <Link href={`/influencer/videos?task=${task.id}`}>
                           <Button variant="primary">
                            {task.status === "submitted" ? "View Submission" : "Submit Video"}
                          </Button>
                        </Link>
                      ) : (
                        <Link href={`/influencer/videos?campaign=${task.raw.campaign_id}`}>
                          <Button variant="primary">
                            Submit Campaign Video
                          </Button>
                        </Link>
                      )}
                    </div>
                  ) : null}
                </Card>
              ))}
            </div>
          )}
        </div>
        
        {completedTasks.length > 0 && (
          <div className="space-y-4 mt-10">
            <h2 className="text-2xl font-bold text-gray-900">Completed Tasks</h2>
            <div className="grid gap-4">
              {completedTasks.map((task) => (
                <Card key={`${task.type}-${task.id}`} className="opacity-80 p-5">
                   <h3 className="text-lg font-bold text-gray-900">{task.title}</h3>
                   <Badge variant="success" className="mt-2">Completed</Badge>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default InfluencerTasksPage;
