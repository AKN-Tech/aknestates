import { supabase } from '@/lib/supabase';
import type { Property, PropertyType, ListingPurpose, Condition } from '@/data/properties';

export interface ListingInput {
  title: string;
  description: string;
  price: number;
  property_type: PropertyType;
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
  condition: Condition | null;
  featured: boolean;
  photos: string[];
}

interface DbListing {
  id: string;
  title: string;
  description: string;
  price: number;
  property_type: PropertyType;
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
  condition: Condition | null;
  featured: boolean;
  photos: string[];
  created_at: string;
  updated_at: string;
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

export async function fetchListings(): Promise<Property[]> {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as DbListing[]).map(mapToListing);
}

export async function fetchListingsByPurpose(purpose: ListingPurpose): Promise<Property[]> {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('purpose', purpose)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as DbListing[]).map(mapToListing);
}

export async function fetchFeaturedListings(): Promise<Property[]> {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('featured', true)
    .order('created_at', { ascending: false })
    .limit(6);

  if (error) throw error;
  return (data as DbListing[]).map(mapToListing);
}

export async function createListing(input: ListingInput): Promise<Property> {
  const { data, error } = await supabase
    .from('listings')
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return mapToListing(data as DbListing);
}

export async function updateListing(id: string, input: Partial<ListingInput>): Promise<Property> {
  const { data, error } = await supabase
    .from('listings')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return mapToListing(data as DbListing);
}

export async function deleteListing(id: string): Promise<void> {
  const { error } = await supabase
    .from('listings')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function uploadListingPhoto(file: File): Promise<string> {
  const ext = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const filePath = `listings/${fileName}`;

  const { error } = await supabase.storage
    .from('listing-photos')
    .upload(filePath, file, { contentType: file.type });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from('listing-photos')
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}

export async function deleteListingPhoto(url: string): Promise<void> {
  const urlParts = url.split('/listing-photos/');
  if (urlParts.length < 2) return;
  const filePath = urlParts[1];
  await supabase.storage.from('listing-photos').remove([filePath]);
}
