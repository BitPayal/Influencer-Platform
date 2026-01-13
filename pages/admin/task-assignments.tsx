import React, { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/router";

import { Toast } from '@/components/ui/Toast';

const AssignTasksPage = () => {
  const { user } = useAuth();
  const router = useRouter();

  const [influencers, setInfluencers] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedInfluencer, setSelectedInfluencer] = useState("");
  const [selectedTask, setSelectedTask] = useState("");
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (user === undefined) return;

    if (user === null) {
      router.push("/login");
      return;
    }

    if (user.role !== "admin") {
      router.push("/influencer/dashboard");
      return;
    }

    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch APPROVED influencers with correct column names
      const { data: infData, error: infErr } = await supabase
        .from("influencers")
        .select("id, full_name, email")
        .eq("approval_status", "approved");

      if (infErr) throw infErr;

      // Fetch tasks list
      const { data: taskData, error: taskErr } = await supabase
        .from("tasks")
        .select("id, title, reward");

      if (taskErr) throw taskErr;

      setInfluencers(infData || []);
      setTasks(taskData || []);

    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedInfluencer || !selectedTask) {
      setToast({ message: "Please select both influencer and task.", type: 'error' });
      return;
    }

    try {
      // Current month & year
      const month = new Date().toLocaleString("default", { month: "long" });
      const year = new Date().getFullYear();

      // Ensure IDs are parsed as numbers if they are strings representing numbers
      // But if standard UUIDs are used (which might be the case for Auth IDs, but here we deal with BIGINT table IDs)
      // The previous error was uuid vs bigint. 
      // So valid input for BIGINT in JS is number or string. 
      // Supabase client should handle string->bigint if format is correct.
      // However, if the SELECT returned strings (which it often does for BigInt to avoid overflow), we are fine.
      
      const payload = {
          influencer_id: selectedInfluencer, // This should be the BIGINT ID from the influencers table
          task_id: selectedTask,           // This should be the BIGINT ID from the tasks table
          status: "assigned",
          assigned_month: month,
          assigned_year: year,
      };

      const { error } = await supabase.from("task_assignments").insert([payload] as any);

      if (error) throw error;

      setToast({ message: "Task assigned successfully!", type: 'success' });
      setSelectedInfluencer("");
      setSelectedTask("");

    } catch (err: any) {
      console.error("Error assigning task:", err);
      setToast({ message: "Failed to assign task: " + (err.message || err.details || ""), type: 'error' });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Card className="p-6 max-w-4xl mx-auto mt-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Assign Tasks to Influencers
        </h1>

        {/* Influencer Dropdown */}
        <label className="block text-sm font-medium mb-2">
          Select Influencer
        </label>
        <select
          className="w-full p-3 border rounded-lg mb-6"
          value={selectedInfluencer}
          onChange={(e) => setSelectedInfluencer(e.target.value)}
        >
          <option value="">Choose influencer</option>
          {influencers.map((inf) => (
            <option key={inf.id} value={inf.id}>
              {inf.full_name || inf.email}
            </option>
          ))}
        </select>

        {/* Task Dropdown */}
        <label className="block text-sm font-medium mb-2">Select Task</label>
        <select
          className="w-full p-3 border rounded-lg mb-6"
          value={selectedTask}
          onChange={(e) => setSelectedTask(e.target.value)}
        >
          <option value="">Choose task</option>
          {tasks.map((task) => (
            <option key={task.id} value={task.id}>
              {task.title} (₹{task.reward})
            </option>
          ))}
        </select>

        {/* Assign Button */}
        <Button onClick={handleAssign} variant="primary">
          Assign Task
        </Button>
      </Card>

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

export default AssignTasksPage;
