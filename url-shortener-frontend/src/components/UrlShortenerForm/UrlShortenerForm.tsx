'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateShortLinkRequest, ShortLinkRequestSchema, CreateShortLinkProps } from '@/types';
import { Enter, Loading, ExternalLink, Clipboard } from "@/icons";
import { copyToClipboard } from '@/utils/utils';

export default function UrlShortenerForm({ onCreated }: CreateShortLinkProps) {
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
    setLoading(true);

    try {
      const fetchPromise = fetch('http://localhost:8080/api/shortlinks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(res => {
        if (!res.ok) throw new Error('Failed to create short link.');
        else return res.json();
      });
      const delayPromise = new Promise(resolve => setTimeout(resolve, 200));
      const [json] = await Promise.all([fetchPromise, delayPromise]);

      setResult(json.short_url);
      onCreated(json);
      reset();
    } catch (err: any) {
      setResult(null);
      if (err instanceof TypeError) {
        setError('Network error. Please try again.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
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
            className="w-full border rounded-full px-3 py-2 transition-colors border border-solid border-white/[.145] hover:border-white/[.25]"
          />
          {errors.original_url && (
            <p className="text-red-500 text-sm pl-3">{errors.original_url.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          aria-label='create short link'
          type="submit"
          disabled={isSubmitting}
          className={"h-12 text-zinc-400 rounded-full px-5 py-2 transition-colors hover:bg-[#1a1a1a] border border-solid border-white/[.145] hover:border-transparent cursor-pointer"}
        >
          {isSubmitting ?
            <Loading height={16} width={16} className='stroke-zinc-500' /> :
            <Enter height={16} width={16} className='stroke-zinc-500' />
          }
        </button>
      </div>

      {/* Feedback */}
      <div className={"w-full min-h-12 pl-3 transition-opacity duration-500 " + (result && !loading ? "opacity-100" : "opacity-0")}>
        {result && (
          <>
            <p className="text-zinc-400">
              Here you go.
            </p>
            <div className="flex items-center gap-2 w-full">
              <p className="text-white break-all">
                <a
                  aria-label="short url"
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
          </>
        )}
      </div>

      {error && <p className="pl-3 text-red-500 text-sm">{error}</p>}
    </form>
  );
}
