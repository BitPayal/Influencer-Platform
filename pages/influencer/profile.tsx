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
import { Toast } from '@/components/ui/Toast';

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

  if (loading) return (
    <Layout>
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-pulse flex flex-col items-center">
           <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
           <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    </Layout>
  );

  return (
    <Layout>
      {message && (
        <Toast 
          message={message.text} 
          type={message.type} 
          onClose={() => setMessage(null)} 
        />
      )}
      
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Header / Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-12 mb-6 gap-4">
              <div className="relative">
                <div className="h-24 w-24 sm:h-28 sm:w-28 bg-white rounded-full p-1 shadow-md">
                   <div className="h-full w-full bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold text-3xl sm:text-4xl">
                      {formData.full_name ? formData.full_name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
                   </div>
                </div>
                {!formData.full_name && (
                  <div className="absolute bottom-1 right-1 h-5 w-5 bg-amber-400 border-2 border-white rounded-full" title="Profile Incomplete"></div>
                )}
              </div>
              <div className="flex-1 text-center sm:text-left mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{formData.full_name || 'Anonymous User'}</h1>
                <p className="text-gray-500 font-medium flex items-center justify-center sm:justify-start gap-1.5 mt-1">
                  <Mail className="w-4 h-4" /> {user?.email}
                </p>
              </div>
              {!isEditing && (
                <Button 
                  onClick={() => setIsEditing(true)} 
                  variant="secondary"
                  className="w-full sm:w-auto mt-4 sm:mt-0 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 text-gray-700 hover:text-blue-600 transition-all font-medium"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>

            {isEditing ? (
              <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Identity Section */}
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                     <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <User className="w-4 h-4" /> Identity
                     </h3>
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                       <Input
                         name="full_name"
                         value={formData.full_name}
                         onChange={handleChange}
                         placeholder="e.g. Sarah Jones"
                         required
                         className="bg-white"
                       />
                     </div>
                  </div>
                  
                  {/* Social Section */}
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                     <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Instagram className="w-4 h-4" /> Social Handles
                     </h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                       <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1.5">Instagram</label>
                         <Input
                           name="instagram_handle"
                           value={formData.instagram_handle}
                           onChange={handleChange}
                           placeholder="@username"
                           className="bg-white"
                         />
                       </div>
                       <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1.5">YouTube</label>
                         <Input
                           name="youtube_handle"
                           value={formData.youtube_handle}
                           onChange={handleChange}
                           placeholder="@channel"
                           className="bg-white"
                         />
                       </div>
                     </div>
                  </div>

                  {/* Contact & Bio Section */}
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                     <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Details
                     </h3>
                     <div className="space-y-5">
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                           <Input
                             name="phone_number"
                             value={formData.phone_number}
                             onChange={handleChange}
                             placeholder="+1 (555) 000-0000"
                             className="bg-white"
                           />
                        </div>
                        <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
                         <textarea
                           name="bio"
                           value={formData.bio}
                           onChange={handleChange}
                           rows={4}
                           className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm bg-white"
                           placeholder="Share a brief introduction about yourself..."
                         />
                        </div>
                     </div>
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
                    <Button 
                       type="button" 
                       variant="ghost" 
                       onClick={() => setIsEditing(false)} 
                    >
                       Cancel
                    </Button>
                    <Button 
                       type="submit" 
                       isLoading={saving}
                       className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200"
                    >
                      <Save className="w-4 h-4 mr-2" /> 
                      Save Changes
                    </Button>
                  </div>
                </form>
              </div>
            ) : (
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-500">
                    {/* Bio Section */}
                    <div className="md:col-span-2 space-y-2">
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">About</h3>
                        <div className="bg-gray-50 rounded-xl p-5 text-gray-700 leading-relaxed border border-gray-100">
                            {formData.bio ? (
                                <p>{formData.bio}</p>
                            ) : (
                                <p className="text-gray-400 italic text-sm">No bio added yet. Click &quot;Edit Profile&quot; to introduce yourself.</p>
                            )}
                        </div>
                    </div>

                    {/* Left Column: Socials */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Social Media</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-pink-50 text-pink-600 rounded-lg">
                                        <Instagram className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium">Instagram</p>
                                        <p className="text-sm font-semibold text-gray-900">
                                            {formData.instagram_handle ? (
                                                <span className="text-gray-900">{formData.instagram_handle}</span>
                                            ) : (
                                                <span className="text-gray-400 font-normal italic">Not set</span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                                {formData.instagram_handle && <div className="h-2 w-2 rounded-full bg-green-400"></div>}
                            </div>
                            
                            <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                                        <Youtube className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium">YouTube</p>
                                        <p className="text-sm font-semibold text-gray-900">
                                            {formData.youtube_handle ? (
                                                <span className="text-gray-900">{formData.youtube_handle}</span>
                                            ) : (
                                                <span className="text-gray-400 font-normal italic">Not set</span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                                {formData.youtube_handle && <div className="h-2 w-2 rounded-full bg-green-400"></div>}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Contact */}
                    <div className="space-y-4">
                         <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Private Details</h3>
                         <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm h-full max-h-[160px]"> {/* Matching height roughly */}
                             <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium mb-1">Phone Number</p>
                                    <p className="text-base font-semibold text-gray-900 tracking-wide">
                                        {formData.phone_number || <span className="text-gray-400 font-normal italic text-sm">No phone number</span>}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-2">
                                        Only visible to brands you work with.
                                    </p>
                                </div>
                             </div>
                         </div>
                    </div>
                </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default InfluencerProfile;
