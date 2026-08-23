import { Button } from '@mui/material';
import { useEffect, useRef } from 'react';
export function AccessibleLoadMore({
  available,
  loading,
  load,
}: {
  available: boolean;
  loading: boolean;
  load: () => void;
}) {
  const sentinel = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!available || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loading) load();
      },
      { rootMargin: '160px' },
    );
    if (sentinel.current) observer.observe(sentinel.current);
    return () => observer.disconnect();
  }, [available, load, loading]);
  return available ? (
    <Button ref={sentinel} disabled={loading} onClick={load}>
      {loading ? 'Loading more…' : 'Load more'}
    </Button>
  ) : null;
}
