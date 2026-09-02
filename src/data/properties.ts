export type PropertyType = 'House' | 'Flat' | 'Plot' | 'Commercial' | 'Farmhouse';
export type ListingPurpose = 'sale' | 'rent';
export type Condition = 'New' | 'Excellent' | 'Good' | 'Needs Renovation';

export interface Property {
  id: string;
  title: string;
  type: PropertyType;
  purpose: ListingPurpose;
  price: number;
  rent?: number;
  city: string;
  area: string;
  beds: number;
  baths: number;
  marla: number;
  sqft: number;
  image: string;
  gallery?: string[];
  yearBuilt: number;
  condition: Condition;
  furnished?: boolean;
  featured?: boolean;
  description: string;
}

export const CITIES = ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad'] as const;
export const PROPERTY_TYPES: PropertyType[] = ['House', 'Flat', 'Plot', 'Commercial', 'Farmhouse'];
export const CONDITIONS: Condition[] = ['New', 'Excellent', 'Good', 'Needs Renovation'];

export const HERO_IMAGE = 'https://images.pexels.com/photos/5414582/pexels-photo-5414582.jpeg?auto=compress&cs=tinysrgb&w=1920';

export const PROPERTY_TYPE_IMAGES: Record<PropertyType, string> = {
  House: 'https://images.pexels.com/photos/7031406/pexels-photo-7031406.jpeg?auto=compress&cs=tinysrgb&w=800',
  Flat: 'https://images.pexels.com/photos/33244441/pexels-photo-33244441.jpeg?auto=compress&cs=tinysrgb&w=800',
  Plot: 'https://images.pexels.com/photos/4525178/pexels-photo-4525178.jpeg?auto=compress&cs=tinysrgb&w=800',
  Commercial: 'https://images.pexels.com/photos/946310/pexels-photo-946310.jpeg?auto=compress&cs=tinysrgb&w=800',
  Farmhouse: 'https://images.pexels.com/photos/31316043/pexels-photo-31316043.jpeg?auto=compress&cs=tinysrgb&w=800',
};
