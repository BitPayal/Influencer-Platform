import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';

const AdminTasksPage = () => {
  const { user } = useAuth();
  const router = useRouter();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reward: 0
  });

  useEffect(() => {
    if (!user) return;

    if (user.role !== 'admin') {
      router.push('/influencer/dashboard');
      return;
    }

    fetchTasks();
  }, [user]);

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setTasks(data || []);
    setLoading(false);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();

    const { error } = await supabase
      .from('tasks')
      .insert([
        {
          title: formData.title,
          description: formData.description,
          reward: formData.reward,
          project_id: null // you can update later
        }
      ] as any);

    if (error) {
      console.error(error);
      alert("Failed to create task");
      return;
    }

    setShowCreateModal(false);
    setFormData({ title: '', description: '', reward: 0 });
    fetchTasks();
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-600 text-lg">Loading tasks...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600 mt-1">Manage influencer tasks</p>
        </div>

        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          Create Task
        </Button>
      </div>

      <div className="grid gap-6">
        {tasks.length === 0 ? (
          <Card className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900">No tasks yet</h3>
            <p className="text-gray-600">Create your first task to get started</p>
          </Card>
        ) : (
          tasks.map((task) => (
            <Card key={task.id} className="p-4 hover:shadow-lg transition">
              <h3 className="text-xl font-bold">{task.title}</h3>
              <p className="text-gray-600 mt-1">{task.description}</p>

              <div className="mt-3">
                <Badge variant="success">Reward: ₹{task.reward}</Badge>
              </div>

              <p className="text-xs text-gray-500 mt-2">
                Created at: {new Date(task.created_at).toLocaleString()}
              </p>
            </Card>
          ))
        )}
      </div>

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Task"
      >
        <form onSubmit={handleCreateTask} className="space-y-4">

          <Input
            label="Task Title"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />

          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              className="w-full p-2 border rounded"
              required
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            ></textarea>
          </div>

          <Input
            label="Reward Amount (₹)"
            type="number"
            required
            value={formData.reward}
            onChange={(e) =>
              setFormData({ ...formData, reward: parseInt(e.target.value) })
            }
          />

          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>

            <Button variant="primary" type="submit">
              Create Task
            </Button>
          </div>

        </form>
      </Modal>
    </Layout>
  );
};

export default AdminTasksPage;
