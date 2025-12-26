import { useState } from 'react';
import { CreateShortLinkRequest } from '@/utils/validation';
import { createShortlink } from '@/lib/api';

export const useUrlShortener = (onCreated: (data: any) => void) => {
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (data: CreateShortLinkRequest) => {
    setError(null);
    setLoading(true);

    try {
      const json = await createShortlink(data);
      setResult(json.short_url);
      onCreated(json);
    } catch (err: any) {
      setResult(null);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { result, error, loading, submit, setResult };
};
