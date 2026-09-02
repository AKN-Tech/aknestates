import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, Search, Loader2, AlertCircle, Image as ImageIcon, Star } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
  fetchListings, createListing, updateListing, deleteListing,
  uploadListingPhoto, deleteListingPhoto,
  type ListingInput,
} from '@/lib/listings';
import { formatPKR } from '@/lib/format';
import { PROPERTY_TYPES, CITIES, CONDITIONS, type PropertyType, type ListingPurpose, type Condition } from '@/data/properties';

interface DbListingRow {
  id: string;
  title: string;
  property_type: PropertyType;
  purpose: ListingPurpose;
  price: number;
  city: string;
  area: string;
  featured: boolean;
  photos: string[];
  created_at: string;
}

export function ListingsManager() {
  const [listings, setListings] = useState<DbListingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false });
      if (fetchError) throw fetchError;
      setListings((data as DbListingRow[]) ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string) => {
    const listing = listings.find((l) => l.id === id);
    try {
      if (listing?.photos) {
        await Promise.all(listing.photos.map((url) => deleteListingPhoto(url).catch(() => {})));
      }
      await deleteListing(id);
      setConfirmDelete(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete listing');
    }
  };

  const filtered = listings.filter((l) =>
    l.title.toLowerCase().includes(search.toLowerCase()) ||
    l.city.toLowerCase().includes(search.toLowerCase()) ||
    l.area.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-forest-700">Listings Management</h2>
          <p className="mt-1 text-sm text-forest-400">Add, edit, and delete property listings</p>
        </div>
        <button
          onClick={() => { setEditingId(null); setShowForm(true); }}
          className="flex items-center justify-center gap-2 rounded-lg bg-gold-400 px-5 py-2.5 text-sm font-semibold text-forest-700 transition-all hover:bg-gold-300 hover:shadow-lg hover:shadow-gold-400/30"
        >
          <Plus className="h-4 w-4" />
          Add Listing
        </button>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-lg bg-rose-50 p-3 text-sm text-rose-600">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto"><X className="h-4 w-4" /></button>
        </div>
      )}

      {showForm && (
        <ListingForm
          editingId={editingId}
          onClose={() => { setShowForm(false); setEditingId(null); }}
          onSaved={() => { setShowForm(false); setEditingId(null); load(); }}
        />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-forest-700/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertCircle className="h-6 w-6" />
              <h3 className="font-display text-lg font-bold">Delete Listing?</h3>
            </div>
            <p className="mt-2 text-sm text-forest-400">This will permanently delete the listing and all its photos. This cannot be undone.</p>
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
          <ImageIcon className="h-12 w-12 text-forest-200" />
          <h3 className="mt-4 font-display text-lg font-semibold text-forest-700">No listings yet</h3>
          <p className="mt-1 text-sm text-forest-400">Click "Add Listing" to create your first property listing</p>
        </div>
      ) : (
        <>
          <div className="mb-4 relative max-w-sm">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-forest-300" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, city, or area..."
              className="input-field pl-11"
            />
          </div>

          <div className="overflow-x-auto rounded-xl bg-white card-shadow">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-cream-200 bg-cream-50 text-xs uppercase tracking-wider text-forest-400">
                  <th className="px-4 py-3 font-semibold">Photo</th>
                  <th className="px-4 py-3 font-semibold">Title</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Purpose</th>
                  <th className="px-4 py-3 font-semibold">Price</th>
                  <th className="px-4 py-3 font-semibold">Location</th>
                  <th className="px-4 py-3 font-semibold">Featured</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((listing) => (
                  <tr key={listing.id} className="border-b border-cream-100 transition-colors hover:bg-cream-50">
                    <td className="px-4 py-3">
                      {listing.photos?.[0] ? (
                        <img src={listing.photos[0]} alt={listing.title} className="h-12 w-16 rounded-lg object-cover" />
                      ) : (
                        <div className="flex h-12 w-16 items-center justify-center rounded-lg bg-cream-100">
                          <ImageIcon className="h-5 w-5 text-forest-200" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-forest-700">{listing.title}</td>
                    <td className="px-4 py-3 text-forest-500">{listing.property_type}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${listing.purpose === 'rent' ? 'bg-forest-500 text-cream-100' : 'bg-gold-400 text-forest-700'}`}>
                        {listing.purpose === 'rent' ? 'For Rent' : 'For Sale'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-forest-600">{formatPKR(listing.price)}</td>
                    <td className="px-4 py-3 text-forest-500">{listing.area}, {listing.city}</td>
                    <td className="px-4 py-3">
                      {listing.featured && <Star className="h-4 w-4 fill-gold-400 text-gold-400" />}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { setEditingId(listing.id); setShowForm(true); }}
                          className="rounded-lg p-2 text-forest-500 transition-colors hover:bg-forest-50 hover:text-forest-700"
                          aria-label="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(listing.id)}
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

// ── Listing Form ──────────────────────────────────────────────

function ListingForm({ editingId, onClose, onSaved }: {
  editingId: string | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<ListingInput>({
    title: '', description: '', price: 0, property_type: 'House',
    city: '', area: '', size_marla: null, size_kanal: null, size_sqft: null,
    bedrooms: null, bathrooms: null, furnished: null, purpose: 'sale',
    year_built: null, condition: null, featured: false, photos: [],
  });
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingExisting, setLoadingExisting] = useState(!!editingId);

  useEffect(() => {
    if (!editingId) return;
    (async () => {
      try {
        const { data, error: fetchError } = await supabase.from('listings').select('*').eq('id', editingId).single();
        if (fetchError) throw fetchError;
        const d = data as Record<string, unknown>;
        setForm({
          title: d.title as string,
          description: d.description as string,
          price: d.price as number,
          property_type: d.property_type as PropertyType,
          city: d.city as string,
          area: d.area as string,
          size_marla: d.size_marla as number | null,
          size_kanal: d.size_kanal as number | null,
          size_sqft: d.size_sqft as number | null,
          bedrooms: d.bedrooms as number | null,
          bathrooms: d.bathrooms as number | null,
          furnished: d.furnished as boolean | null,
          purpose: d.purpose as ListingPurpose,
          year_built: d.year_built as number | null,
          condition: d.condition as Condition | null,
          featured: d.featured as boolean,
          photos: d.photos as string[],
        });
        setPhotoUrls(d.photos as string[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load listing');
      } finally {
        setLoadingExisting(false);
      }
    })();
  }, [editingId]);

  const update = <K extends keyof ListingInput>(key: K, value: ListingInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleUpload = async (files: FileList) => {
    setUploading(true);
    setError(null);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const url = await uploadListingPhoto(file);
        urls.push(url);
      }
      const newPhotos = [...photoUrls, ...urls];
      setPhotoUrls(newPhotos);
      update('photos', newPhotos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload photos');
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (index: number) => {
    const updated = photoUrls.filter((_, i) => i !== index);
    setPhotoUrls(updated);
    update('photos', updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = { ...form, photos: photoUrls };
      if (editingId) {
        await updateListing(editingId, payload);
      } else {
        await createListing(payload);
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save listing');
    } finally {
      setSaving(false);
    }
  };

  if (loadingExisting) {
    return (
      <div className="mb-6 flex items-center justify-center rounded-xl bg-white p-12 card-shadow">
        <Loader2 className="h-8 w-8 animate-spin text-gold-400" />
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-xl bg-white p-6 card-shadow">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="font-display text-lg font-bold text-forest-700">
          {editingId ? 'Edit Listing' : 'Add New Listing'}
        </h3>
        <button onClick={onClose} className="rounded-lg p-2 text-forest-400 hover:bg-cream-50">
          <X className="h-5 w-5" />
        </button>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-lg bg-rose-50 p-3 text-sm text-rose-600">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Photos */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-forest-400">Property Photos</label>
          <div className="flex flex-wrap gap-3">
            {photoUrls.map((url, i) => (
              <div key={i} className="group relative h-24 w-32 overflow-hidden rounded-lg">
                <img src={url} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="absolute inset-0 flex items-center justify-center bg-forest-700/60 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Trash2 className="h-5 w-5 text-white" />
                </button>
                {i === 0 && (
                  <span className="absolute bottom-1 left-1 rounded bg-gold-400 px-1.5 py-0.5 text-[10px] font-bold text-forest-700">Cover</span>
                )}
              </div>
            ))}
            <label className="flex h-24 w-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-cream-300 transition-colors hover:border-gold-400 hover:bg-cream-50">
              {uploading ? (
                <Loader2 className="h-6 w-6 animate-spin text-gold-400" />
              ) : (
                <>
                  <ImageIcon className="h-6 w-6 text-forest-300" />
                  <span className="mt-1 text-xs text-forest-400">Upload</span>
                </>
              )}
              <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => e.target.files && handleUpload(e.target.files)} />
            </label>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-forest-400">Title *</label>
          <input required value={form.title} onChange={(e) => update('title', e.target.value)} className="input-field" placeholder="e.g. 5 Marla House in DHA Phase 5" />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-forest-400">Description *</label>
          <textarea required value={form.description} onChange={(e) => update('description', e.target.value)} rows={4} className="input-field resize-none" placeholder="Full property description..." />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-forest-400">Purpose *</label>
            <select value={form.purpose} onChange={(e) => update('purpose', e.target.value as ListingPurpose)} className="select-field">
              <option value="sale">For Sale</option>
              <option value="rent">For Rent</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-forest-400">Property Type *</label>
            <select value={form.property_type} onChange={(e) => update('property_type', e.target.value as PropertyType)} className="select-field">
              {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-forest-400">
            Price (PKR) * {form.purpose === 'rent' && '(monthly rent)'}
          </label>
          <input type="number" required min={0} value={form.price || ''} onChange={(e) => update('price', parseInt(e.target.value) || 0)} className="input-field" placeholder="e.g. 15000000" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-forest-400">City *</label>
            <select required value={form.city} onChange={(e) => update('city', e.target.value)} className="select-field">
              <option value="">Select city</option>
              {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-forest-400">Area *</label>
            <input required value={form.area} onChange={(e) => update('area', e.target.value)} className="input-field" placeholder="e.g. DHA Phase 5" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-forest-400">Size (Marla)</label>
            <input type="number" step="0.5" min={0} value={form.size_marla ?? ''} onChange={(e) => update('size_marla', e.target.value ? parseFloat(e.target.value) : null)} className="input-field" placeholder="5" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-forest-400">Size (Kanal)</label>
            <input type="number" step="0.5" min={0} value={form.size_kanal ?? ''} onChange={(e) => update('size_kanal', e.target.value ? parseFloat(e.target.value) : null)} className="input-field" placeholder="1" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-forest-400">Size (Sqft)</label>
            <input type="number" min={0} value={form.size_sqft ?? ''} onChange={(e) => update('size_sqft', e.target.value ? parseInt(e.target.value) : null)} className="input-field" placeholder="1350" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-forest-400">Bedrooms</label>
            <input type="number" min={0} value={form.bedrooms ?? ''} onChange={(e) => update('bedrooms', e.target.value ? parseInt(e.target.value) : null)} className="input-field" placeholder="3" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-forest-400">Bathrooms</label>
            <input type="number" min={0} value={form.bathrooms ?? ''} onChange={(e) => update('bathrooms', e.target.value ? parseInt(e.target.value) : null)} className="input-field" placeholder="2" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-forest-400">Year Built</label>
            <input type="number" min={1900} max={2030} value={form.year_built ?? ''} onChange={(e) => update('year_built', e.target.value ? parseInt(e.target.value) : null)} className="input-field" placeholder="2023" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-forest-400">Condition</label>
            <select value={form.condition ?? ''} onChange={(e) => update('condition', (e.target.value || null) as Condition | null)} className="select-field">
              <option value="">N/A</option>
              {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-forest-400">Furnished</label>
            <select value={form.furnished === null ? '' : form.furnished ? 'yes' : 'no'} onChange={(e) => update('furnished', e.target.value === '' ? null : e.target.value === 'yes')} className="select-field">
              <option value="">N/A</option>
              <option value="yes">Furnished</option>
              <option value="no">Unfurnished</option>
            </select>
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.featured} onChange={(e) => update('featured', e.target.checked)} className="h-4 w-4 rounded border-cream-300 text-gold-400 focus:ring-gold-400/30" />
          <span className="text-sm font-medium text-forest-600">Feature on homepage</span>
        </label>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-cream-300 px-4 py-2.5 text-sm font-medium text-forest-600 hover:bg-cream-50">Cancel</button>
          <button type="submit" disabled={saving} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-forest-600 px-4 py-2.5 text-sm font-semibold text-cream-100 hover:bg-forest-700 disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {editingId ? 'Update Listing' : 'Create Listing'}
          </button>
        </div>
      </form>
    </div>
  );
}
