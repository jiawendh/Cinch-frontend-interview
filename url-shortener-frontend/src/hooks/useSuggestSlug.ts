import { useState } from 'react';
import { suggestSlug } from '@/lib/api';

export function useSuggestSlug() {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = async (slug: string) => {
    if (!slug) return;

    setLoading(true);
    setError(null);

    try {
      const data = await suggestSlug(slug);

      if (!data.available) {
        setSuggestions(data.suggestions ?? []);
      } else {
        setSuggestions([]);
      }
    } catch (err) {
      console.error('Failed to fetch slug suggestions:', err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return { refresh, suggestions, loading, error };
}
