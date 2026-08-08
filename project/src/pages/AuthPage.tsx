import { useState } from 'react';
import { Utensils, GraduationCap, Building2, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import type { UserRole } from '@/types';

interface AuthPageProps {
  onNavigate: (page: string) => void;
}

export default function AuthPage({ onNavigate }: AuthPageProps) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === 'signup') {
      if (!fullName.trim() || !phone.trim()) {
        setError('Please fill in all fields');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        setLoading(false);
        return;
      }
      const { error } = await signUp(email, password, fullName.trim(), phone.trim(), role);
      if (error) setError(error);
      else onNavigate('home');
    } else {
      const { error } = await signIn(email, password);
      if (error) setError(error);
      else onNavigate('home');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen pt-16 flex items-center justify-center px-4 py-12 bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl border border-neutral-200 overflow-hidden animate-fade-in-up">
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-6 justify-center">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
                <Utensils className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-display font-bold text-xl text-neutral-900">MessCard</span>
            </div>

            <div className="flex bg-neutral-100 rounded-xl p-1 mb-6">
              <button onClick={() => setMode('signup')} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${mode === 'signup' ? 'bg-white text-primary-700 shadow-sm' : 'text-neutral-500'}`}>Sign Up</button>
              <button onClick={() => setMode('signin')} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${mode === 'signin' ? 'bg-white text-primary-700 shadow-sm' : 'text-neutral-500'}`}>Sign In</button>
            </div>

            <h2 className="font-display font-bold text-2xl text-neutral-900 mb-1">
              {mode === 'signup' ? 'Create your account' : 'Welcome back'}
            </h2>
            <p className="text-sm text-neutral-500 mb-6">
              {mode === 'signup' ? 'Join MessCard and get your digital mess card' : 'Sign in to manage your mess cards'}
            </p>

            {error && (
              <div className="flex items-center gap-2 bg-error-50 text-error-700 px-4 py-3 rounded-xl mb-4 text-sm animate-fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <>
                  <div>
                    <label className="text-sm font-semibold text-neutral-700 mb-1.5 block">Full Name</label>
                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Enter your name"
                      className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm transition-all" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-neutral-700 mb-1.5 block">Phone Number</label>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter your phone number"
                      className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm transition-all" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-neutral-700 mb-2 block">I am a...</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button type="button" onClick={() => setRole('student')}
                        className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${role === 'student' ? 'border-primary-500 bg-primary-50' : 'border-neutral-200 hover:border-neutral-300'}`}>
                        <GraduationCap className={`w-5 h-5 ${role === 'student' ? 'text-primary-600' : 'text-neutral-400'}`} />
                        <span className={`text-sm font-medium ${role === 'student' ? 'text-primary-700' : 'text-neutral-600'}`}>Student</span>
                      </button>
                      <button type="button" onClick={() => setRole('owner')}
                        className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${role === 'owner' ? 'border-primary-500 bg-primary-50' : 'border-neutral-200 hover:border-neutral-300'}`}>
                        <Building2 className={`w-5 h-5 ${role === 'owner' ? 'text-primary-600' : 'text-neutral-400'}`} />
                        <span className={`text-sm font-medium ${role === 'owner' ? 'text-primary-700' : 'text-neutral-600'}`}>Hostel Owner</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
              <div>
                <label className="text-sm font-semibold text-neutral-700 mb-1.5 block">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm transition-all" />
              </div>
              <div>
                <label className="text-sm font-semibold text-neutral-700 mb-1.5 block">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm transition-all" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-300 text-white py-3 rounded-xl font-semibold shadow-lg shadow-primary-500/30 transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Please wait...</> : mode === 'signup' ? 'Create Account' : 'Sign In'}
              </button>
            </form>

            <p className="text-xs text-neutral-400 text-center mt-4">
              {mode === 'signup' ? 'Already have an account? ' : 'New to MessCard? '}
              <button onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setError(null); }} className="text-primary-600 font-semibold hover:underline">
                {mode === 'signup' ? 'Sign in' : 'Create one'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
