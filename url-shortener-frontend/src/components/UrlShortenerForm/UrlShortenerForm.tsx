'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateShortLinkRequest, ShortLinkRequestSchema, CreateShortLinkProps } from '@/types';
import { copyToClipboard } from '@/utils/utils';
import { Enter, Loading, ExternalLink, Clipboard } from "@/icons";

export default function UrlShortenerForm({ onCreated }: CreateShortLinkProps) {
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateShortLinkRequest>({
    resolver: zodResolver(ShortLinkRequestSchema),
  });

  const onSubmit = async (data: CreateShortLinkRequest) => {
    setError(null);
    setResult(null);

    try {
      const res = await fetch('http://localhost:8080/api/shortlinks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error('Failed to create short link');
      }

      const json = await res.json();
      setResult(json.short_url);
      onCreated(json);
      reset();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full"
    >
      <div className='flex gap-2 w-full pb-10'>
        {/* Input */}
        <div className='grow flex flex-col gap-2'>
          <input
            type="text"
            placeholder="https://example.com"
            {...register('original_url')}
            className="w-full border rounded-full px-3 py-2 transition-colors border border-solid border-black/[.08] dark:border-white/[.145] hover:border-white/[.145] dark:hover:border-white/[.25]"
          />
          {errors.original_url && (
            <p className="text-red-500 text-sm pl-3">{errors.original_url.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={"w-full h-12 md:w-auto text-zinc-400 rounded-full px-5 py-2 transition-colors hover:bg-black/[.04] dark:hover:bg-[#1a1a1a] border border-solid border-black/[.08] dark:border-white/[.145] hover:border-transparent disabled:opacity-50 cursor-pointer"}
        >
          {isSubmitting ?
            <Loading height={16} width={16} className='stroke-zinc-500' /> :
            <Enter height={16} width={16} className='stroke-zinc-500' />
          }
        </button>
      </div>

      {/* Feedback */}
      {result && (
        <div className="w-full pl-2 opacity-0 transition-opacity duration-500 hover:opacity-100">
          <p className="text-zinc-400">
            Here you go.
          </p>
          <div className="flex items-center gap-2 w-full">
            <p className="text-white break-all">
              <a
                href={result}
                target="_blank"
                rel="noopener noreferrer"
              >
                {result}
              </a>
            </p>
            <a
              href={result}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink height={16} width={16} className='stroke-zinc-500 cursor-pointer' />
            </a>
            <button
              onClick={() => copyToClipboard(result)}
              className="cursor-pointer"
            >
              <Clipboard height={16} width={16} className='stroke-zinc-500 cursor-pointer' />
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-red-600">{error}</p>}
    </form>
  );
}
