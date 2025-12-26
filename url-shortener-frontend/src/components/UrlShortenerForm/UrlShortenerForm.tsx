'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ShortLinkRequestSchema, CreateShortLinkRequest } from '@/utils/validation';
import { Enter, Loading, ExternalLink, Clipboard } from "@/icons";
import { copyToClipboard } from '@/utils/copyToClipboard';
import { useUrlShortener } from '@/hooks/useUrlShortener';
import { CreateShortLinkProps } from '@/types';

export default function UrlShortenerForm({ onCreated }: CreateShortLinkProps) {
  const { result, error, loading, submit } = useUrlShortener(onCreated);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateShortLinkRequest>({
    resolver: zodResolver(ShortLinkRequestSchema),
  });

  const onSubmit = async (data: CreateShortLinkRequest) => {
    await submit(data);
    setValue('original_url', '');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
      <div className='flex gap-2 w-full pb-2'>
        <div className='grow flex flex-col gap-2'>
          {/* Original URL input field */}
          <input
            type="text"
            placeholder="https://example.com"
            {...register('original_url')}
            className="w-full border rounded-full px-3 py-2 transition-colors border border-solid border-white/[.145] hover:border-white/[.25]"
          />
          <p className="text-red-500 text-sm pl-3 min-h-6">{errors.original_url && errors.original_url.message}</p>
        </div>

        {/* Create short link button */}
        <button
          aria-label='create short link'
          type="submit"
          disabled={isSubmitting || loading}
          className="h-12 text-zinc-400 rounded-full px-5 py-2 transition-colors hover:bg-[#1a1a1a] border border-solid border-white/[.145] hover:border-transparent cursor-pointer"
        >
          {loading ? <Loading height={16} width={16} className='stroke-zinc-500' /> :
          <Enter height={16} width={16} className='stroke-zinc-500' />}
        </button>
      </div>

      {/* Generated short link result */}
      <div className={"w-full min-h-12 pl-3 transition-opacity duration-500 " + (result && !loading ? "opacity-100" : "opacity-0")}>
        {result && (
          <>
            <p className="text-zinc-400">Here you go.</p>
            <div className="flex items-center gap-2 w-full">
              <p className="text-white break-all">
                <a href={result} target="_blank" rel="noopener noreferrer">{result}</a>
              </p>
              {/* Open in new tab */}
              <a href={result} target="_blank" rel="noopener noreferrer">
                <ExternalLink height={16} width={16} className='stroke-zinc-500 cursor-pointer' />
              </a>
              {/* Copy to clipboard */}
              <button onClick={() => copyToClipboard(result)} className="cursor-pointer">
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
