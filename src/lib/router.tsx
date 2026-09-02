import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type Route =
  | { name: 'home' }
  | { name: 'buy' }
  | { name: 'rent' }
  | { name: 'sell' }
  | { name: 'calculator' }
  | { name: 'saved' }
  | { name: 'contact' }
  | { name: 'admin' }
  | { name: 'property'; id: string };

interface RouterContextValue {
  route: Route;
  navigate: (route: Route) => void;
}

const RouterContext = createContext<RouterContextValue | null>(null);

function parseHash(): Route {
  const hash = window.location.hash.replace(/^#\/?/, '');
  const parts = hash.split('/');
  switch (parts[0]) {
    case '':
    case 'home':
      return { name: 'home' };
    case 'buy':
      return { name: 'buy' };
    case 'rent':
      return { name: 'rent' };
    case 'sell':
      return { name: 'sell' };
    case 'calculator':
      return { name: 'calculator' };
    case 'saved':
      return { name: 'saved' };
    case 'contact':
      return { name: 'contact' };
    case 'admin':
      return { name: 'admin' };
    case 'property':
      return { name: 'property', id: parts[1] || '' };
    default:
      return { name: 'home' };
  }
}

function routeToHash(route: Route): string {
  switch (route.name) {
    case 'home':
      return '#/';
    case 'property':
      return `#/property/${route.id}`;
    default:
      return `#/${route.name}`;
  }
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<Route>(() => parseHash());

  useEffect(() => {
    const handler = () => {
      setRoute(parseHash());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  const navigate = (newRoute: Route) => {
    window.location.hash = routeToHash(newRoute);
  };

  return <RouterContext.Provider value={{ route, navigate }}>{children}</RouterContext.Provider>;
}

export function useRouter() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useRouter must be used within RouterProvider');
  return ctx;
}
