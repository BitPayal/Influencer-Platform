import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Database } from '@/types/supabase';
import { SupabaseClient } from '@supabase/supabase-js';
import { User, Instagram, Youtube, Phone, Save, Edit2, Mail, Shield, Camera } from 'lucide-react';
import { Toast } from '@/components/ui/Toast';

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
    bio: '',
    phone_number: '',
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
            bio: data.bio || '',
            phone_number: data.phone_number || '',
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
          bio: formData.bio,
          phone_number: formData.phone_number,
        })
        .eq('user_id', user.id);

      if (error) throw error;
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const getSmartFallbackName = () => {
    if (user?.email) {
      const namePart = user.email.split('@')[0];
      return namePart.charAt(0).toUpperCase() + namePart.slice(1);
    }
    return 'User';
  };

  const displayName = formData.full_name || getSmartFallbackName();

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
        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
           {/* Banner */}
           <div className="h-32 bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500"></div>
           
           <div className="px-6 pb-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-12 mb-6 gap-4">
                 <div className="relative">
                    <div className="h-24 w-24 sm:h-28 sm:w-28 bg-white rounded-full p-1.5 shadow-md">
                       <div className="h-full w-full bg-purple-50 rounded-full flex items-center justify-center text-purple-600 font-bold text-3xl sm:text-4xl uppercase relative overflow-hidden">
                          {displayName.charAt(0)}
                          <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-transparent"></div>
                       </div>
                    </div>
                    {!formData.full_name && (
                       <div className="absolute bottom-1 right-1 h-5 w-5 bg-amber-400 border-2 border-white rounded-full" title="Profile Incomplete"></div>
                    )}
                 </div>
                 
                 <div className="flex-1 text-center sm:text-left mb-2">
                    <h1 className="text-2xl font-bold text-gray-900">{displayName}</h1>
                    <p className="text-gray-500 font-medium flex items-center justify-center sm:justify-start gap-1.5 mt-1">
                       <Mail className="w-4 h-4" /> {user?.email}
                    </p>
                 </div>

                 {!isEditing && (
                    <Button 
                       onClick={() => setIsEditing(true)} 
                       variant="secondary"
                       className="w-full sm:w-auto mt-4 sm:mt-0 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 text-gray-700 hover:text-purple-600 transition-all font-medium"
                    >
                       <Edit2 className="w-4 h-4 mr-2" />
                       Edit Profile
                    </Button>
                 )}
              </div>

              {isEditing ? (
                 <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <form onSubmit={handleSubmit} className="space-y-8">
                       <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                             <User className="w-4 h-4" /> Personal Details
                          </h3>
                          <div className="space-y-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                                <Input
                                   name="full_name"
                                   value={formData.full_name}
                                   onChange={handleChange}
                                   placeholder="Enter your full name"
                                   className="bg-white"
                                />
                             </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
                                <textarea
                                   name="bio"
                                   value={formData.bio}
                                   onChange={handleChange}
                                   rows={3}
                                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white resize-none"
                                   placeholder="Tell brands about yourself..."
                                />
                             </div>
                          </div>
                       </div>

                       <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                             <Camera className="w-4 h-4" /> Social Media
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Instagram Handle</label>
                                <div className="relative">
                                   <Instagram className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                   <Input
                                      name="instagram_handle"
                                      value={formData.instagram_handle}
                                      onChange={handleChange}
                                      placeholder="@username"
                                      className="bg-white pl-9"
                                   />
                                </div>
                             </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">YouTube Handle</label>
                                <div className="relative">
                                   <Youtube className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                   <Input
                                      name="youtube_handle"
                                      value={formData.youtube_handle}
                                      onChange={handleChange}
                                      placeholder="@channel"
                                      className="bg-white pl-9"
                                   />
                                </div>
                             </div>
                          </div>
                       </div>

                       <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                             <Shield className="w-4 h-4" /> Private Info
                          </h3>
                          <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                             <div className="relative">
                                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <Input
                                   name="phone_number"
                                   value={formData.phone_number}
                                   onChange={handleChange}
                                   placeholder="Your contact number"
                                   className="bg-white pl-9"
                                />
                             </div>
                             <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                                <Shield className="w-3 h-3" /> Only visible to brands you work with.
                             </p>
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
                             className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-200"
                          >
                             <Save className="w-4 h-4 mr-2" /> 
                             Save Changes
                          </Button>
                       </div>
                    </form>
                 </div>
              ) : (
                 <div className="mt-8 space-y-8 animate-in fade-in duration-500">
                    {/* About Section */}
                    <div>
                       <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">About</h3>
                       <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                          {formData.bio ? (
                             <p className="text-gray-700 leading-relaxed">{formData.bio}</p>
                          ) : (
                             <p className="text-gray-400 italic text-sm">No bio added yet. Click &quot;Edit Profile&quot; to introduce yourself.</p>
                          )}
                       </div>
                    </div>

                    {/* Social Media Section */}
                    <div>
                       <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Social Media</h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <a 
                             href={formData.instagram_handle ? `https://instagram.com/${formData.instagram_handle.replace('@', '')}` : '#'}
                             target={formData.instagram_handle ? "_blank" : "_self"}
                             rel="noopener noreferrer"
                             className={`group p-4 rounded-xl border transition-all duration-200 ${
                                formData.instagram_handle 
                                   ? 'bg-gradient-to-br from-pink-50 to-rose-50 border-pink-100 hover:shadow-md hover:border-pink-200 cursor-pointer' 
                                   : 'bg-gray-50 border-gray-100'
                             }`}
                          >
                             <div className="flex items-center gap-4">
                                <div className={`p-2.5 rounded-lg ${formData.instagram_handle ? 'bg-white text-pink-600 shadow-sm' : 'bg-gray-200 text-gray-400'}`}>
                                   <Instagram className="w-6 h-6" />
                                </div>
                                <div>
                                   <p className={`text-xs font-semibold uppercase tracking-wide ${formData.instagram_handle ? 'text-pink-600' : 'text-gray-400'}`}>Instagram</p>
                                   <p className={`font-medium ${formData.instagram_handle ? 'text-gray-900 group-hover:text-pink-700' : 'text-gray-400 italic'}`}>
                                      {formData.instagram_handle || 'Not connected'}
                                   </p>
                                </div>
                             </div>
                          </a>

                          <a 
                             href={formData.youtube_handle ? `https://youtube.com/${formData.youtube_handle.replace('@', '')}` : '#'}
                             target={formData.youtube_handle ? "_blank" : "_self"}
                             rel="noopener noreferrer"
                             className={`group p-4 rounded-xl border transition-all duration-200 ${
                                formData.youtube_handle 
                                   ? 'bg-gradient-to-br from-red-50 to-orange-50 border-red-100 hover:shadow-md hover:border-red-200 cursor-pointer' 
                                   : 'bg-gray-50 border-gray-100'
                             }`}
                          >
                             <div className="flex items-center gap-4">
                                <div className={`p-2.5 rounded-lg ${formData.youtube_handle ? 'bg-white text-red-600 shadow-sm' : 'bg-gray-200 text-gray-400'}`}>
                                   <Youtube className="w-6 h-6" />
                                </div>
                                <div>
                                   <p className={`text-xs font-semibold uppercase tracking-wide ${formData.youtube_handle ? 'text-red-600' : 'text-gray-400'}`}>YouTube</p>
                                   <p className={`font-medium ${formData.youtube_handle ? 'text-gray-900 group-hover:text-red-700' : 'text-gray-400 italic'}`}>
                                      {formData.youtube_handle || 'Not connected'}
                                   </p>
                                </div>
                             </div>
                          </a>
                       </div>
                    </div>

                    {/* Private Details Section */}
                    <div>
                       <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <Shield className="w-3 h-3" /> Private Details
                       </h3>
                       <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-1">
                          <div className="bg-slate-50 rounded-lg p-4 flex items-start gap-4">
                             <div className="p-2.5 bg-blue-100 text-blue-600 rounded-lg">
                                <Phone className="w-5 h-5" />
                             </div>
                             <div>
                                <p className="text-sm font-semibold text-gray-900">Phone Number</p>
                                <p className="text-gray-600 font-medium mt-0.5">
                                   {formData.phone_number || <span className="text-gray-400 italic font-normal">No phone number added</span>}
                                </p>
                                <p className="text-xs text-slate-500 mt-2">
                                   This information is only visible to brands you explicitly accept campaigns from.
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
