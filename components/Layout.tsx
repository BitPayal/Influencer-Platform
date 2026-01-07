import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  LayoutDashboard,
  Users,
  Video,
  DollarSign,
  FileText,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { Button } from './ui/Button';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [profileName, setProfileName] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchProfileName = async () => {
      if (!user) return;
      
      console.log("Layout: Fetching profile for user:", user.id, "Role:", user.role);

      try {
        if (user.role === 'marketing') {
           console.log("Layout: Attempting to fetch brand profile...");
           const { data, error } = await supabase
            .from('brands')
            .select('company_name')
            .eq('user_id', user.id)
            .maybeSingle();

            console.log("Layout: Brand fetch result:", { data, error });

            if (error) {
              console.error('Error fetching brand profile:', error);
            } else if (data) {
              console.log("Layout: Setting profile name to:", (data as any).company_name);
              setProfileName((data as any).company_name);
            } else {
                console.warn("Layout: No brand profile found for user");
            }
        } else if (user.role === 'influencer') {
           console.log("Layout: Attempting to fetch influencer profile...");
           const { data, error } = await supabase
            .from('influencers')
            .select('full_name')
            .eq('user_id', user.id)
            .maybeSingle();

            console.log("Layout: Influencer fetch result:", { data, error });

            if (error) {
              console.error('Error fetching influencer profile:', error);
            } else if (data) {
              console.log("Layout: Setting profile name to:", (data as any).full_name);
              setProfileName((data as any).full_name);
            } else {
                console.warn("Layout: No influencer profile found for user");
            }
        } else {
            console.log("Layout: User role not recognized for profile fetch:", user.role);
        }
      } catch (error) {
        console.error("Error fetching profile name:", error);
      }
    };

    fetchProfileName();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const influencerNavItems = [
    { name: 'Dashboard', href: '/influencer/dashboard', icon: LayoutDashboard },
    { name: 'My Tasks', href: '/influencer/tasks', icon: FileText },
    { name: 'Videos', href: '/influencer/videos', icon: Video },
    { name: 'Revenue', href: '/influencer/revenue', icon: DollarSign },
    { name: 'Guidebook', href: '/influencer/guidebook', icon: FileText },
    { name: 'Messages', href: '/messages', icon: FileText },
  ];

  const adminNavItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Influencers', href: '/admin/influencers', icon: Users },
    { name: 'Projects', href: '/admin/projects', icon: FileText },
    { name: 'Tasks', href: '/admin/tasks', icon: FileText },
    { name: 'Assign Tasks', href: '/admin/task-assignments', icon: Users },
    { name: 'Videos', href: '/admin/videos', icon: Video },
    { name: 'Payments', href: '/admin/payments', icon: DollarSign },
  ];

  const marketingNavItems = [
    { name: 'Dashboard', href: '/brand/dashboard', icon: LayoutDashboard },
    { name: 'My Campaigns', href: '/brand/campaigns', icon: FileText },
    { name: 'Create Campaign', href: '/brand/create-campaign', icon: FileText },
    { name: 'Find Influencers', href: '/brand/search', icon: Users },
    { name: 'Messages', href: '/messages', icon: FileText }, // basic icon for now
  ];

  const navItems = user?.role === 'admin' ? adminNavItems : user?.role === 'marketing' ? marketingNavItems : influencerNavItems;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              <h1 className="text-xl font-bold text-primary-600 ml-2 lg:ml-0">
                Cehpoint Influence Partners
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700 font-medium">
                {profileName || user?.email}
              </span>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex pt-16">
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out pt-16 lg:pt-0`}
        >
          <div className="h-full overflow-y-auto py-6">
            <nav className="space-y-1 px-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = router.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-20 pt-16"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
