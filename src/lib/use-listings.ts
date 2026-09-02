import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Property, ListingPurpose } from '@/data/properties';

interface DbListing {
  id: string;
  title: string;
  description: string;
  price: number;
  property_type: Property['type'];
  city: string;
  area: string;
  size_marla: number | null;
  size_kanal: number | null;
  size_sqft: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  furnished: boolean | null;
  purpose: ListingPurpose;
  year_built: number | null;
  condition: Property['condition'] | null;
  featured: boolean;
  photos: string[];
  created_at: string;
}

function mapToListing(row: DbListing): Property {
  return {
    id: row.id,
    title: row.title,
    type: row.property_type,
    purpose: row.purpose,
    price: row.price,
    rent: row.purpose === 'rent' ? row.price : undefined,
    city: row.city,
    area: row.area,
    beds: row.bedrooms ?? 0,
    baths: row.bathrooms ?? 0,
    marla: Number(row.size_marla ?? 0),
    sqft: row.size_sqft ?? 0,
    image: row.photos?.[0] ?? '',
    gallery: row.photos,
    yearBuilt: row.year_built ?? 0,
    condition: row.condition ?? 'Good',
    furnished: row.furnished ?? undefined,
    featured: row.featured,
    description: row.description,
  };
}

export function useListings(purpose?: ListingPurpose) {
  const [listings, setListings] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase.from('listings').select('*').order('created_at', { ascending: false });
      if (purpose) query = query.eq('purpose', purpose);

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      setListings((data as DbListing[]).map(mapToListing));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load listings');
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [purpose]);

  useEffect(() => { load(); }, [load]);

  return { listings, loading, error, reload: load };
}

export function useFeaturedListings() {
  const [listings, setListings] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from('listings')
          .select('*')
          .eq('featured', true)
          .order('created_at', { ascending: false })
          .limit(6);
        if (error) throw error;
        setListings((data as DbListing[]).map(mapToListing));
      } catch {
        setListings([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { listings, loading };
}

export function useAllListings() {
  const [listings, setListings] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from('listings')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setListings((data as DbListing[]).map(mapToListing));
      } catch {
        setListings([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { listings, loading };
}
