import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { supabase } from '@/lib/supabase';
import { GuidebookResource } from '@/types';
import { Book, Download, FileText, Video, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';

const InfluencerGuidebookPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [resources, setResources] = useState<GuidebookResource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user === undefined) return; // Wait for auth to load
    if (user === null) {
      router.push('/login');
      return;
    }
    if (user.role === 'admin') {
      router.push('/admin/dashboard');
      return;
    }
    fetchResources();
  }, [user]);

  const fetchResources = async () => {
    try {
      const { data, error } = await supabase
        .from('guidebook_resources')
        .select('*')
        .in('access_level', ['all', 'influencer'])
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResources(data || []);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return <FileText className="h-8 w-8 text-red-600" />;
      case 'video':
        return <Video className="h-8 w-8 text-purple-600" />;
      case 'image':
        return <ImageIcon className="h-8 w-8 text-green-600" />;
      default:
        return <Book className="h-8 w-8 text-blue-600" />;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading guidebooks...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Innovation Playbook & Resources</h1>
          <p className="text-gray-600 mt-1">
            Access training materials, guidelines, and resources to create impactful content
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.length === 0 ? (
            <Card className="col-span-full text-center py-12">
              <Book className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No resources available</h3>
              <p className="text-gray-600">Check back soon for training materials</p>
            </Card>
          ) : (
            resources.map((resource) => (
              <Card key={resource.id} className="hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="bg-gray-100 p-3 rounded-lg">{getFileIcon(resource.file_type)}</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{resource.title}</h3>
                    {resource.description && (
                      <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
                    )}
                    <div className="flex gap-2 mt-2">
                      <Badge variant="default">{resource.category}</Badge>
                      <Badge variant="info">{resource.file_type.toUpperCase()}</Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{formatFileSize(resource.file_size)}</p>
                  </div>
                </div>
                <a
                  href={resource.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex items-center justify-center gap-2 w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  {resource.file_type === 'pdf' ? 'View PDF' : 'Download'}
                </a>
              </Card>
            ))
          )}
        </div>

        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            📚 Cehpoint Innovation Movement Playbook
          </h3>
          <p className="text-gray-700">
            Learn how to effectively promote IT services, EdTech, AgriTech, and HealthTech solutions
            in your community. Our comprehensive guidebook includes:
          </p>
          <ul className="mt-3 space-y-2 text-gray-700">
            <li>✓ Content creation strategies for 6 key sectors</li>
            <li>✓ Sample scripts and post templates</li>
            <li>✓ Best practices for local engagement</li>
            <li>✓ Do's and don'ts for authentic promotion</li>
            <li>✓ Revenue optimization tips</li>
          </ul>
        </Card>
      </div>
    </Layout>
  );
};

export default InfluencerGuidebookPage;
