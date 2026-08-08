import { useEffect, useState } from 'react';
import { QrCode, Calendar, Utensils, Phone, MapPin, Loader2, Plus, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type { SubscriptionWithHostel } from '@/types';

interface DashboardPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export default function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { user, profile, loading: authLoading } = useAuth();
  const [subscriptions, setSubscriptions] = useState<SubscriptionWithHostel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from('subscriptions').select('*, hostels(*)').eq('user_id', user.id).order('created_at', { ascending: false });
      setSubscriptions((data as SubscriptionWithHostel[]) ?? []);
      setLoading(false);
    })();
  }, [user]);

  if (authLoading) {
    return <div className="min-h-screen pt-20 flex items-center justify-center"><Loader2 className="w-8 h-8 text-primary-500 animate-spin" /></div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4"><QrCode className="w-8 h-8 text-primary-600" /></div>
          <h2 className="font-display font-bold text-xl text-neutral-900 mb-2">Sign in required</h2>
          <p className="text-neutral-500 mb-6">Sign in to view your digital mess cards and subscriptions.</p>
          <button onClick={() => onNavigate('auth')} className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors">Sign In</button>
        </div>
      </div>
    );
  }

  const activeSubs = subscriptions.filter((s) => s.status === 'Active');
  const totalSpent = subscriptions.reduce((sum, s) => sum + Number(s.amount_paid), 0);

  const daysRemaining = (endDate: string) => {
    const diff = new Date(endDate).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  return (
    <div className="min-h-screen pt-20 pb-12 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-neutral-900 mb-2">My Mess Card</h1>
            <p className="text-neutral-600">Welcome back, {profile?.full_name || 'Student'}.</p>
          </div>
          <button onClick={() => onNavigate('browse')} className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-primary-500/30 transition-all">
            <Plus className="w-4 h-4" /> New Subscription
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-neutral-200">
            <div className="flex items-center gap-3 mb-2"><div className="w-10 h-10 rounded-xl bg-success-100 flex items-center justify-center"><QrCode className="w-5 h-5 text-success-600" /></div><span className="text-sm text-neutral-500">Active Cards</span></div>
            <p className="text-3xl font-display font-bold text-neutral-900">{activeSubs.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-neutral-200">
            <div className="flex items-center gap-3 mb-2"><div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-primary-600" /></div><span className="text-sm text-neutral-500">Total Spent</span></div>
            <p className="text-3xl font-display font-bold text-neutral-900">₹{totalSpent.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-neutral-200">
            <div className="flex items-center gap-3 mb-2"><div className="w-10 h-10 rounded-xl bg-secondary-100 flex items-center justify-center"><Utensils className="w-5 h-5 text-secondary-600" /></div><span className="text-sm text-neutral-500">Total Subscriptions</span></div>
            <p className="text-3xl font-display font-bold text-neutral-900">{subscriptions.length}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-primary-500 animate-spin" /></div>
        ) : subscriptions.length === 0 ? (
          <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-6"><QrCode className="w-10 h-10 text-neutral-400" /></div>
            <h3 className="font-display font-bold text-xl text-neutral-900 mb-2">No mess cards yet</h3>
            <p className="text-neutral-500 mb-6 max-w-md mx-auto">You haven't subscribed to any mess yet. Browse hostels and PGs near you and get your first digital mess card.</p>
            <button onClick={() => onNavigate('browse')} className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-primary-500/30 transition-all"><Utensils className="w-4 h-4" /> Browse Mess</button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-6">
            {subscriptions.map((sub) => {
              const hostel = sub.hostels;
              const daysLeft = daysRemaining(sub.end_date);
              const totalDays = 30;
              const progress = ((totalDays - daysLeft) / totalDays) * 100;
              const isActive = sub.status === 'Active' && daysLeft > 0;
              return (
                <div key={sub.id} className="bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-lg transition-all">
                  <div className={`p-5 ${isActive ? 'bg-gradient-to-br from-primary-600 to-primary-700' : 'bg-gradient-to-br from-neutral-500 to-neutral-600'} text-white`}>
                    <div className="flex items-start justify-between mb-4">
                      <div><p className="text-xs uppercase tracking-wide opacity-80">MessCard</p><p className="font-display font-bold text-lg">{hostel?.name ?? 'Unknown Hostel'}</p>
                        {hostel && <p className="text-xs opacity-80 flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" /> {hostel.area}, {hostel.city}</p>}
                      </div>
                      <QrCode className="w-10 h-10 opacity-80" />
                    </div>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between"><span className="opacity-80">Subscriber</span><span className="font-semibold">{sub.subscriber_name}</span></div>
                      <div className="flex justify-between"><span className="opacity-80">Plan</span><span className="font-semibold">{sub.plan_type}</span></div>
                      <div className="flex justify-between"><span className="opacity-80">Card ID</span><span className="font-mono text-xs">{sub.id.slice(0, 8).toUpperCase()}</span></div>
                      <div className="flex justify-between"><span className="opacity-80">Payment</span><span className={`font-semibold ${sub.payment_status === 'paid' ? 'text-success-300' : 'text-accent-300'}`}>{sub.payment_status === 'paid' ? 'Paid' : 'Pending'}</span></div>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${isActive ? 'bg-success-50 text-success-700' : 'bg-neutral-100 text-neutral-500'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-success-500' : 'bg-neutral-400'}`} />{isActive ? 'Active' : sub.status === 'Cancelled' ? 'Cancelled' : 'Expired'}
                      </span>
                      <span className="text-xs text-neutral-500 flex items-center gap-1"><Clock className="w-3 h-3" />{isActive ? `${daysLeft} days left` : 'Ended'}</span>
                    </div>
                    <div className="w-full bg-neutral-100 rounded-full h-2 mb-4">
                      <div className={`h-full rounded-full transition-all ${isActive ? 'bg-primary-500' : 'bg-neutral-400'}`} style={{ width: `${progress}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1.5 text-neutral-600"><Calendar className="w-3.5 h-3.5" /><span>Started {new Date(sub.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span></div>
                      <div className="flex items-center gap-1.5 text-neutral-600"><Calendar className="w-3.5 h-3.5" /><span>Ends {new Date(sub.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span></div>
                    </div>
                    {hostel && (
                      <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-sm text-neutral-600"><Phone className="w-3.5 h-3.5" />{hostel.contact_phone}</div>
                        <span className="font-display font-bold text-neutral-900">₹{Number(sub.amount_paid).toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    {sub.payment_status === 'pending' && isActive && (
                      <div className="mt-3 flex items-center gap-2 bg-warning-50 text-warning-700 px-3 py-2 rounded-lg text-xs">
                        <AlertCircle className="w-3.5 h-3.5" /> Payment pending — pay at the mess counter
                      </div>
                    )}
                    {isActive && hostel && (
                      <button onClick={() => onNavigate('detail', { id: hostel.id })} className="w-full mt-4 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 py-2.5 rounded-xl text-sm font-medium transition-colors">View Menu</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
