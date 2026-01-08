import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Database } from '@/types/supabase';
import { SupabaseClient } from '@supabase/supabase-js';
import { User, Mail, Instagram, Youtube, Phone, FileText, Edit2, Save, X } from 'lucide-react';

// Create a typed client for this file
const typedSupabase = supabase as unknown as SupabaseClient<Database>;

const InfluencerProfile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    instagram_handle: '',
    youtube_handle: '',
    phone_number: '',
    bio: '',
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const { data, error } = await typedSupabase
          .from('influencers')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          setFormData({
            full_name: data.full_name || '',
            instagram_handle: data.instagram_handle || '',
            youtube_handle: data.youtube_handle || '',
            phone_number: data.phone_number || '',
            bio: data.bio || '',
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSaving(true);
    setMessage(null);

    try {
      const { error } = await typedSupabase
        .from('influencers')
        .update({
          full_name: formData.full_name,
          instagram_handle: formData.instagram_handle,
          youtube_handle: formData.youtube_handle,
          phone_number: formData.phone_number,
          bio: formData.bio,
        })
        .eq('user_id', user.id);

      if (error) throw error;
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false); // Switch back to view mode on success
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Layout><div>Loading...</div></Layout>;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
            <p className="text-gray-600">Manage your personal information and social handles.</p>
          </div>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} variant="secondary" className="flex items-center gap-2">
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </Button>
          )}
        </div>

        <Card className="p-6">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
               <div className="space-y-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <Input
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Instagram Handle</label>
                    <div className="relative">
                      <Instagram className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <Input
                        name="instagram_handle"
                        value={formData.instagram_handle}
                        onChange={handleChange}
                        placeholder="@username"
                         className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">YouTube Handle</label>
                    <div className="relative">
                      <Youtube className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <Input
                        name="youtube_handle"
                        value={formData.youtube_handle}
                        onChange={handleChange}
                        placeholder="@channel"
                         className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                   <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <Input
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                       className="pl-10"
                    />
                   </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Bio</label>
                   <div className="relative">
                    <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      rows={4}
                      className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Tell us about yourself..."
                    />
                   </div>
                </div>
              </div>

              {message && (
                <div className={`p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {message.text}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={() => setIsEditing(false)} className="flex items-center gap-2">
                   <X className="w-4 h-4" /> Cancel
                </Button>
                <Button type="submit" isLoading={saving} className="flex items-center gap-2">
                  <Save className="w-4 h-4" /> Save Changes
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
                <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-2xl uppercase">
                  {formData.full_name ? formData.full_name.charAt(0) : user?.email?.charAt(0)}
                </div>
                <div>
                   <h2 className="text-xl font-bold text-gray-900">{formData.full_name || 'No Name Set'}</h2>
                   <p className="text-gray-500 flex items-center gap-2">
                     <Mail className="w-4 h-4" /> {user?.email}
                   </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <label className="block text-sm font-medium text-gray-500 mb-1">Instagram</label>
                   <div className="flex items-center gap-2 text-gray-900">
                     <Instagram className="w-5 h-5 text-pink-600" />
                     {formData.instagram_handle || <span className="text-gray-400 italic">Not set</span>}
                   </div>
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-500 mb-1">YouTube</label>
                   <div className="flex items-center gap-2 text-gray-900">
                     <Youtube className="w-5 h-5 text-red-600" />
                     {formData.youtube_handle || <span className="text-gray-400 italic">Not set</span>}
                   </div>
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                   <div className="flex items-center gap-2 text-gray-900">
                     <Phone className="w-5 h-5 text-gray-400" />
                     {formData.phone_number || <span className="text-gray-400 italic">Not set</span>}
                   </div>
                </div>
              </div>

              <div>
                 <label className="block text-sm font-medium text-gray-500 mb-2">Bio</label>
                 <div className="bg-gray-50 rounded-lg p-4 text-gray-700 min-h-[100px] whitespace-pre-wrap">
                    {formData.bio || <span className="text-gray-400 italic">No bio provided yet.</span>}
                 </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default InfluencerProfile;
