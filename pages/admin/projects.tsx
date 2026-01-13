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

    const { error } = await supabase.from('projects').insert([payload] as any);

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
      <div className="space-y-8">
        {/* Header - Reponsive */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Marketing Projects</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage IT service promotion campaigns</p>
          </div>
          <Button 
            variant="primary" 
            onClick={() => setShowCreateModal(true)}
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>

        {/* PROJECTS LIST */}
        <div className="min-h-[50vh]">
          {projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 sm:p-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 text-center">
              <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                 <Target className="h-8 w-8 text-primary-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No projects yet</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Create your first marketing campaign to start tracking objectives, target audiences, and deliverables.
              </p>
              <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Project
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                <Card key={project.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                    <div className="pr-4">
                        <h3 className="text-lg font-bold text-gray-900 line-clamp-1" title={project.title}>
                            {project.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2" title={project.description}>
                            {project.description}
                        </p>
                    </div>
                    <Badge variant={project.is_active ? 'success' : 'warning'} className="shrink-0">
                        {project.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    </div>

                    <div className="flex-1 space-y-4">
                        {/* OBJECTIVES */}
                        {project.objectives && project.objectives.length > 0 && (
                            <div>
                                <h4 className="text-xs font-semibold uppercase text-gray-500 mb-2 tracking-wider">Objectives</h4>
                                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                    {project.objectives.slice(0, 3).map((obj, i) => (
                                    <li key={i} className="truncate">{obj}</li>
                                    ))}
                                    {project.objectives.length > 3 && (
                                        <li className="text-xs text-primary-600 font-medium pl-4">+ {project.objectives.length - 3} more</li>
                                    )}
                                </ul>
                            </div>
                        )}

                        {/* TARGET AUDIENCE */}
                        {project.target_audience && project.target_audience.length > 0 && (
                             <div>
                                <h4 className="text-xs font-semibold uppercase text-gray-500 mb-2 tracking-wider mt-4">Target Audience</h4>
                                <div className="flex flex-wrap gap-2">
                                    {project.target_audience.slice(0, 4).map((aud, i) => (
                                    <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                                        {aud}
                                    </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
                        <span>{new Date(project.created_at).toLocaleDateString()}</span>
                        <Button variant="ghost" size="sm" className="text-primary-600 hover:text-primary-700 p-0 hover:bg-transparent">
                            View Details →
                        </Button>
                    </div>
                </Card>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* CREATE MODAL */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Project" size="lg">
        <form onSubmit={handleCreateProject} className="space-y-5">
          <Input
            label="Project Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            placeholder="e.g., Q3 Cloud Migration Campaign"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                placeholder="Briefly describe the campaign goals..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Objectives</label>
                <textarea
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                    rows={4}
                    value={formData.objectives.join(', ')}
                    onChange={(e) =>
                    setFormData({
                        ...formData,
                        objectives: e.target.value.split(',').map((s) => s.trim()),
                    })
                    }
                    placeholder="Increase brand awareness, Generate leads (comma-separated)"
                />
                 <p className="text-xs text-gray-500 mt-1">Separate multiple objectives with commas</p>
             </div>

             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                 <textarea
                     className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                     rows={4}
                     value={formData.target_audience.join(', ')}
                     onChange={(e) =>
                     setFormData({
                         ...formData,
                         target_audience: e.target.value.split(',').map((s) => s.trim()),
                     })
                     }
                     placeholder="CTOs, Small Business Owners, IT Managers (comma-separated)"
                 />
                 <p className="text-xs text-gray-500 mt-1">Separate audience segments with commas</p>
             </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Guidelines</label>
             <textarea
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                rows={4}
                value={formData.guidelines}
                onChange={(e) => setFormData({ ...formData, guidelines: e.target.value })}
                placeholder="Specific do's and don'ts for the influencers..."
             />
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Sample Script (Optional)</label>
             <textarea
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 outline-none text-sm bg-gray-50"
                rows={3}
                value={formData.sample_script}
                onChange={(e) => setFormData({ ...formData, sample_script: e.target.value })}
                placeholder="A starting point for the video script..."
             />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="ghost" onClick={() => setShowCreateModal(false)}>
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
