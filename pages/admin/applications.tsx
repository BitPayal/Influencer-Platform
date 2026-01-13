
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { Check, X, Clock, User, DollarSign, MessageSquare } from 'lucide-react';

const AdminApplications = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('influencer_tasks')
        .select(`
            *,
            tasks (
                title,
                reward
            ),
            influencers (
                user_id,
                full_name,
                email
            )
        `)
        .eq('status', 'pending_approval') // Only show pending
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (id: number, approved: boolean) => {
    try {
      const newStatus = approved ? 'assigned' : 'rejected';
      
      const { error } = await supabase
        .from('influencer_tasks')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      toast.success(`Application ${approved ? 'approved' : 'rejected'}`);
      setApplications(prev => prev.filter(app => app.id !== id));
      
    } catch (error) {
      console.error('Error updating application:', error);
      toast.error('Failed to update application');
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
            <div>
                 <h1 className="text-2xl font-bold text-gray-900">Task Applications</h1>
                 <p className="text-gray-500">Review pending requests from influencers</p>
            </div>
            <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium">
                {applications.length} Pending
            </div>
        </div>

        {loading ? (
           <div className="flex justify-center h-64 items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
           </div>
        ) : applications.length === 0 ? (
           <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
               <div className="bg-gray-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 text-gray-400" />
               </div>
               <h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
               <p className="text-gray-500">No pending applications to review.</p>
           </div>
        ) : (
          <div className="grid gap-6">
             {applications.map((app) => (
                 <Card key={app.id} className="p-6 transition-all hover:shadow-md">
                     <div className="flex flex-col md:flex-row gap-6">
                         
                         {/* Influencer Info */}
                         <div className="md:w-1/4">
                             <div className="flex items-center gap-3 mb-2">
                                <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                                    {app.influencers?.full_name?.[0] || 'U'}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">{app.influencers?.full_name || 'Unknown User'}</p>
                                    <p className="text-xs text-gray-500">Influencer</p>
                                </div>
                             </div>
                             <div className="text-sm text-gray-500 space-y-1">
                                 <p className="flex items-center"><Clock className="w-3 h-3 mr-1" /> Applied: {new Date(app.created_at).toLocaleDateString()}</p>
                             </div>
                         </div>

                         {/* Task & Pitch */}
                         <div className="md:w-1/2 border-l border-gray-100 pl-6 space-y-4">
                             <div>
                                 <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">Applying For</h4>
                                 <p className="text-lg font-medium text-gray-900">{app.tasks?.title}</p>
                             </div>
                            
                             <div className="bg-gray-50 p-4 rounded-lg">
                                 <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                                     <MessageSquare className="w-3 h-3 mr-1" /> Pitch
                                 </h4>
                                 <p className="text-gray-700 text-sm whitespace-pre-wrap">{app.pitch || "No specific pitch provided."}</p>
                             </div>
                         </div>

                         {/* Actions & Rate */}
                         <div className="md:w-1/4 flex flex-col justify-between border-l border-gray-100 pl-6">
                             <div className="text-right mb-4">
                                 <p className="text-sm text-gray-500">Requested Rate</p>
                                 <div className="flex items-baseline justify-end gap-2">
                                     <span className="text-2xl font-bold text-gray-900">₹{app.requested_rate?.toLocaleString()}</span>
                                     <span className="text-xs text-gray-400">/ ₹{app.tasks?.reward?.toLocaleString()}</span>
                                 </div>
                             </div>

                             <div className="flex gap-3">
                                 <Button 
                                    className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                                    onClick={() => handleDecision(app.id, false)}
                                 >
                                     <X className="w-4 h-4 mr-1" /> Reject
                                 </Button>
                                 <Button 
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-sm shadow-green-200"
                                    onClick={() => handleDecision(app.id, true)}
                                 >
                                     <Check className="w-4 h-4 mr-1" /> Approve
                                 </Button>
                             </div>
                         </div>
                     </div>
                 </Card>
             ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminApplications;
