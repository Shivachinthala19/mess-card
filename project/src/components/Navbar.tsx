import { useEffect, useState } from 'react';
import { Utensils, Home, Search, QrCode, Building2, Menu as MenuIcon, X, LogOut, User } from 'lucide-react';
import { useAuth } from '@/lib/auth';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, profile, signOut } = useAuth();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const isOwner = profile?.role === 'owner';

  const links = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'browse', label: 'Browse Mess', icon: Search },
    ...(user ? [{ id: 'dashboard', label: 'My Mess Card', icon: QrCode }] : []),
    ...(isOwner ? [{ id: 'owner', label: 'Owner Portal', icon: Building2 }] : []),
  ];

  const handleNav = (page: string) => {
    onNavigate(page);
    setMobileOpen(false);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-white/80 backdrop-blur-sm'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button onClick={() => handleNav('home')} className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30 group-hover:scale-105 transition-transform">
              <Utensils className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-display font-bold text-lg text-neutral-900">MessCard</span>
          </button>

          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              const Icon = link.icon;
              const active = currentPage === link.id;
              return (
                <button key={link.id} onClick={() => handleNav(link.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${active ? 'bg-primary-50 text-primary-700' : 'text-neutral-600 hover:text-primary-600 hover:bg-neutral-50'}`}>
                  <Icon className="w-4 h-4" />{link.label}
                </button>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-50">
                  <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-600" />
                  </div>
                  <span className="text-sm font-medium text-neutral-700 max-w-[100px] truncate">{profile?.full_name || 'User'}</span>
                </div>
                <button onClick={signOut} className="p-2 rounded-lg text-neutral-500 hover:text-error-500 hover:bg-error-50 transition-colors" title="Sign out">
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button onClick={() => handleNav('auth')} className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-colors">
                Sign In
              </button>
            )}
          </div>

          <div className="md:hidden">
            <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg text-neutral-700 hover:bg-neutral-100">
              {mobileOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden pb-4 animate-fade-in">
            <div className="flex flex-col gap-1">
              {links.map((link) => {
                const Icon = link.icon;
                const active = currentPage === link.id;
                return (
                  <button key={link.id} onClick={() => handleNav(link.id)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${active ? 'bg-primary-50 text-primary-700' : 'text-neutral-600 hover:bg-neutral-50'}`}>
                    <Icon className="w-4 h-4" />{link.label}
                  </button>
                );
              })}
              {user ? (
                <button onClick={() => { signOut(); setMobileOpen(false); }} className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-error-600 hover:bg-error-50">
                  <LogOut className="w-4 h-4" />Sign Out
                </button>
              ) : (
                <button onClick={() => handleNav('auth')} className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-primary-600 hover:bg-primary-50">
                  Sign In
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
