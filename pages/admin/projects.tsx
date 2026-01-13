import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { supabase } from '@/lib/supabase';
import { MarketingProject } from '@/types';
import { Plus, Target, Users, Calendar, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import { Toast } from '@/components/ui/Toast';

const AdminProjectsPage = () => {
  const { user } = useAuth();
  const router = useRouter();

  const [projects, setProjects] = useState<MarketingProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

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
    try {
      const { data, error } = await supabase
        .from('marketing_projects') // Corrected Table Name
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      setToast({ message: 'Failed to load projects: ' + error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // CREATE PROJECT
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        objectives: formData.objectives,
        target_audience: formData.target_audience,
        guidelines: formData.guidelines,
        sample_script: formData.sample_script || null,
        created_by: user?.id,
        is_active: true,
        deliverables: formData.deliverables,
      };

      const { error } = await supabase.from('marketing_projects').insert([payload] as any);

      if (error) throw error;

      setToast({ message: 'Marketing project created successfully!', type: 'success' });
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
    } catch (error: any) {
      setToast({ message: error.message || 'Failed to create project', type: 'error' });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-500 animate-pulse">Loading campaigns...</div>
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
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage your active influencer campaigns & assignments</p>
          </div>
          <Button 
            variant="primary" 
            onClick={() => setShowCreateModal(true)}
            className="w-full sm:w-auto shadow-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>

        {/* PROJECTS LIST */}
        <div className="min-h-[50vh]">
          {projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 text-center">
              <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm ring-1 ring-gray-100">
                 <Target className="h-8 w-8 text-primary-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No projects yet</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Create your first marketing campaign to start tracking objectives, target audiences, and deliverables.
              </p>
              <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Project
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                <Card key={project.id} className="flex flex-col h-full hover:shadow-lg transition-all duration-200 border border-gray-100 group">
                    <div className="flex justify-between items-start mb-4">
                      <div className="pr-4">
                          <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-primary-600 transition-colors" title={project.title}>
                              {project.title}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(project.created_at).toLocaleDateString()}
                          </p>
                      </div>
                      <Badge variant={project.is_active ? 'success' : 'default'} className="shrink-0">
                          {project.is_active ? 'Active' : 'Closed'}
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-600 mb-6 line-clamp-3 leading-relaxed">
                         {project.description}
                    </p>

                    <div className="flex-1 space-y-4">
                        {/* OBJECTIVES */}
                        {project.objectives && project.objectives.length > 0 && (
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <h4 className="text-xs font-bold uppercase text-gray-500 mb-2 tracking-wider flex items-center gap-1">
                                  <CheckCircle className="h-3 w-3" /> Objectives
                                </h4>
                                <ul className="space-y-1">
                                    {project.objectives.slice(0, 2).map((obj, i) => (
                                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                      <span className="text-primary-500 mt-1">•</span>
                                      <span className="line-clamp-1">{obj}</span>
                                    </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* TARGET AUDIENCE */}
                        {project.target_audience && project.target_audience.length > 0 && (
                             <div>
                                <h4 className="text-xs font-bold uppercase text-gray-500 mb-2 tracking-wider mt-2 flex items-center gap-1">
                                  <Users className="h-3 w-3" /> Target Audience
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {project.target_audience.slice(0, 3).map((aud, i) => (
                                    <span key={i} className="px-2 py-1 bg-white border border-gray-200 text-gray-600 text-xs rounded-full font-medium shadow-sm">
                                        {aud}
                                    </span>
                                    ))}
                                    {project.target_audience.length > 3 && (
                                      <span className="text-xs text-gray-400 self-center">+{project.target_audience.length - 3}</span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-gray-100">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="w-full justify-between group-hover:bg-primary-50 group-hover:text-primary-700"
                            onClick={() => router.push(`/admin/projects/${project.id}`)}
                        >
                            View Campaign Details
                            <span>→</span>
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
        <form onSubmit={handleCreateProject} className="space-y-6">
          <Input
            label="Project Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            placeholder="e.g., Q3 App Launch Campaign"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm min-h-[100px]"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                placeholder="What is the main goal of this campaign?"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <label className="block text-sm font-bold text-gray-900 mb-2">Objectives (comma separated)</label>
                <textarea
                    className="w-full p-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                    rows={4}
                    value={formData.objectives.join(', ')}
                    onChange={(e) =>
                    setFormData({
                        ...formData,
                        objectives: e.target.value.split(',').map((s) => s.trim()),
                    })
                    }
                    placeholder="e.g. Increase installs, Brand Awareness"
                />
             </div>

             <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <label className="block text-sm font-bold text-gray-900 mb-2">Target Audience (comma separated)</label>
                 <textarea
                     className="w-full p-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                     rows={4}
                     value={formData.target_audience.join(', ')}
                     onChange={(e) =>
                     setFormData({
                         ...formData,
                         target_audience: e.target.value.split(',').map((s) => s.trim()),
                     })
                     }
                     placeholder="e.g. Students, HR Managers, Gamers"
                 />
             </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Guidelines</label>
             <textarea
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm min-h-[120px]"
                value={formData.guidelines}
                onChange={(e) => setFormData({ ...formData, guidelines: e.target.value })}
                placeholder="Specific do's and don'ts for the influencers content..."
                required
             />
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Sample Script / Key Talking Points</label>
             <textarea
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm bg-blue-50/30 min-h-[100px]"
                value={formData.sample_script}
                onChange={(e) => setFormData({ ...formData, sample_script: e.target.value })}
                placeholder="Optional: Provide a starting script or hook..."
             />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
            <Button type="button" variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Campaign
            </Button>
          </div>
        </form>
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

export default AdminProjectsPage;
