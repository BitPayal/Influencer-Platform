import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  ClipboardList,
  LayoutDashboard,
  Users,
  Video,
  DollarSign,
  FileText,
  LogOut,
  Menu,
  X,
  MessageSquare,
} from 'lucide-react';
import { Button } from './ui/Button';
import { UserMenu } from './UserMenu';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, signOut, loading: authLoading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [profileName, setProfileName] = React.useState<string | null>(null);
  const [isProfileLoading, setIsProfileLoading] = React.useState(false);
  const [approvalStatus, setApprovalStatus] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchProfileName = async () => {
      // If authenticating, wait.
      if (authLoading) return;

      if (!user) {
        setIsProfileLoading(false);
        return;
      }
      
      setIsProfileLoading(true);
      console.log("Layout: Fetching profile for user:", user.id, "Role:", user.role);

      try {
        if (user.role === 'influencer') {
           const { data, error } = await supabase
            .from('influencers')
            .select('full_name, approval_status')
            .eq('user_id', user.id)
            .maybeSingle();

            if (error) {
              console.error('Error fetching influencer profile:', error);
            } else if (data) {
              setProfileName((data as any).full_name);
              setApprovalStatus((data as any).approval_status);
            }
        }
      } catch (error) {
        console.error("Error fetching profile name:", error);
      } finally {
        setIsProfileLoading(false);
      }
    };

    fetchProfileName();
  }, [user, authLoading]);

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

  // Filter items for unapproved influencers
  const filteredInfluencerNavItems = (user?.role === 'influencer' && approvalStatus !== 'approved')
    ? influencerNavItems.filter(item => item.name === 'Dashboard')
    : influencerNavItems;

  const adminNavItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Applications', href: '/admin/applications', icon: ClipboardList }, // Added Link
    { name: 'Influencers', href: '/admin/influencers', icon: Users },
    { name: 'Projects', href: '/admin/projects', icon: FileText },
    { name: 'Tasks', href: '/admin/tasks', icon: FileText },
    { name: 'Assign Tasks', href: '/admin/task-assignments', icon: Users },
    { name: 'Videos', href: '/admin/videos', icon: Video },
    { name: 'Payments', href: '/admin/payments', icon: DollarSign },
    { name: 'Messages', href: '/messages', icon: MessageSquare },
  ];

  const navItems = user?.role === 'admin' ? adminNavItems : filteredInfluencerNavItems;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 sm:h-16 items-center">
            {/* Left Side: Hamburger & Brand */}
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 -ml-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:ring-2 focus:ring-inset focus:ring-primary-500"
              >
                <span className="sr-only">Open menu</span>
                {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-primary-600 truncate leading-tight">
                  <span className="block sm:hidden">Cehpoint</span>
                  <span className="hidden sm:block">Cehpoint Influence Partners</span>
                </h1>
              </div>
            </div>

            {/* Right Side: User Menu */}
            <div className="flex items-center">
              <UserMenu 
                user={user} 
                profileName={profileName} 
                onSignOut={handleSignOut} 
                isLoading={authLoading || isProfileLoading}
              />
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
