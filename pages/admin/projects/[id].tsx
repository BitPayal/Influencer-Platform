import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Layout } from '@/components/Layout';
import { supabase } from '@/lib/supabase';
import { MarketingProject } from '@/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Calendar, Users, Target, FileText, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Toast } from '@/components/ui/Toast';

const ProjectDetailsPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  
  const [project, setProject] = useState<MarketingProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) fetchProjectDetails();
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('marketing_projects')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProject(data);
    } catch (err: any) {
      console.error("Error fetching project:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout>
        <div className="text-center py-20 text-gray-500">Project not found.</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Back Button */}
        <Button 
            variant="ghost" 
            onClick={() => router.push('/admin/projects')}
            className="pl-0 hover:bg-transparent hover:text-primary-600"
        >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Projects
        </Button>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" /> Created: {new Date(project.created_at).toLocaleDateString()}
                    </span>
                    <Badge variant={project.is_active ? 'success' : 'default'}>
                        {project.is_active ? 'Active' : 'Closed'}
                    </Badge>
                </div>
            </div>
            {/* Future Actions: Edit/Delete could go here */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
                <Card className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-gray-500" /> Description
                    </h3>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {project.description}
                    </p>
                </Card>

                <Card className="p-6">
                     <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-gray-500" /> Guidelines
                    </h3>
                     <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 text-gray-800 whitespace-pre-line">
                        {project.guidelines}
                    </div>
                </Card>

                {project.sample_script && (
                    <Card className="p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Sample Script</h3>
                        <div className="bg-gray-50 p-4 rounded font-mono text-sm text-gray-700 whitespace-pre-line">
                            {project.sample_script}
                        </div>
                    </Card>
                )}
            </div>

            {/* Sidebar Info */}
            <div className="space-y-6">
                <Card className="p-6">
                     <h3 className="text-md font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Target className="h-4 w-4 text-primary-600" /> Objectives
                    </h3>
                    <ul className="space-y-2">
                        {project.objectives?.map((obj, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary-500 shrink-0"></span>
                                {obj}
                            </li>
                        ))}
                    </ul>
                </Card>

                <Card className="p-6">
                     <h3 className="text-md font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-600" /> Target Audience
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {project.target_audience?.map((aud, i) => (
                            <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-100">
                                {aud}
                            </span>
                        ))}
                    </div>
                </Card>

                 <Card className="p-6">
                     <h3 className="text-md font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" /> Deliverables
                    </h3>
                    <ul className="space-y-2">
                         {project.deliverables && project.deliverables.length > 0 ? (
                             project.deliverables.map((del, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                                    <CheckCircle className="h-3 w-3 text-green-500" /> {del}
                                </li>
                             ))
                         ) : (
                             <span className="text-sm text-gray-400 italic">No specific deliverables listed.</span>
                         )}
                    </ul>
                </Card>
            </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProjectDetailsPage;
