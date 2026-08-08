import { useEffect, useState } from 'react';
import {
  ArrowLeft, Star, MapPin, Users, Phone, CheckCircle2, Wifi, Droplets, Car,
  Dumbbell, Snowflake, WashingMachine, Trees, Zap, ChefHat, Calendar, QrCode,
  X, Loader2, AlertCircle, Send,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type { Hostel, WeeklyMenu, Review, Subscription } from '@/types';
import { DAYS_OF_WEEK, PLAN_OPTIONS } from '@/types';

interface DetailPageProps {
  hostelId: string;
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

const amenityIcons: Record<string, typeof Wifi> = {
  WiFi: Wifi, 'Hot Water': Droplets, Parking: Car, Gym: Dumbbell,
  'AC Rooms': Snowflake, Laundry: WashingMachine, Garden: Trees, 'Power Backup': Zap,
};

export default function DetailPage({ hostelId, onNavigate }: DetailPageProps) {
  const { user, profile } = useAuth();
  const [hostel, setHostel] = useState<Hostel | null>(null);
  const [menus, setMenus] = useState<WeeklyMenu[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSubscribe, setShowSubscribe] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('Full');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const [{ data: h }, { data: m }, { data: r }] = await Promise.all([
        supabase.from('hostels').select('*').eq('id', hostelId).maybeSingle(),
        supabase.from('weekly_menus').select('*').eq('hostel_id', hostelId).order('day_of_week'),
        supabase.from('reviews').select('*').eq('hostel_id', hostelId).order('created_at', { ascending: false }),
      ]);
      setHostel(h as Hostel | null);
      setMenus(m as WeeklyMenu[] ?? []);
      setReviews(r as Review[] ?? []);
      setLoading(false);
    })();
  }, [hostelId]);

  const planPrice = (planType: string) => {
    if (!hostel) return 0;
    const plan = PLAN_OPTIONS.find((p) => p.type === planType);
    return Math.round(hostel.monthly_price * (plan?.discount ?? 1));
  };

  const handleSubscribe = async () => {
    if (!hostel || !user || !profile) return;
    setSubmitting(true);
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    const { data, error } = await supabase.from('subscriptions').insert({
      hostel_id: hostel.id,
      user_id: user.id,
      subscriber_name: profile.full_name,
      subscriber_phone: profile.phone,
      plan_type: selectedPlan,
      start_date: today.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      amount_paid: planPrice(selectedPlan),
      status: 'Active',
      payment_status: 'pending',
    }).select().maybeSingle();

    if (data && !error) {
      setSubscription(data as Subscription);
      setSuccess(true);
    }
    setSubmitting(false);
  };

  const handleReviewSubmit = async () => {
    if (!hostel || !user || !profile) return;
    if (!reviewComment.trim()) { setReviewError('Please write a comment'); return; }
    setReviewSubmitting(true);
    setReviewError(null);

    const { data, error } = await supabase.from('reviews').insert({
      hostel_id: hostel.id,
      user_id: user.id,
      reviewer_name: profile.full_name,
      rating: reviewRating,
      comment: reviewComment.trim(),
    }).select().maybeSingle();

    if (data && !error) {
      setReviews([data as Review, ...reviews]);
      setReviewComment('');
      setReviewRating(5);
    }
    setReviewSubmitting(false);
  };

  if (loading) {
    return <div className="min-h-screen pt-20 flex items-center justify-center"><Loader2 className="w-8 h-8 text-primary-500 animate-spin" /></div>;
  }

  if (!hostel) {
    return (
      <div className="min-h-screen pt-20 flex flex-col items-center justify-center gap-4">
        <p className="text-neutral-500">Hostel not found.</p>
        <button onClick={() => onNavigate('browse')} className="text-primary-600 font-medium">Back to Browse</button>
      </div>
    );
  }

  const spotsLeft = hostel.total_capacity - hostel.filled_capacity;
  const menuByDay = (day: number, meal: string) => menus.find((m) => m.day_of_week === day && m.meal_type === meal);

  if (success && subscription) {
    return (
      <div className="min-h-screen pt-20 pb-12 bg-neutral-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center animate-fade-in-up">
          <div className="w-20 h-20 rounded-full bg-success-100 flex items-center justify-center mx-auto mb-6"><CheckCircle2 className="w-10 h-10 text-success-600" /></div>
          <h2 className="font-display font-bold text-2xl text-neutral-900 mb-2">Subscription Active!</h2>
          <p className="text-neutral-600 mb-6">Your digital mess card is ready. Show this at the mess counter to get your meals.</p>
          <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-6 text-white text-left mb-6 shadow-lg">
            <div className="flex items-start justify-between mb-4">
              <div><p className="text-xs text-primary-200 uppercase tracking-wide">MessCard</p><p className="font-display font-bold text-lg">{hostel.name}</p></div>
              <QrCode className="w-10 h-10 text-white/80" />
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-primary-200">Subscriber</span><span className="font-semibold">{subscription.subscriber_name}</span></div>
              <div className="flex justify-between"><span className="text-primary-200">Plan</span><span className="font-semibold">{subscription.plan_type}</span></div>
              <div className="flex justify-between"><span className="text-primary-200">Valid Until</span><span className="font-semibold">{new Date(subscription.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span></div>
              <div className="flex justify-between"><span className="text-primary-200">Card ID</span><span className="font-mono text-xs">{subscription.id.slice(0, 8).toUpperCase()}</span></div>
              <div className="flex justify-between"><span className="text-primary-200">Payment</span><span className="font-semibold text-accent-300">Pending</span></div>
            </div>
          </div>
          <p className="text-xs text-neutral-500 mb-4 bg-warning-50 rounded-lg p-3">Payment is pending. Once Stripe is configured, you will be charged automatically at checkout.</p>
          <div className="flex gap-3">
            <button onClick={() => onNavigate('dashboard')} className="flex-1 bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors">View My Cards</button>
            <button onClick={() => onNavigate('browse')} className="flex-1 bg-neutral-100 text-neutral-700 py-3 rounded-xl font-semibold hover:bg-neutral-200 transition-colors">Browse More</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 pb-12 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button onClick={() => onNavigate('browse')} className="inline-flex items-center gap-2 text-neutral-600 hover:text-primary-600 mt-4 mb-4 text-sm font-medium transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Browse
        </button>

        <div className="rounded-3xl overflow-hidden mb-8 shadow-lg relative">
          <img src={hostel.image_url} alt={hostel.name} className="w-full h-64 sm:h-80 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1 bg-white/90 backdrop-blur px-2.5 py-1 rounded-lg"><Star className="w-3.5 h-3.5 text-accent-500 fill-accent-500" /><span className="text-sm font-semibold text-neutral-900">{hostel.rating.toFixed(1)}</span></div>
              <span className="bg-primary-500 text-white px-2.5 py-1 rounded-lg text-xs font-semibold">{hostel.food_type}</span>
            </div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-white mb-1">{hostel.name}</h1>
            <p className="text-white/80 text-sm flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {hostel.address}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl p-6 border border-neutral-200">
              <h2 className="font-display font-bold text-xl text-neutral-900 mb-3">About this Mess</h2>
              <p className="text-neutral-600 leading-relaxed">{hostel.description}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-4 border border-neutral-200 text-center"><Users className="w-6 h-6 text-primary-500 mx-auto mb-2" /><p className="text-2xl font-display font-bold text-neutral-900">{hostel.filled_capacity}</p><p className="text-xs text-neutral-500">Members</p></div>
              <div className="bg-white rounded-2xl p-4 border border-neutral-200 text-center"><ChefHat className="w-6 h-6 text-primary-500 mx-auto mb-2" /><p className="text-2xl font-display font-bold text-neutral-900">3</p><p className="text-xs text-neutral-500">Meals/day</p></div>
              <div className="bg-white rounded-2xl p-4 border border-neutral-200 text-center"><Calendar className="w-6 h-6 text-primary-500 mx-auto mb-2" /><p className="text-2xl font-display font-bold text-neutral-900">7</p><p className="text-xs text-neutral-500">Days/week</p></div>
              <div className="bg-white rounded-2xl p-4 border border-neutral-200 text-center"><Star className="w-6 h-6 text-primary-500 mx-auto mb-2" /><p className="text-2xl font-display font-bold text-neutral-900">{hostel.rating.toFixed(1)}</p><p className="text-xs text-neutral-500">Rating</p></div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-neutral-200">
              <div className="flex items-center gap-2 mb-5"><ChefHat className="w-5 h-5 text-primary-600" /><h2 className="font-display font-bold text-xl text-neutral-900">Weekly Menu</h2></div>
              <div className="space-y-4">
                {DAYS_OF_WEEK.map((day, dayIdx) => (
                  <div key={dayIdx} className="border-b border-neutral-100 last:border-0 pb-4 last:pb-0">
                    <h3 className="font-semibold text-sm text-neutral-900 mb-3">{day}</h3>
                    <div className="grid sm:grid-cols-3 gap-3">
                      {(['Breakfast', 'Lunch', 'Dinner'] as const).map((meal) => {
                        const item = menuByDay(dayIdx, meal);
                        return (
                          <div key={meal} className="bg-neutral-50 rounded-xl p-3">
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <span className={`w-2 h-2 rounded-full ${meal === 'Breakfast' ? 'bg-accent-400' : meal === 'Lunch' ? 'bg-primary-400' : 'bg-secondary-400'}`} />
                              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">{meal}</span>
                            </div>
                            <p className="text-sm text-neutral-700 leading-snug">{item?.menu_items ?? 'Not available'}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-neutral-200">
              <h2 className="font-display font-bold text-xl text-neutral-900 mb-4">Amenities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {hostel.amenities.map((a) => {
                  const Icon = amenityIcons[a] ?? CheckCircle2;
                  return <div key={a} className="flex items-center gap-2 bg-neutral-50 rounded-xl px-3 py-2.5"><Icon className="w-4 h-4 text-primary-600" /><span className="text-sm text-neutral-700">{a}</span></div>;
                })}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-neutral-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold text-xl text-neutral-900">Reviews</h2>
                <div className="flex items-center gap-1"><Star className="w-4 h-4 text-accent-500 fill-accent-500" /><span className="font-semibold text-neutral-900">{hostel.rating.toFixed(1)}</span><span className="text-sm text-neutral-500">({reviews.length})</span></div>
              </div>

              {user && profile?.role === 'student' && (
                <div className="mb-6 bg-neutral-50 rounded-2xl p-4">
                  <h3 className="font-semibold text-sm text-neutral-900 mb-3">Write a Review</h3>
                  {reviewError && <div className="flex items-center gap-2 bg-error-50 text-error-700 px-3 py-2 rounded-lg mb-3 text-xs"><AlertCircle className="w-4 h-4" />{reviewError}</div>}
                  <div className="flex items-center gap-1 mb-3">
                    {[1,2,3,4,5].map((i) => (
                      <button key={i} onClick={() => setReviewRating(i)}><Star className={`w-6 h-6 transition-all ${i <= reviewRating ? 'text-accent-500 fill-accent-500' : 'text-neutral-300'}`} /></button>
                    ))}
                  </div>
                  <textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} placeholder="Share your experience..." rows={3}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm transition-all resize-none mb-3" />
                  <button onClick={handleReviewSubmit} disabled={reviewSubmitting}
                    className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-300 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
                    {reviewSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Submit Review
                  </button>
                </div>
              )}

              {reviews.length === 0 ? (
                <p className="text-neutral-500 text-sm">No reviews yet. Be the first to review!</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-neutral-100 last:border-0 pb-4 last:pb-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm">{review.reviewer_name.charAt(0)}</div>
                          <span className="font-medium text-sm text-neutral-900">{review.reviewer_name}</span>
                        </div>
                        <div className="flex items-center gap-0.5">{[1,2,3,4,5].map((i) => <Star key={i} className={`w-3.5 h-3.5 ${i <= review.rating ? 'text-accent-500 fill-accent-500' : 'text-neutral-200'}`} />)}</div>
                      </div>
                      <p className="text-sm text-neutral-600 leading-relaxed">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm">
                <div className="mb-5">
                  <div className="flex items-baseline gap-1 mb-1"><span className="text-3xl font-display font-bold text-neutral-900">₹{hostel.monthly_price.toLocaleString('en-IN')}</span><span className="text-neutral-500 text-sm">/month</span></div>
                  <p className="text-sm text-neutral-500">Full plan — all meals included</p>
                </div>
                {spotsLeft > 0 ? (
                  <div className="mb-4 inline-flex items-center gap-1.5 bg-success-50 text-success-700 px-3 py-1.5 rounded-lg text-sm font-medium"><CheckCircle2 className="w-4 h-4" />{spotsLeft} spots available</div>
                ) : (
                  <div className="mb-4 inline-flex items-center gap-1.5 bg-error-50 text-error-700 px-3 py-1.5 rounded-lg text-sm font-medium">Currently full — check back soon</div>
                )}
                <div className="space-y-2 mb-5">
                  <div className="flex items-center gap-2 text-sm text-neutral-600"><CheckCircle2 className="w-4 h-4 text-success-500" /> 30-day digital mess card</div>
                  <div className="flex items-center gap-2 text-sm text-neutral-600"><CheckCircle2 className="w-4 h-4 text-success-500" /> Breakfast, lunch & dinner</div>
                  <div className="flex items-center gap-2 text-sm text-neutral-600"><CheckCircle2 className="w-4 h-4 text-success-500" /> Fresh daily meals, 7 days a week</div>
                  <div className="flex items-center gap-2 text-sm text-neutral-600"><CheckCircle2 className="w-4 h-4 text-success-500" /> Cancel anytime</div>
                </div>
                {user ? (
                  <button onClick={() => setShowSubscribe(true)} disabled={spotsLeft <= 0}
                    className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-300 text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-primary-500/30 hover:shadow-xl transition-all disabled:cursor-not-allowed">
                    {spotsLeft > 0 ? 'Subscribe Now' : 'Currently Full'}
                  </button>
                ) : (
                  <button onClick={() => onNavigate('auth')}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-primary-500/30 hover:shadow-xl transition-all">
                    Sign In to Subscribe
                  </button>
                )}
                <div className="mt-4 pt-4 border-t border-neutral-100">
                  <div className="flex items-center gap-2 text-sm text-neutral-600 mb-2"><Phone className="w-4 h-4" /> {hostel.contact_phone}</div>
                  <p className="text-xs text-neutral-400">Have questions? Call the hostel directly.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showSubscribe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowSubscribe(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-fade-in-up">
            <div className="sticky top-0 bg-white flex items-center justify-between p-6 border-b border-neutral-100 rounded-t-3xl">
              <h2 className="font-display font-bold text-xl text-neutral-900">Subscribe to {hostel.name}</h2>
              <button onClick={() => setShowSubscribe(false)} className="p-2 rounded-lg hover:bg-neutral-100"><X className="w-5 h-5 text-neutral-500" /></button>
            </div>
            <div className="p-6">
              <label className="text-sm font-semibold text-neutral-700 mb-3 block">Choose Your Plan</label>
              <div className="space-y-2 mb-6">
                {PLAN_OPTIONS.map((plan) => {
                  const price = planPrice(plan.type);
                  return (
                    <button key={plan.type} onClick={() => setSelectedPlan(plan.type)}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${selectedPlan === plan.type ? 'border-primary-500 bg-primary-50' : 'border-neutral-200 hover:border-neutral-300'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPlan === plan.type ? 'border-primary-500' : 'border-neutral-300'}`}>
                          {selectedPlan === plan.type && <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />}
                        </div>
                        <span className="font-medium text-sm text-neutral-900 text-left">{plan.label}</span>
                      </div>
                      <span className="font-display font-bold text-neutral-900">₹{price.toLocaleString('en-IN')}</span>
                    </button>
                  );
                })}
              </div>
              <div className="bg-neutral-50 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between mb-2"><span className="text-sm text-neutral-600">Plan</span><span className="text-sm font-semibold text-neutral-900">{selectedPlan}</span></div>
                <div className="flex items-center justify-between mb-2"><span className="text-sm text-neutral-600">Duration</span><span className="text-sm font-semibold text-neutral-900">30 days</span></div>
                <div className="flex items-center justify-between mb-2"><span className="text-sm text-neutral-600">Payment</span><span className="text-sm font-semibold text-warning-600">Pending (Pay at mess)</span></div>
                <div className="border-t border-neutral-200 pt-2 mt-2 flex items-center justify-between">
                  <span className="font-semibold text-neutral-900">Total</span>
                  <span className="font-display font-bold text-xl text-primary-600">₹{planPrice(selectedPlan).toLocaleString('en-IN')}</span>
                </div>
              </div>
              <button onClick={handleSubscribe} disabled={submitting}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-300 text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-primary-500/30 transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {submitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</> : 'Confirm & Get Mess Card'}
              </button>
              <p className="text-xs text-neutral-400 text-center mt-3">By subscribing, you agree to MessCard's terms. Cancel anytime.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
