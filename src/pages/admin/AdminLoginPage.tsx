import { useState, useEffect } from 'react';
import { Building2, Lock, Mail, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import { useAdminAuth } from '@/lib/admin-auth';
import { useRouter } from '@/lib/router';
import { supabase } from '@/lib/supabase';

export function AdminLoginPage() {
  const { signIn, session, loading } = useAdminAuth();
  const { navigate } = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [setupStatus, setSetupStatus] = useState<'idle' | 'running' | 'done' | 'error'>('idle');

  useEffect(() => {
    if (!loading && session) {
      navigate({ name: 'admin' });
    }
  }, [session, loading, navigate]);

  // One-time admin user provisioning via edge function (Auth Admin API)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setSetupStatus('running');
      try {
        const { error: fnError } = await supabase.functions.invoke('create-admin-user');
        if (cancelled) return;
        if (fnError) {
          console.warn('Admin user setup:', fnError.message);
          setSetupStatus('error');
        } else {
          setSetupStatus('done');
        }
      } catch (err) {
        if (cancelled) return;
        console.warn('Admin user setup failed:', err);
        setSetupStatus('error');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const { error: signInError } = await signIn(email.trim(), password);
    if (signInError) {
      setError(signInError);
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-forest-700 px-4 py-12">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gold-400/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-forest-500/30 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <button
          onClick={() => navigate({ name: 'home' })}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-cream-100/50 transition-colors hover:text-cream-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to site
        </button>

        <div className="rounded-2xl bg-white p-8 shadow-2xl">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-forest-600 text-gold-400">
              <Building2 className="h-7 w-7" strokeWidth={2.5} />
            </div>
            <h1 className="mt-4 font-display text-2xl font-bold text-forest-700">Admin Login</h1>
            <p className="mt-1.5 text-sm text-forest-400">
              Sign in to manage AKN Estates
            </p>
          </div>

          {setupStatus === 'running' && (
            <div className="mt-6 flex items-center justify-center gap-2 rounded-lg bg-cream-50 p-3 text-sm text-forest-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Preparing admin account...
            </div>
          )}

          {setupStatus === 'error' && (
            <div className="mt-6 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>Could not verify admin account setup. If login fails, contact your administrator.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-forest-400">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-forest-300" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@aknestates.pk"
                  className="input-field pl-11"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-forest-400">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-forest-300" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="input-field pl-11"
                  autoComplete="current-password"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-rose-50 p-3 text-sm text-rose-600">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || setupStatus === 'running'}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gold-400 px-6 py-3 text-sm font-semibold text-forest-700 transition-all hover:bg-gold-300 hover:shadow-lg hover:shadow-gold-400/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-cream-100/30">
          Authorized personnel only. All access is logged.
        </p>
      </div>
    </div>
  );
}
