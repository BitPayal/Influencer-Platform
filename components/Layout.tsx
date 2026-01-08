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
import { UserMenu } from './UserMenu';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, signOut, loading: authLoading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [profileName, setProfileName] = React.useState<string | null>(null);
  // Initialize as false, let useEffect and authLoading trigger the loading states
  const [isProfileLoading, setIsProfileLoading] = React.useState(false);

  React.useEffect(() => {
    const fetchProfileName = async () => {
      // If still loading auth, don't do anything yet
      if (authLoading) return;

      if (!user) {
        setIsProfileLoading(false);
        return;
      }
      
      setIsProfileLoading(true);
      console.log("Layout: Fetching profile for user:", user.id, "Role:", user.role);

      try {
        if (user.role === 'marketing') {
           // ... (existing brand fetch) ...
           const { data, error } = await supabase
            .from('brands')
            .select('company_name')
            .eq('user_id', user.id)
            .maybeSingle();

            if (data) setProfileName((data as any).company_name);
        } else if (user.role === 'influencer') {
           // ... (existing influencer fetch) ...
           const { data, error } = await supabase
            .from('influencers')
            .select('full_name')
            .eq('user_id', user.id)
            .maybeSingle();

            if (data) setProfileName((data as any).full_name);
        }
      } catch (error) {
        console.error("Error fetching profile name:", error);
      } finally {
        setIsProfileLoading(false);
      }
    };

    fetchProfileName();
  }, [user, authLoading]);

  // ... (rest of code) ...

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
