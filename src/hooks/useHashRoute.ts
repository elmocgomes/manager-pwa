import { useEffect, useState } from 'react';

// Read the current hash route (without the leading '#') and re-render on change.
// Examples: '' (dashboard), 'admin', 'admin/targets'.
function current(): string {
  return window.location.hash.replace(/^#\/?/, '');
}

export function useHashRoute(): string {
  const [route, setRoute] = useState(current);
  useEffect(() => {
    const onChange = () => setRoute(current());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}

// Navigate by setting the hash (triggers hashchange listeners).
export function navigate(route: string) {
  window.location.hash = route ? `#${route}` : '';
}
