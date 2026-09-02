import { useState } from 'react';
import { Phone, Mail, MapPin, MessageCircle, Send, User, Check, Clock, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useSettings } from '@/lib/settings-context';

export function ContactPage() {
  const { settings } = useSettings();
  const [form, setForm] = useState({ name: '', phone: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');
    try {
      const { error } = await supabase.from('leads').insert({
        name: form.name,
        phone: form.phone,
        message: form.message,
      });
      if (error) throw error;
      setStatus('success');
      setForm({ name: '', phone: '', message: '' });
      setTimeout(() => setStatus('idle'), 4000);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Failed to send message');
    }
  };

  return (
    <div className="animate-fade-in pt-20">
      <div className="bg-forest-600 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl font-bold text-cream-100 sm:text-4xl">Contact Us</h1>
          <p className="mt-2 text-sm text-cream-100/60">
            Have a question or want to list your property? We're here to help.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Contact Info Cards */}
          <div className="space-y-4">
            <div className="rounded-xl bg-white p-5 card-shadow">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gold-400/15 text-gold-500">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-forest-400">Call Us</p>
                  <a href={`tel:${settings.phone}`} className="font-display text-base font-semibold text-forest-700 transition-colors hover:text-gold-500">
                    {settings.phone}
                  </a>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-white p-5 card-shadow">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gold-400/15 text-gold-500">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-forest-400">Email Us</p>
                  <a href={`mailto:${settings.email}`} className="font-display text-base font-semibold text-forest-700 transition-colors hover:text-gold-500">
                    {settings.email}
                  </a>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-white p-5 card-shadow">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gold-400/15 text-gold-500">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-forest-400">Visit Us</p>
                  <p className="font-display text-base font-semibold text-forest-700">
                    {settings.office_address}
                  </p>
                </div>
              </div>
            </div>

            <a
              href={`https://wa.me/${settings.whatsapp}?text=Hi%20${encodeURIComponent(settings.brand_name)}%2C%20I%27d%20like%20to%20get%20in%20touch.`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 rounded-xl bg-[#25D366] p-5 font-semibold text-white transition-all hover:brightness-110 card-shadow"
            >
              <MessageCircle className="h-5 w-5" />
              Chat on WhatsApp
            </a>

            <div className="rounded-xl bg-forest-50 p-5">
              <div className="flex items-center gap-2 text-forest-600">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-semibold">Office Hours</span>
              </div>
              <div className="mt-3 space-y-1.5 text-sm text-forest-400">
                <div className="flex justify-between">
                  <span>Monday – Friday</span>
                  <span className="font-medium text-forest-600">{settings.office_hours_weekday}</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday</span>
                  <span className="font-medium text-forest-600">{settings.office_hours_saturday}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday</span>
                  <span className="font-medium text-forest-600">{settings.office_hours_sunday}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl bg-white p-6 card-shadow sm:p-8">
              <h2 className="font-display text-2xl font-bold text-forest-700">Send Us a Message</h2>
              <p className="mt-1.5 text-sm text-forest-400">
                Fill out the form below and our team will get back to you within 24 hours.
              </p>

              {status === 'success' ? (
                <div className="mt-8 flex flex-col items-center justify-center rounded-xl bg-forest-50 py-12 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold-400 text-forest-700">
                    <Check className="h-8 w-8" strokeWidth={3} />
                  </div>
                  <h3 className="mt-4 font-display text-xl font-bold text-forest-700">Message Sent!</h3>
                  <p className="mt-1 text-sm text-forest-400">We'll get back to you as soon as possible.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                  {status === 'error' && (
                    <div className="flex items-start gap-2 rounded-lg bg-rose-50 p-3 text-sm text-rose-600">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-forest-600">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-forest-300" />
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Enter your name"
                        className="input-field pl-11"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-forest-600">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-forest-300" />
                      <input
                        type="tel"
                        required
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="03XX XXXXXXX"
                        className="input-field pl-11"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-forest-600">Message</label>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Tell us what you're looking for, or ask any question..."
                      className="input-field resize-none"
                    />
                  </div>
                  <button type="submit" disabled={status === 'submitting'} className="w-full btn-primary disabled:opacity-60">
                    {status === 'submitting' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    {status === 'submitting' ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
