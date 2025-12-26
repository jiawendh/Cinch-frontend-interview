'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ShortLinkRequestSchema, CreateShortLinkRequest } from '@/utils/validation';
import { Enter, Loading, ExternalLink, Clipboard } from "@/icons";
import { copyToClipboard } from '@/utils/copyToClipboard';
import { useShortlinkForm } from '@/hooks/useShortlinkForm';
import { CreateShortLinkProps } from '@/types';

export default function UrlShortenerForm({ onCreated }: CreateShortLinkProps) {
  const { result, error, loading, submit } = useShortlinkForm(onCreated);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateShortLinkRequest>({
    resolver: zodResolver(ShortLinkRequestSchema),
  });

  const onSubmit = async (data: CreateShortLinkRequest) => {
    await submit(data);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
      <div className='flex gap-2 w-full pb-10'>
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

      <div className={"w-full min-h-12 pl-3 transition-opacity duration-500 " + (result && !loading ? "opacity-100" : "opacity-0")}>
        {result && (
          <>
            <p className="text-zinc-400">Here you go.</p>
            <div className="flex items-center gap-2 w-full">
              <p className="text-white break-all">
                <a href={result} target="_blank" rel="noopener noreferrer">{result}</a>
              </p>
              <a href={result} target="_blank" rel="noopener noreferrer">
                <ExternalLink height={16} width={16} className='stroke-zinc-500 cursor-pointer' />
              </a>
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
