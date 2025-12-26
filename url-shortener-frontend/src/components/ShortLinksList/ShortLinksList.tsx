'use client';

import { useEffect, useState } from 'react';
import { HistoryProps } from '@/types';
import ShortLinkItem from '@/components/ShortLinkItem/ShortLinkItem';

export default function ShortLinksList({ isOpen, links, setLinks }: HistoryProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      
      const fetchPromise = fetch('http://localhost:8080/api/shortlinks').then(res => {
        if (!res.ok) throw new Error('Failed to fetch short links.');
        else return res.json();
      });
      const delayPromise = new Promise(resolve => setTimeout(resolve, 1000));
      const [fetchedData] = await Promise.all([fetchPromise, delayPromise]);
      
      const sorted = [...fetchedData].sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      );
      
      setLinks(sorted);
    } catch (err: any) {
      if (err instanceof TypeError) {
        setError('Network error. Please try again.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (!isOpen) return;
    fetchLinks();
  }, [isOpen]);

  if (loading) {
    return <p className="text-zinc-500 text-sm text-center animate-pulse">Please wait, loading...</p>;
  }
  if (error) {
    return <p className="text-red-500 text-sm text-center">{error}</p>;
  }
  if (links.length === 0) {
    return <p className="text-zinc-500 text-sm text-center">No short links created yet.</p>;
  }

  return (
    <div className="overflow-x-auto w-full text-sm">
      <table className={"w-full"}>
        <thead className="">
          <tr>
            <th className="text-left p-3">Original URL</th>
            <th className="text-left p-3">Shorten URL</th>
            <th className="text-left p-3">Created On</th>
            <th className="text-left p-3">Actions</th>
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
