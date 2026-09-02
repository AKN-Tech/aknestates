import { useState, useEffect, useCallback } from 'react';
import { Trash2, Search, Loader2, AlertCircle, Phone, MessageSquare, X, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Lead {
  id: string;
  name: string;
  phone: string;
  message: string;
  created_at: string;
}

export function LeadsManager() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });
      if (fetchError) throw fetchError;
      setLeads((data as Lead[]) ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leads');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string) => {
    try {
      const { error: deleteError } = await supabase.from('leads').delete().eq('id', id);
      if (deleteError) throw deleteError;
      setConfirmDelete(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete lead');
    }
  };

  const filtered = leads.filter((l) =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.phone.toLowerCase().includes(search.toLowerCase()) ||
    l.message.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-forest-700">Leads & Messages</h2>
          <p className="mt-1 text-sm text-forest-400">
            Contact form submissions{leads.length > 0 && ` (${leads.length} total)`}
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-lg bg-rose-50 p-3 text-sm text-rose-600">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto"><X className="h-4 w-4" /></button>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-forest-700/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertCircle className="h-6 w-6" />
              <h3 className="font-display text-lg font-bold">Delete Lead?</h3>
            </div>
            <p className="mt-2 text-sm text-forest-400">This inquiry will be permanently removed.</p>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 rounded-lg border border-cream-300 px-4 py-2.5 text-sm font-medium text-forest-600 hover:bg-cream-50">Cancel</button>
              <button onClick={() => handleDelete(confirmDelete)} className="flex-1 rounded-lg bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-600">Delete</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-gold-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl bg-white py-20 text-center card-shadow">
          <MessageSquare className="h-12 w-12 text-forest-200" />
          <h3 className="mt-4 font-display text-lg font-semibold text-forest-700">No leads yet</h3>
          <p className="mt-1 text-sm text-forest-400">Contact form submissions will appear here</p>
        </div>
      ) : (
        <>
          <div className="mb-4 relative max-w-sm">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-forest-300" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone, or message..."
              className="input-field pl-11"
            />
          </div>

          <div className="overflow-x-auto rounded-xl bg-white card-shadow">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-cream-200 bg-cream-50 text-xs uppercase tracking-wider text-forest-400">
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Phone</th>
                  <th className="px-4 py-3 font-semibold">Message</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead) => (
                  <tr key={lead.id} className="border-b border-cream-100 transition-colors hover:bg-cream-50">
                    <td className="px-4 py-3 font-medium text-forest-700">{lead.name}</td>
                    <td className="px-4 py-3">
                      <a href={`tel:${lead.phone}`} className="flex items-center gap-1.5 text-forest-500 transition-colors hover:text-gold-500">
                        <Phone className="h-3.5 w-3.5" />
                        {lead.phone}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <p className="max-w-xs truncate text-forest-500" title={lead.message}>{lead.message}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col text-xs text-forest-400">
                        <span className="flex items-center gap-1 font-medium text-forest-600">
                          <Calendar className="h-3 w-3" />
                          {formatDate(lead.created_at)}
                        </span>
                        <span className="ml-4">{formatTime(lead.created_at)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg p-2 text-forest-500 transition-colors hover:bg-emerald-50 hover:text-emerald-600"
                          aria-label="WhatsApp"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </a>
                        <button
                          onClick={() => setConfirmDelete(lead.id)}
                          className="rounded-lg p-2 text-forest-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
                          aria-label="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
