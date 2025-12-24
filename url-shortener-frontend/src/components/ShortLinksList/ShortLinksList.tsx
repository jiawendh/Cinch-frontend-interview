'use client';

import { useEffect, useState } from 'react';
import ShortLinkItem from '@/components/ShortLinkItem/ShortLinkItem';

type ShortLink = {
  id: string;
  original_url: string;
  short_url: string;
  created_at: string;
};

export default function ShortLinksList() {
  const [links, setLinks] = useState<ShortLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/shortlinks');
        if (!res.ok) {
          throw new Error('Failed to fetch short links');
        }

        const data = await res.json();
        const sorted = [...data].sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
        );
        
        setLinks(sorted);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLinks();
  }, []);

  if (loading) return <p>Please wait, loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  if (links.length === 0) {
    return <p className="text-zinc-500">No short links created yet.</p>;
  }

  return (
    <div className="overflow-x-auto w-full text-sm">
      <table className="w-full">
        <thead className="">
          <tr>
            <th className="text-left p-3">Original URL</th>
            <th className="text-left p-3">Shorten URL</th>
            <th className="text-left p-3">Created On</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {links.map((link) => (
            <ShortLinkItem key={link.id} link={link}/>
          ))}
        </tbody>
      </table>
    </div>
  );
}
