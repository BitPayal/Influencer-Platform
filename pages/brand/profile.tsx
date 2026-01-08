import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Database } from '@/types/supabase';
import { SupabaseClient } from '@supabase/supabase-js';
import { Building2, Globe, Briefcase, User, Phone, Edit2, Save, Mail, Calendar } from 'lucide-react';
import { Toast } from '@/components/ui/Toast';

// Create a typed client. Since the global instance is untyped, we cast it here for this file.
// Alternatively, we could update lib/supabase.ts, but that might affect other files.
const typedSupabase = supabase as unknown as SupabaseClient<Database>;

interface BrandProfile {
  company_name: string | null;
  website: string | null;
  industry: string | null;
  contact_person: string | null;
  phone_number: string | null;
}

const BrandProfile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    website: '',
    industry: '',
    contact_person: '',
    phone_number: '',
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const { data, error } = await typedSupabase
          .from('brands')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          const brandData = data;
          setFormData({
            company_name: brandData.company_name || '',
            website: brandData.website || '',
            industry: brandData.industry || '',
            contact_person: brandData.contact_person || '',
            phone_number: brandData.phone_number || '',
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        .from('brands')
        .update({
          company_name: formData.company_name,
          website: formData.website,
          industry: formData.industry,
          contact_person: formData.contact_person,
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
                   <div className="h-full w-full bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold text-3xl sm:text-4xl uppercase">
                      {formData.company_name ? formData.company_name.charAt(0) : <Building2 className="w-8 h-8" />}
                   </div>
                </div>
                {!formData.company_name && (
                  <div className="absolute bottom-1 right-1 h-5 w-5 bg-amber-400 border-2 border-white rounded-full" title="Profile Incomplete"></div>
                )}
              </div>
              <div className="flex-1 text-center sm:text-left mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{formData.company_name || 'Anonymous Brand'}</h1>
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
                        <Building2 className="w-4 h-4" /> Company Details
                     </h3>
                     <div className="space-y-4">
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1.5">Company Name *</label>
                           <Input
                             name="company_name"
                             value={formData.company_name}
                             onChange={handleChange}
                             placeholder="Enter company name"
                             required
                             className="bg-white"
                           />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                               <label className="block text-sm font-medium text-gray-700 mb-1.5">Website</label>
                               <div className="relative">
                                    <Globe className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                    <Input
                                      name="website"
                                      value={formData.website}
                                      onChange={handleChange}
                                      placeholder="https://example.com"
                                      className="bg-white pl-9"
                                    />
                               </div>
                            </div>
                            <div>
                               <label className="block text-sm font-medium text-gray-700 mb-1.5">Industry</label>
                               <Input
                                 name="industry"
                                 value={formData.industry}
                                 onChange={handleChange}
                                 placeholder="e.g. Technology, Retail"
                                 className="bg-white"
                               />
                            </div>
                        </div>
                     </div>
                  </div>
                  
                  {/* Contact Section */}
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                     <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Phone className="w-4 h-4" /> Contact Information
                     </h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                       <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact Person</label>
                         <Input
                           name="contact_person"
                           value={formData.contact_person}
                           onChange={handleChange}
                           placeholder="Name of contact person"
                           className="bg-white"
                         />
                       </div>
                       <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                         <Input
                           name="phone_number"
                           value={formData.phone_number}
                           onChange={handleChange}
                           placeholder="Contact number"
                           className="bg-white"
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
                    {/* General Details */}
                    <div className="md:col-span-2 space-y-2">
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Overview</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-center gap-4">
                                <div className="p-3 bg-white rounded-lg shadow-sm text-blue-600">
                                    <Globe className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Website</p>
                                    <p className="text-sm font-semibold text-gray-900 truncate max-w-[200px]">
                                        {formData.website ? (
                                             <a href={formData.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                {formData.website}
                                              </a>
                                        ) : <span className="text-gray-400 italic font-normal">Not set</span>}
                                    </p>
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-center gap-4">
                                <div className="p-3 bg-white rounded-lg shadow-sm text-indigo-600">
                                    <Briefcase className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Industry</p>
                                    <p className="text-sm font-semibold text-gray-900">
                                        {formData.industry || <span className="text-gray-400 italic font-normal">Not set</span>}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Details */}
                    <div className="md:col-span-2 space-y-2">
                         <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Contact Details</h3>
                         <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium">Contact Person</p>
                                        <p className="text-sm font-semibold text-gray-900">
                                            {formData.contact_person || <span className="text-gray-400 italic font-normal">Not set</span>}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium">Phone</p>
                                        <p className="text-sm font-semibold text-gray-900">
                                            {formData.phone_number || <span className="text-gray-400 italic font-normal">Not set</span>}
                                        </p>
                                    </div>
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

export default BrandProfile;
