import { useEffect, useState } from 'react';
import {
  Utensils, Calendar, QrCode, ShieldCheck, Search, ArrowRight, Star,
  ChefHat, Wallet, Clock, CheckCircle2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Hostel } from '@/types';
import HostelCard from '@/components/HostelCard';

interface HomePageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('hostels').select('*').order('rating', { ascending: false }).limit(6);
      setHostels(data ?? []);
      setLoading(false);
    })();
  }, []);

  const steps = [
    { icon: Search, title: 'Browse & Discover', desc: 'Find hostels and PGs near you that serve fresh daily meals. Compare menus, prices, and ratings.', color: 'bg-secondary-500' },
    { icon: Calendar, title: 'Subscribe Monthly', desc: 'Pick a plan that fits your schedule — full meals, lunch & dinner, or single meals. Pay once for 30 days.', color: 'bg-primary-500' },
    { icon: QrCode, title: 'Get Your Digital Mess Card', desc: 'Receive a digital mess card instantly. Show it at the mess counter and enjoy your meals every day.', color: 'bg-success-500' },
    { icon: Utensils, title: 'Eat Daily, Hassle-Free', desc: 'Walk in for breakfast, lunch, or dinner. No cooking, no cleaning, no worries — just good food.', color: 'bg-accent-500' },
  ];

  const features = [
    { icon: ChefHat, title: 'Home-Style Cooking', desc: 'Fresh meals prepared daily by experienced mess cooks, just like home.' },
    { icon: Wallet, title: 'Affordable Pricing', desc: 'Monthly subscriptions starting at ₹3,200 — far cheaper than restaurants or delivery.' },
    { icon: Clock, title: 'Save Hours Daily', desc: 'No grocery shopping, no cooking, no cleanup. Reclaim 2+ hours every day.' },
    { icon: ShieldCheck, title: 'Verified Hostels', desc: 'Every hostel on MessCard is verified for hygiene, quality, and reliability.' },
  ];

  return (
    <div>
      <section className="relative overflow-hidden pt-20 pb-16 sm:pt-28 sm:pb-24">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50" />
        <div className="absolute top-20 right-0 w-72 h-72 bg-primary-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-200/30 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Utensils className="w-4 h-4" /> Digital Mess Card Platform
              </div>
              <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-neutral-900 leading-tight mb-6">
                No time to cook?<br />
                <span className="text-primary-600">Subscribe to a mess</span><br />near you.
              </h1>
              <p className="text-lg text-neutral-600 leading-relaxed mb-8 max-w-lg">
                MessCard connects students and IT professionals with hostels and PGs that
                already cook fresh food daily. Take a monthly subscription, get a digital mess
                card, and eat home-style meals — no cooking required.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => onNavigate('browse')} className="inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3.5 rounded-xl font-semibold shadow-lg shadow-primary-500/30 hover:shadow-xl transition-all">
                  Find a Mess Near You <ArrowRight className="w-4 h-4" />
                </button>
                <button onClick={() => onNavigate('auth')} className="inline-flex items-center justify-center gap-2 bg-white hover:bg-neutral-50 text-neutral-700 px-6 py-3.5 rounded-xl font-semibold border border-neutral-200 transition-all">
                  <QrCode className="w-4 h-4" /> Sign Up Free
                </button>
              </div>
              <div className="flex items-center gap-6 mt-8">
                <div>
                  <div className="flex items-center gap-1">{[1,2,3,4,5].map((i) => <Star key={i} className="w-4 h-4 text-accent-500 fill-accent-500" />)}</div>
                  <p className="text-sm text-neutral-500 mt-1">4.5 avg rating</p>
                </div>
                <div className="border-l border-neutral-200 pl-6">
                  <p className="text-2xl font-display font-bold text-neutral-900">5+</p>
                  <p className="text-sm text-neutral-500">Partner hostels</p>
                </div>
                <div className="border-l border-neutral-200 pl-6">
                  <p className="text-2xl font-display font-bold text-neutral-900">225+</p>
                  <p className="text-sm text-neutral-500">Daily meals served</p>
                </div>
              </div>
            </div>
            <div className="relative animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img src="https://images.pexels.com/photos/5775684/pexels-photo-5775684.jpeg?auto=compress&cs=tinysrgb&h=650&w=940" alt="Delicious Indian thali meal" className="w-full h-[400px] object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
              <div className="absolute -bottom-5 -left-5 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3 max-w-[260px]">
                <div className="w-12 h-12 rounded-xl bg-success-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-success-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-neutral-900">Subscription Active</p>
                  <p className="text-xs text-neutral-500">28 days remaining on your mess card</p>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Starting from</p>
                  <p className="font-display font-bold text-neutral-900">₹3,200/mo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-neutral-900 mb-3">How It Works</h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">Four simple steps from hungry to happy. No cooking, no cleaning, no daily decisions.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="relative group">
                  <div className="bg-neutral-50 rounded-2xl p-6 h-full border border-neutral-100 hover:border-primary-200 hover:shadow-lg transition-all duration-300">
                    <div className={`w-14 h-14 rounded-2xl ${step.color} flex items-center justify-center mb-4 shadow-lg`}>
                      <Icon className="w-7 h-7 text-white" strokeWidth={2} />
                    </div>
                    <div className="text-sm font-bold text-primary-500 mb-2">Step {i + 1}</div>
                    <h3 className="font-display font-bold text-lg text-neutral-900 mb-2">{step.title}</h3>
                    <p className="text-sm text-neutral-600 leading-relaxed">{step.desc}</p>
                  </div>
                  {i < steps.length - 1 && <div className="hidden lg:block absolute top-1/2 -right-3 z-10"><ArrowRight className="w-5 h-5 text-neutral-300" /></div>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-neutral-900 mb-3">Why MessCard?</h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">Built for the busy lives of students and IT professionals who deserve good food without the hassle.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="bg-white rounded-2xl p-6 border border-neutral-100 hover:shadow-lg transition-all">
                  <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mb-4"><Icon className="w-6 h-6 text-primary-600" /></div>
                  <h3 className="font-display font-bold text-base text-neutral-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-neutral-600 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-neutral-900 mb-2">Top Rated Mess Near You</h2>
              <p className="text-neutral-600">Discover the best hostels and PGs serving fresh daily meals.</p>
            </div>
            <button onClick={() => onNavigate('browse')} className="hidden sm:inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm">View All <ArrowRight className="w-4 h-4" /></button>
          </div>
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map((i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden border border-neutral-200">
                  <div className="h-48 skeleton" />
                  <div className="p-4 space-y-3"><div className="h-4 w-3/4 skeleton rounded" /><div className="h-3 w-1/2 skeleton rounded" /><div className="h-8 w-1/3 skeleton rounded" /></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {hostels.map((hostel) => <HostelCard key={hostel.id} hostel={hostel} onClick={() => onNavigate('detail', { id: hostel.id })} />)}
            </div>
          )}
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-primary-600 to-primary-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mb-4">Ready to stop cooking and start eating?</h2>
          <p className="text-primary-100 text-lg mb-8 max-w-2xl mx-auto">Join MessCard today and get access to fresh, home-style meals from hostels and PGs near you. Your digital mess card is just a subscription away.</p>
          <button onClick={() => onNavigate('browse')} className="inline-flex items-center gap-2 bg-white text-primary-700 px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all">Find Your Mess Now <ArrowRight className="w-5 h-5" /></button>
        </div>
      </section>
    </div>
  );
}
