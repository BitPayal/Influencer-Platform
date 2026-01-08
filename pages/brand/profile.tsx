import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Database } from '@/types/supabase';
import { SupabaseClient } from '@supabase/supabase-js';
import { Building2, Globe, Briefcase, User, Phone, Edit2, Save, X, Mail } from 'lucide-react';

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

  if (loading) return <Layout><div>Loading...</div></Layout>;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Company Profile</h1>
            <p className="text-gray-600">Manage your company information.</p>
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
                   <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                   <div className="relative">
                      <Building2 className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <Input
                        name="company_name"
                        value={formData.company_name}
                        onChange={handleChange}
                        placeholder="Enter company name"
                        required
                        className="pl-10"
                      />
                   </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                     <div className="relative">
                        <Globe className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        <Input
                          name="website"
                          value={formData.website}
                          onChange={handleChange}
                          placeholder="https://example.com"
                          className="pl-10"
                        />
                     </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                     <div className="relative">
                        <Briefcase className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        <Input
                          name="industry"
                          value={formData.industry}
                          onChange={handleChange}
                          placeholder="e.g. Technology, Retail"
                          className="pl-10"
                        />
                     </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                     <div className="relative">
                        <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        <Input
                          name="contact_person"
                          value={formData.contact_person}
                          onChange={handleChange}
                          placeholder="Name of contact person"
                          className="pl-10"
                        />
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
                          placeholder="Contact number"
                          className="pl-10"
                        />
                     </div>
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
                  {formData.company_name ? formData.company_name.charAt(0) : <Building2 className="w-8 h-8" />}
                </div>
                <div>
                   <h2 className="text-xl font-bold text-gray-900">{formData.company_name || 'Company Name Not Set'}</h2>
                   <p className="text-gray-500 flex items-center gap-2">
                     <Mail className="w-4 h-4" /> {user?.email}
                   </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <label className="block text-sm font-medium text-gray-500 mb-1">Website</label>
                   <div className="flex items-center gap-2 text-gray-900">
                     <Globe className="w-5 h-5 text-blue-600" />
                     {formData.website ? (
                        <a href={formData.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {formData.website}
                        </a>
                     ) : (
                        <span className="text-gray-400 italic">Not set</span>
                     )}
                   </div>
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-500 mb-1">Industry</label>
                   <div className="flex items-center gap-2 text-gray-900">
                     <Briefcase className="w-5 h-5 text-gray-400" />
                     {formData.industry || <span className="text-gray-400 italic">Not set</span>}
                   </div>
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-500 mb-1">Contact Person</label>
                   <div className="flex items-center gap-2 text-gray-900">
                     <User className="w-5 h-5 text-gray-400" />
                     {formData.contact_person || <span className="text-gray-400 italic">Not set</span>}
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
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default BrandProfile;
