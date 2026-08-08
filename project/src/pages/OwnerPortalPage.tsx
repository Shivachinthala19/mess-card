import { useEffect, useState, useCallback } from 'react';
import {
  Building2, Plus, Loader2, Utensils, Users, TrendingUp, Star, MapPin, Phone,
  Edit3, Trash2, Save, X, Calendar, DollarSign, CheckCircle2, AlertCircle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type { Hostel, WeeklyMenu, Subscription } from '@/types';
import { DAYS_OF_WEEK, MEAL_TYPES, AMENITY_OPTIONS, FOOD_TYPE_OPTIONS } from '@/types';

type SubscriptionWithSubscriber = Subscription & { profiles?: { full_name: string; phone: string } | null };

interface OwnerPortalPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export default function OwnerPortalPage({ onNavigate }: OwnerPortalPageProps) {
  const { user, profile, loading: authLoading } = useAuth();
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [selectedHostelId, setSelectedHostelId] = useState<string | null>(null);
  const [menus, setMenus] = useState<WeeklyMenu[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionWithSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHostelForm, setShowHostelForm] = useState(false);
  const [editingMenu, setEditingMenu] = useState<{ day: number; meal: string } | null>(null);
  const [menuValue, setMenuValue] = useState('');
  const [menuSaving, setMenuSaving] = useState(false);

  // Hostel form state
  const [form, setForm] = useState({
    name: '', description: '', area: '', city: '', address: '',
    monthly_price: '3500', commission_rate: '10', total_capacity: '50',
    contact_phone: '', image_url: '', food_type: 'Veg & Non-Veg',
    amenities: [] as string[],
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const loadHostels = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from('hostels').select('*').eq('owner_id', user.id).order('created_at', { ascending: false });
    setHostels(data ?? []);
    if (data && data.length > 0 && !selectedHostelId) setSelectedHostelId(data[0].id);
    setLoading(false);
  }, [user, selectedHostelId]);

  useEffect(() => { loadHostels(); }, [loadHostels]);

  useEffect(() => {
    if (!selectedHostelId) return;
    (async () => {
      const [{ data: m }, { data: subs }] = await Promise.all([
        supabase.from('weekly_menus').select('*').eq('hostel_id', selectedHostelId).order('day_of_week'),
        supabase.from('subscriptions').select('*, profiles(full_name, phone)').eq('hostel_id', selectedHostelId).order('created_at', { ascending: false }),
      ]);
      setMenus(m ?? []);
      setSubscriptions(subs as SubscriptionWithSubscriber[] ?? []);
    })();
  }, [selectedHostelId]);

  const selectedHostel = hostels.find((h) => h.id === selectedHostelId);
  const totalEarnings = subscriptions.reduce((sum, s) => sum + Number(s.amount_paid), 0);
  const commissionEarnings = subscriptions.reduce((sum, s) => {
    const rate = (selectedHostel?.commission_rate ?? 10) / 100;
    return sum + Number(s.amount_paid) * (1 - rate);
  }, 0);

  const handleCreateHostel = async () => {
    if (!user) return;
    if (!form.name.trim() || !form.area.trim() || !form.city.trim() || !form.contact_phone.trim()) {
      setFormError('Please fill in all required fields');
      return;
    }
    setFormSubmitting(true);
    setFormError(null);

    const { data, error } = await supabase.from('hostels').insert({
      owner_id: user.id,
      name: form.name.trim(),
      description: form.description.trim(),
      area: form.area.trim(),
      city: form.city.trim(),
      address: form.address.trim(),
      monthly_price: parseFloat(form.monthly_price) || 0,
      commission_rate: parseFloat(form.commission_rate) || 10,
      total_capacity: parseInt(form.total_capacity) || 0,
      filled_capacity: 0,
      contact_phone: form.contact_phone.trim(),
      image_url: form.image_url.trim() || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      food_type: form.food_type,
      amenities: form.amenities,
      rating: 0,
      is_active: true,
    }).select().maybeSingle();

    if (data && !error) {
      setHostels([data as Hostel, ...hostels]);
      setSelectedHostelId((data as Hostel).id);
      setShowHostelForm(false);
      setForm({ name: '', description: '', area: '', city: '', address: '', monthly_price: '3500', commission_rate: '10', total_capacity: '50', contact_phone: '', image_url: '', food_type: 'Veg & Non-Veg', amenities: [] });
    } else {
      setFormError(error?.message ?? 'Failed to create hostel');
    }
    setFormSubmitting(false);
  };

  const handleSaveMenu = async (day: number, meal: string) => {
    if (!selectedHostelId) return;
    setMenuSaving(true);
    const existing = menus.find((m) => m.day_of_week === day && m.meal_type === meal);
    if (existing) {
      const { data } = await supabase.from('weekly_menus').update({ menu_items: menuValue }).eq('id', existing.id).select().maybeSingle();
      if (data) setMenus(menus.map((m) => (m.id === data.id ? data as WeeklyMenu : m)));
    } else {
      const { data } = await supabase.from('weekly_menus').insert({
        hostel_id: selectedHostelId,
        day_of_week: day,
        meal_type: meal as WeeklyMenu['meal_type'],
        menu_items: menuValue,
      }).select().maybeSingle();
      if (data) setMenus([...menus, data as WeeklyMenu]);
    }
    setEditingMenu(null);
    setMenuSaving(false);
  };

  const startEditMenu = (day: number, meal: string) => {
    const existing = menus.find((m) => m.day_of_week === day && m.meal_type === meal);
    setMenuValue(existing?.menu_items ?? '');
    setEditingMenu({ day, meal });
  };

  const toggleAmenity = (a: string) => {
    setForm((f) => ({ ...f, amenities: f.amenities.includes(a) ? f.amenities.filter((x) => x !== a) : [...f.amenities, a] }));
  };

  if (authLoading) {
    return <div className="min-h-screen pt-20 flex items-center justify-center"><Loader2 className="w-8 h-8 text-primary-500 animate-spin" /></div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4"><Building2 className="w-8 h-8 text-primary-600" /></div>
          <h2 className="font-display font-bold text-xl text-neutral-900 mb-2">Sign in required</h2>
          <p className="text-neutral-500 mb-6">Sign in as a hostel owner to manage your mess.</p>
          <button onClick={() => onNavigate('auth')} className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors">Sign In</button>
        </div>
      </div>
    );
  }

  if (profile?.role !== 'owner') {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-warning-100 flex items-center justify-center mx-auto mb-4"><AlertCircle className="w-8 h-8 text-warning-600" /></div>
          <h2 className="font-display font-bold text-xl text-neutral-900 mb-2">Owner access required</h2>
          <p className="text-neutral-500 mb-6">Your account is registered as a student. Sign up with a hostel owner account to access this page.</p>
          <button onClick={() => onNavigate('home')} className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors">Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-neutral-900 mb-2">Owner Portal</h1>
            <p className="text-neutral-600">Manage your hostels, menus, and subscribers.</p>
          </div>
          <button onClick={() => setShowHostelForm(true)} className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-primary-500/30 transition-all">
            <Plus className="w-4 h-4" /> Register Hostel
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-primary-500 animate-spin" /></div>
        ) : hostels.length === 0 ? (
          <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-6"><Building2 className="w-10 h-10 text-neutral-400" /></div>
            <h3 className="font-display font-bold text-xl text-neutral-900 mb-2">No hostels registered yet</h3>
            <p className="text-neutral-500 mb-6 max-w-md mx-auto">Register your hostel or PG to start receiving subscribers and serving meals through MessCard.</p>
            <button onClick={() => setShowHostelForm(true)} className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-primary-500/30 transition-all"><Plus className="w-4 h-4" /> Register Your Hostel</button>
          </div>
        ) : (
          <>
            {/* Hostel selector */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {hostels.map((h) => (
                <button key={h.id} onClick={() => setSelectedHostelId(h.id)}
                  className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${selectedHostelId === h.id ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'}`}>
                  {h.name}
                </button>
              ))}
            </div>

            {selectedHostel && (
              <>
                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <div className="bg-white rounded-2xl p-5 border border-neutral-200">
                    <div className="flex items-center gap-3 mb-2"><div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center"><Users className="w-5 h-5 text-primary-600" /></div><span className="text-sm text-neutral-500">Subscribers</span></div>
                    <p className="text-2xl font-display font-bold text-neutral-900">{subscriptions.length}</p>
                  </div>
                  <div className="bg-white rounded-2xl p-5 border border-neutral-200">
                    <div className="flex items-center gap-3 mb-2"><div className="w-10 h-10 rounded-xl bg-secondary-100 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-secondary-600" /></div><span className="text-sm text-neutral-500">Total Revenue</span></div>
                    <p className="text-2xl font-display font-bold text-neutral-900">₹{totalEarnings.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="bg-white rounded-2xl p-5 border border-neutral-200">
                    <div className="flex items-center gap-3 mb-2"><div className="w-10 h-10 rounded-xl bg-success-100 flex items-center justify-center"><DollarSign className="w-5 h-5 text-success-600" /></div><span className="text-sm text-neutral-500">Your Earnings</span></div>
                    <p className="text-2xl font-display font-bold text-neutral-900">₹{Math.round(commissionEarnings).toLocaleString('en-IN')}</p>
                    <p className="text-xs text-neutral-400">after {(100 - selectedHostel.commission_rate)}% commission</p>
                  </div>
                  <div className="bg-white rounded-2xl p-5 border border-neutral-200">
                    <div className="flex items-center gap-3 mb-2"><div className="w-10 h-10 rounded-xl bg-accent-100 flex items-center justify-center"><Star className="w-5 h-5 text-accent-600" /></div><span className="text-sm text-neutral-500">Rating</span></div>
                    <p className="text-2xl font-display font-bold text-neutral-900">{selectedHostel.rating.toFixed(1)}</p>
                  </div>
                </div>

                {/* Hostel info */}
                <div className="bg-white rounded-2xl p-6 border border-neutral-200 mb-6">
                  <div className="flex items-start gap-4">
                    <img src={selectedHostel.image_url} alt={selectedHostel.name} className="w-24 h-24 rounded-xl object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h2 className="font-display font-bold text-xl text-neutral-900 mb-1">{selectedHostel.name}</h2>
                      <p className="text-sm text-neutral-500 flex items-center gap-1 mb-1"><MapPin className="w-3.5 h-3.5" /> {selectedHostel.address || `${selectedHostel.area}, ${selectedHostel.city}`}</p>
                      <p className="text-sm text-neutral-500 flex items-center gap-1 mb-2"><Phone className="w-3.5 h-3.5" /> {selectedHostel.contact_phone}</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-md">{selectedHostel.food_type}</span>
                        <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-1 rounded-md">₹{selectedHostel.monthly_price}/month</span>
                        <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-1 rounded-md">{selectedHostel.filled_capacity}/{selectedHostel.total_capacity} filled</span>
                        {selectedHostel.amenities.map((a) => <span key={a} className="text-xs bg-neutral-100 text-neutral-600 px-2 py-1 rounded-md">{a}</span>)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Two columns: Menu editor + Subscribers */}
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Weekly Menu Editor */}
                  <div className="bg-white rounded-2xl p-6 border border-neutral-200">
                    <div className="flex items-center gap-2 mb-5"><Utensils className="w-5 h-5 text-primary-600" /><h3 className="font-display font-bold text-lg text-neutral-900">Weekly Menu</h3></div>
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                      {DAYS_OF_WEEK.map((day, dayIdx) => (
                        <div key={dayIdx} className="border-b border-neutral-100 last:border-0 pb-3 last:pb-0">
                          <h4 className="font-semibold text-sm text-neutral-900 mb-2">{day}</h4>
                          <div className="space-y-2">
                            {MEAL_TYPES.map((meal) => {
                              const item = menus.find((m) => m.day_of_week === dayIdx && m.meal_type === meal);
                              const isEditing = editingMenu?.day === dayIdx && editingMenu?.meal === meal;
                              return (
                                <div key={meal} className="bg-neutral-50 rounded-xl p-3">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">{meal}</span>
                                    {!isEditing && <button onClick={() => startEditMenu(dayIdx, meal)} className="text-neutral-400 hover:text-primary-600"><Edit3 className="w-3.5 h-3.5" /></button>}
                                  </div>
                                  {isEditing ? (
                                    <div className="flex gap-2">
                                      <input type="text" value={menuValue} onChange={(e) => setMenuValue(e.target.value)} autoFocus
                                        className="flex-1 px-2 py-1.5 rounded-lg border border-neutral-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm" placeholder="Enter menu items..." />
                                      <button onClick={() => handleSaveMenu(dayIdx, meal)} disabled={menuSaving} className="p-1.5 rounded-lg bg-primary-600 text-white hover:bg-primary-700"><Save className="w-3.5 h-3.5" /></button>
                                      <button onClick={() => setEditingMenu(null)} className="p-1.5 rounded-lg bg-neutral-200 text-neutral-600 hover:bg-neutral-300"><X className="w-3.5 h-3.5" /></button>
                                    </div>
                                  ) : (
                                    <p className="text-sm text-neutral-700 leading-snug">{item?.menu_items ?? <span className="text-neutral-400 italic">Click edit to add</span>}</p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Subscribers */}
                  <div className="bg-white rounded-2xl p-6 border border-neutral-200">
                    <div className="flex items-center gap-2 mb-5"><Users className="w-5 h-5 text-primary-600" /><h3 className="font-display font-bold text-lg text-neutral-900">Subscribers</h3></div>
                    {subscriptions.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-3"><Users className="w-7 h-7 text-neutral-400" /></div>
                        <p className="text-sm text-neutral-500">No subscribers yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                        {subscriptions.map((sub) => (
                          <div key={sub.id} className="bg-neutral-50 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm">
                                  {(sub.profiles?.full_name || sub.subscriber_name || '?').charAt(0)}
                                </div>
                                <div>
                                  <p className="font-medium text-sm text-neutral-900">{sub.profiles?.full_name || sub.subscriber_name}</p>
                                  <p className="text-xs text-neutral-500">{sub.profiles?.phone || sub.subscriber_phone}</p>
                                </div>
                              </div>
                              <span className={`text-xs font-medium px-2 py-1 rounded-md ${sub.status === 'Active' ? 'bg-success-50 text-success-700' : 'bg-neutral-100 text-neutral-500'}`}>{sub.status}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-neutral-500">
                              <span>{sub.plan_type}</span>
                              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(sub.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                              <span className="font-semibold text-neutral-700">₹{Number(sub.amount_paid).toLocaleString('en-IN')}</span>
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                              <span className={`text-xs flex items-center gap-1 ${sub.payment_status === 'paid' ? 'text-success-600' : 'text-warning-600'}`}>
                                {sub.payment_status === 'paid' ? <><CheckCircle2 className="w-3 h-3" /> Paid</> : <><AlertCircle className="w-3 h-3" /> Payment pending</>}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Hostel Registration Modal */}
      {showHostelForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowHostelForm(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-fade-in-up">
            <div className="sticky top-0 bg-white flex items-center justify-between p-6 border-b border-neutral-100 rounded-t-3xl">
              <h2 className="font-display font-bold text-xl text-neutral-900">Register Your Hostel</h2>
              <button onClick={() => setShowHostelForm(false)} className="p-2 rounded-lg hover:bg-neutral-100"><X className="w-5 h-5 text-neutral-500" /></button>
            </div>
            <div className="p-6 space-y-4">
              {formError && <div className="flex items-center gap-2 bg-error-50 text-error-700 px-4 py-3 rounded-xl text-sm"><AlertCircle className="w-4 h-4" />{formError}</div>}
              <div>
                <label className="text-sm font-semibold text-neutral-700 mb-1.5 block">Hostel/PG Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Sunrise PG & Mess"
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm transition-all" />
              </div>
              <div>
                <label className="text-sm font-semibold text-neutral-700 mb-1.5 block">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Tell students about your mess..." rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm transition-all resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold text-neutral-700 mb-1.5 block">Area *</label>
                  <input type="text" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} placeholder="e.g. Koramangala"
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm transition-all" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-neutral-700 mb-1.5 block">City *</label>
                  <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="e.g. Bengaluru"
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm transition-all" />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-neutral-700 mb-1.5 block">Full Address</label>
                <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Street, block, landmarks..."
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm transition-all" />
              </div>
              <div>
                <label className="text-sm font-semibold text-neutral-700 mb-1.5 block">Contact Phone *</label>
                <input type="tel" value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} placeholder="+91 98765 43210"
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm transition-all" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-sm font-semibold text-neutral-700 mb-1.5 block">Monthly Price (₹)</label>
                  <input type="number" value={form.monthly_price} onChange={(e) => setForm({ ...form, monthly_price: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm transition-all" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-neutral-700 mb-1.5 block">Commission (%)</label>
                  <input type="number" value={form.commission_rate} onChange={(e) => setForm({ ...form, commission_rate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm transition-all" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-neutral-700 mb-1.5 block">Capacity</label>
                  <input type="number" value={form.total_capacity} onChange={(e) => setForm({ ...form, total_capacity: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm transition-all" />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-neutral-700 mb-1.5 block">Food Type</label>
                <div className="flex gap-2">
                  {FOOD_TYPE_OPTIONS.map((type) => (
                    <button key={type} type="button" onClick={() => setForm({ ...form, food_type: type })}
                      className={`px-3 py-2 rounded-lg text-sm font-medium border-2 transition-all ${form.food_type === type ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-neutral-200 text-neutral-600'}`}>{type}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-neutral-700 mb-1.5 block">Amenities</label>
                <div className="flex flex-wrap gap-2">
                  {AMENITY_OPTIONS.map((a) => (
                    <button key={a} type="button" onClick={() => toggleAmenity(a)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${form.amenities.includes(a) ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'}`}>{a}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-neutral-700 mb-1.5 block">Image URL (optional)</label>
                <input type="text" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..."
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm transition-all" />
              </div>
              <button onClick={handleCreateHostel} disabled={formSubmitting}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-300 text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-primary-500/30 transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {formSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Creating...</> : 'Register Hostel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
