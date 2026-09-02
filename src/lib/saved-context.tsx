import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Property } from '@/data/properties';

interface SavedItem {
  type: 'property' | 'search';
  propertyId?: string;
  searchLabel?: string;
  savedAt: number;
}

interface SavedContextValue {
  saved: SavedItem[];
  savedProperties: string[];
  toggleProperty: (propertyId: string) => void;
  isSaved: (propertyId: string) => boolean;
  addSearch: (label: string) => void;
  removeSaved: (item: SavedItem) => void;
}

const SavedContext = createContext<SavedContextValue | null>(null);

export function SavedProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState<SavedItem[]>([]);

  const toggleProperty = useCallback((propertyId: string) => {
    setSaved((prev) => {
      const exists = prev.some((s) => s.propertyId === propertyId);
      if (exists) {
        return prev.filter((s) => s.propertyId !== propertyId);
      }
      return [...prev, { type: 'property' as const, propertyId, savedAt: Date.now() }];
    });
  }, []);

  const isSaved = useCallback(
    (propertyId: string) => saved.some((s) => s.propertyId === propertyId),
    [saved],
  );

  const addSearch = useCallback((label: string) => {
    setSaved((prev) => {
      if (prev.some((s) => s.type === 'search' && s.searchLabel === label)) return prev;
      return [...prev, { type: 'search' as const, searchLabel: label, savedAt: Date.now() }];
    });
  }, []);

  const removeSaved = useCallback((item: SavedItem) => {
    setSaved((prev) =>
      prev.filter((s) => !(s.propertyId === item.propertyId && s.searchLabel === item.searchLabel)),
    );
  }, []);

  return (
    <SavedContext.Provider
      value={{ saved, savedProperties: saved.filter((s) => s.type === 'property').map((s) => s.propertyId!), toggleProperty, isSaved, addSearch, removeSaved }}
    >
      {children}
    </SavedContext.Provider>
  );
}

export function useSaved() {
  const ctx = useContext(SavedContext);
  if (!ctx) throw new Error('useSaved must be used within SavedProvider');
  return ctx;
}

export type { SavedItem };
export type { Property };
