'use client';

import { useState } from 'react';
import Clipboard from '@/icons/clipboard';

export default function Copy({ link } : any) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = async (url: string, id: string) => {
    await navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <button
      onClick={() => copyToClipboard(link.short_url, link.id)}
      className="flex items-center justify-center gap-1 w-full min-w-19 px-2 py-1.5 text-xs text-zinc-400 rounded-full transition-colors border hover:bg-black/[.04] dark:hover:bg-[#1a1a1a] border border-solid border-black/[.08] dark:border-white/[.145] hover:border-transparent cursor-pointer"
    >
      <Clipboard height={12} width={12} className='stroke-zinc-500 cursor-pointer' />
      <span>{copiedId === link.id ? 'Copied!' : 'Copy'}</span>
    </button>
  );
}
