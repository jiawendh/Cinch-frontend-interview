import { useEffect } from 'react';
import { validateCustomSlug } from '@/lib/api';

export function useSlugValidation({
  slug,
  enabled,
  onChange,
}: {
  slug: string;
  enabled: boolean;
  onChange: (state: any) => void;
}) {
  useEffect(() => {
    if (!enabled) return;

    if (!slug || slug.trim().length < 3) {
      onChange({ status: 'idle' });
      return;
    }

    onChange({ status: 'checking' });

    const timeout = setTimeout(async () => {
      try {
        const data = await validateCustomSlug(slug);
        if (data.valid) {
          onChange({ status: 'valid' });
        } else {
          onChange({
            status: 'invalid',
            reason: data.reason,
            suggestions: data.suggestions,
          });
        }
      } catch {
        onChange({ status: 'invalid', reason: 'Validation failed' });
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [slug, enabled]);
}
