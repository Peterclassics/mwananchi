import { useEffect, useState } from 'react';
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(
    () => window.matchMedia?.(query).matches ?? false,
  );
  useEffect(() => {
    const media = window.matchMedia?.(query);
    if (!media) return;
    const changed = () => setMatches(media.matches);
    changed();
    media.addEventListener('change', changed);
    return () => media.removeEventListener('change', changed);
  }, [query]);
  return matches;
}
