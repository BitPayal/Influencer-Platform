import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { supabase } from '@/lib/supabase';
import { MarketingProject } from '@/types';
import { Plus, Target } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';

const AdminProjectsPage = () => {
  const { user } = useAuth();
  const router = useRouter();

  const [projects, setProjects] = useState<MarketingProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    objectives: [] as string[],
    target_audience: [] as string[],
    deliverables: [] as string[],
    guidelines: '',
    sample_script: '',
    is_active: true,
  });

  // AUTH CHECK
  useEffect(() => {
    if (!user) return;
    if (user.role !== 'admin') {
      router.push('/influencer/dashboard');
      return;
    }
    fetchProjects();
  }, [user]);

  // FETCH PROJECTS
  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setProjects(data || []);
    setLoading(false);
  };

  // CREATE PROJECT
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      title: formData.title,
      description: formData.description,
      objectives: formData.objectives,            // ARRAY
      target_audience: formData.target_audience,  // ARRAY
      guidelines: formData.guidelines,
      sample_script: formData.sample_script,
      created_by: user?.id,
      is_active: true,
      deliverables: formData.deliverables,        // ARRAY
    };

    console.log("Payload inserting:", payload);

    const { error } = await supabase.from('projects').insert([payload]);

    if (error) {
      alert(error.message);
      console.error(error);
      return;
    }

    // RESET
    setShowCreateModal(false);
    setFormData({
      title: '',
      description: '',
      objectives: [],
      target_audience: [],
      deliverables: [],
      guidelines: '',
      sample_script: '',
      is_active: true,
    });

    fetchProjects();
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading projects...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Marketing Projects</h1>
            <p className="text-gray-600 mt-1">Manage IT service promotion campaigns</p>
          </div>
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>

        {/* PROJECTS LIST */}
        <div className="grid gap-6">
          {projects.length === 0 ? (
            <Card className="text-center py-12">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
              <p className="text-gray-600 mb-4">
                Create your first marketing campaign to get started
              </p>
              <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                Create Project
              </Button>
            </Card>
          ) : (
            projects.map((project) => (
              <Card key={project.id}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{project.title}</h3>
                    <p className="text-gray-600 mt-1">{project.description}</p>
                  </div>
                  <Badge variant={project.is_active ? 'success' : 'warning'}>
                    {project.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                {/* OBJECTIVES */}
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Objectives</h4>
                  <ul className="list-disc list-inside text-gray-600">
                    {project.objectives?.map((obj, i) => (
                      <li key={i}>{obj}</li>
                    ))}
                  </ul>
                </div>

                {/* TARGET AUDIENCE */}
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Target Audience</h4>
                  <ul className="list-disc list-inside text-gray-600">
                    {Array.isArray(project.target_audience) &&
                      project.target_audience.map((aud, i) => (
                        <li key={i}>{aud}</li>
                      ))}
                  </ul>
                </div>

                {/* GUIDELINES */}
                {project.guidelines && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold mb-2">Guidelines</h4>
                    <p className="text-sm whitespace-pre-wrap">{project.guidelines}</p>
                  </div>
                )}

                {/* SAMPLE SCRIPT */}
                {project.sample_script && (
                  <div className="mt-4 p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold mb-2">Sample Script</h4>
                    <p className="italic text-sm whitespace-pre-wrap">
                      {project.sample_script}
                    </p>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </div>

      {/* CREATE MODAL */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Project">
        <form onSubmit={handleCreateProject} className="space-y-4">

          <Input
            label="Project Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <textarea
            className="input-field"
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
            placeholder="Project description"
          />

          <textarea
            className="input-field"
            rows={3}
            value={formData.objectives.join(', ')}
            onChange={(e) =>
              setFormData({
                ...formData,
                objectives: e.target.value.split(',').map((s) => s.trim()),
              })
            }
            placeholder="Objectives (comma-separated)"
          />

          <Input
            label="Target Audience (comma-separated)"
            value={formData.target_audience.join(', ')}
            onChange={(e) =>
              setFormData({
                ...formData,
                target_audience: e.target.value.split(',').map((s) => s.trim()),
              })
            }
          />

          <textarea
            className="input-field"
            rows={4}
            value={formData.guidelines}
            onChange={(e) => setFormData({ ...formData, guidelines: e.target.value })}
            placeholder="Guidelines"
          />

          <textarea
            className="input-field"
            rows={4}
            value={formData.sample_script}
            onChange={(e) => setFormData({ ...formData, sample_script: e.target.value })}
            placeholder="Sample Script"
          />

          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Project
            </Button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};

export default AdminProjectsPage;
