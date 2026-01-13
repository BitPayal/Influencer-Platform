
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Clock, DollarSign, Target, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const TaskDetailsPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [existingAssignment, setExistingAssignment] = useState<any>(null);

  useEffect(() => {
    if (id && user) {
      fetchTaskDetails();
    }
  }, [id, user]);

  const fetchTaskDetails = async () => {
    try {
      // 1. Fetch Task
      const { data: taskData, error: taskError } = await (supabase
        .from('tasks') as any)
        .select('*')
        .eq('id', id)
        .single();
      
      if (taskError) throw taskError;
      setTask(taskData);

      // 2. Check if already "applied" or assigned (check influencer_tasks)
      const { data: influencer } = await (supabase
        .from('influencers') as any)
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (influencer) {
        const { data: assignment } = await (supabase
          .from('influencer_tasks') as any)
          .select('*')
          .eq('task_id', id)
          .eq('influencer_id', influencer.id)
          .single();
          
        setExistingAssignment(assignment);
      }

    } catch (error) {
      console.error('Error fetching task details:', error);
      toast.error('Failed to load task details');
    } finally {
      setLoading(false);
    }
  };

  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [pitch, setPitch] = useState('');
  const [expectedRate, setExpectedRate] = useState('');

  // ... fetchTaskDetails ...

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplying(true);
    try {
      const { data: influencer } = await (supabase
        .from('influencers') as any)
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (!influencer) {
        toast.error('Influencer profile not found');
        return;
      }

      // Create Task Application
      const { error } = await (supabase
        .from('influencer_tasks') as any)
        .insert([{
          task_id: id,
          influencer_id: influencer.id,
          status: 'pending_approval', // New status
          pitch: pitch,
          requested_rate: parseFloat(expectedRate) || 0,
          assigned_month: new Date().toLocaleString('default', { month: 'long' }),
          assigned_year: new Date().getFullYear()
        }]);

      if (error) throw error;

      toast.success('Application submitted! Waiting for approval.');
      // Refresh to show status
      fetchTaskDetails();
      setShowApplicationForm(false);
      
    } catch (error: any) {
      console.error('Error applying for task:', error);
      toast.error(error.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    );
  }

  // Render Status
  if (existingAssignment) {
    return (
        <Layout>
             <div className="max-w-4xl mx-auto py-8">
                <Button variant="ghost" onClick={() => router.back()} className="mb-6 pl-0">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                
                <Card className="text-center p-12">
                     {existingAssignment.status === 'assigned' || existingAssignment.status === 'in_progress' ? (
                         <>
                            <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                <Target className="h-8 w-8 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">You are working on this task!</h2>
                            <p className="text-gray-600 mb-6">Return to your dashboard to manage your submission.</p>
                            <Button variant="primary" onClick={() => router.push('/influencer/tasks')}>
                                Go to My Tasks
                            </Button>
                         </>
                     ) : existingAssignment.status === 'pending_approval' ? (
                         <>
                             <div className="mx-auto h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                                <Clock className="h-8 w-8 text-yellow-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Pending</h2>
                            <p className="text-gray-600 mb-6">Your application is being reviewed by the admin.</p>
                            <Button variant="secondary" onClick={() => router.push('/influencer/campaigns')}>
                                Browse More Opportunities
                            </Button>
                         </>
                     ) : (
                         <div className="text-red-500">
                             <h2 className="text-2xl font-bold">Application Status: {existingAssignment.status}</h2>
                         </div>
                     )}
                </Card>
             </div>
        </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6 pl-0 hover:bg-transparent hover:text-indigo-600">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Opportunities
        </Button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <Badge variant="info" className="mb-3">Platform Task</Badge>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{task.title}</h1>
                <div className="flex items-center gap-4 text-gray-600">
                  <div className="flex items-center">
                    <Target className="w-4 h-4 mr-1.5" />
                    {task.topic}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1.5" />
                    {new Date(task.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 mb-1 uppercase tracking-wide font-medium">Reward</p>
                <p className="text-3xl font-bold text-indigo-600">₹{task.reward?.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 space-y-8">
            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-indigo-500" />
                Description
              </h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                {task.description}
              </p>
            </section>

            {task.guidelines && (
              <section className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                <h3 className="text-lg font-bold text-blue-900 mb-3">Guidelines</h3>
                <p className="text-blue-800 whitespace-pre-wrap leading-relaxed">
                  {task.guidelines}
                </p>
              </section>
            )}

            {/* Application Form or Start Button */}
            <div className="pt-6 border-t border-gray-100">
              {!showApplicationForm ? (
                   <div className="flex justify-end">
                        <Button 
                        variant="primary" 
                        size="lg"
                        className="w-full md:w-auto min-w-[200px]"
                        onClick={() => setShowApplicationForm(true)}
                        >
                        Start This Task
                        </Button>
                   </div>
              ) : (
                  <form onSubmit={handleApply} className="bg-gray-50 p-6 rounded-xl border border-gray-200 animate-fadeIn">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Apply for this Task</h3>
                      
                      <div className="space-y-4">
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Why are you a good fit?</label>
                              <textarea 
                                required
                                value={pitch}
                                onChange={(e) => setPitch(e.target.value)}
                                rows={3}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="Briefly describe your approach..."
                              />
                          </div>

                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Expected Payment (₹)</label>
                              <input 
                                type="number"
                                required
                                value={expectedRate}
                                onChange={(e) => setExpectedRate(e.target.value)}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder={task.reward?.toString()}
                              />
                              <p className="text-xs text-gray-500 mt-1">Proposed reward: ₹{task.reward}</p>
                          </div>

                          <div className="flex justify-end gap-3 pt-2">
                              <Button type="button" variant="ghost" onClick={() => setShowApplicationForm(false)}>
                                  Cancel
                              </Button>
                              <Button type="submit" variant="primary" disabled={applying}>
                                  {applying ? 'Submitting...' : 'Submit Application'}
                              </Button>
                          </div>
                      </div>
                  </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TaskDetailsPage;
