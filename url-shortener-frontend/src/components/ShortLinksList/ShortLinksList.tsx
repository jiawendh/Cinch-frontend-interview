'use client';

import { useEffect, useState } from 'react';
import { fetchShortlinks } from '@/lib/api';
import { HistoryProps } from '@/types';
import ShortLinkItem from '@/components/ShortLinkItem/ShortLinkItem';

export default function ShortLinksList({ isOpen, links, setLinks }: HistoryProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLinks = async () => {
    setLoading(true);
    try {
      const sortedLinks = await fetchShortlinks();
      setLinks(sortedLinks);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (!isOpen) return;
    fetchLinks();
  }, [isOpen]);

  if (loading) {
    return <p className="text-zinc-500 text-sm sm:text-center pl-3 animate-pulse">Please wait, loading...</p>;
  }
  if (error) {
    return <p className="text-red-500 text-sm sm:text-center pl-3">{error}</p>;
  }
  if (links.length === 0) {
    return <p className="text-zinc-500 text-sm sm:text-center pl-3">No short links created yet.</p>;
  }

  return (
    <div className="w-full text-sm">
      <table className="w-full">
        <thead className="text-xs md:text-sm text-zinc-300">
          <tr>
            <th className="text-left p-2 md:p-3">Original URL</th>
            <th className="text-left p-2 md:p-3">Shorten URL</th>
            <th className="text-left p-2 md:p-3">Created On</th>
            <th className="text-left p-2 md:p-3">Actions</th>
          </tr>
        </thead>

        <tbody>
          {links.map((link) => (
            link ? <ShortLinkItem key={link.id} link={link}/> : null
          ))}
        </tbody>
      </table>
    </div>
  );
}
