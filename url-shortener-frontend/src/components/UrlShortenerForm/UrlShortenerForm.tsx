'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ShortLinkRequestSchema, CreateShortLinkRequest } from '@/utils/validation';
import { Enter, Loading, ExternalLink, Clipboard } from "@/icons";
import { copyToClipboard } from '@/utils/copyToClipboard';
import { useUrlShortener } from '@/hooks/useUrlShortener';
import { CreateShortLinkProps, SlugValidationState } from '@/types';
import CustomSlugForm from './CustomSlugForm';

export default function UrlShortenerForm({ onCreated }: CreateShortLinkProps) {
  const { result, error, loading, submit } = useUrlShortener(onCreated);
  const [useCustomSlug, setUseCustomSlug] = useState(false);
  const [customSlug, setCustomSlug] = useState('');
  const [slugValidation, setSlugValidation] = useState<SlugValidationState>({ status: 'idle' });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateShortLinkRequest>({
    resolver: zodResolver(ShortLinkRequestSchema),
  });

  const onSubmit = async (data: CreateShortLinkRequest) => {
    const payload: CreateShortLinkRequest = data;

    if(slugValidation.status == 'valid' || slugValidation.status == 'idle') {
      if (useCustomSlug && customSlug && customSlug.length >= 3) {
        payload.custom_slug = customSlug;
        setCustomSlug('');
        setSlugValidation({ status: 'idle' });
      }
      await submit(payload);
      setValue('original_url', '');
    }
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

      {/* Custom slug */}
      <div className='pb-10'>
        <CustomSlugForm
          enabled={useCustomSlug}
          customSlug={customSlug}
          validation={slugValidation}
          onToggle={setUseCustomSlug}
          onSlugChange={setCustomSlug}
          onValidationChange={setSlugValidation}
        />
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
              <a
                href={result}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-full hover:bg-zinc-800 cursor-pointer"
              >
                <ExternalLink height={16} width={16} className='stroke-zinc-500' />
              </a>
              {/* Copy to clipboard */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  copyToClipboard(result);
                }}
                className="p-1.5 rounded-full hover:bg-zinc-800 cursor-pointer"
              >
                <Clipboard height={16} width={16} className='stroke-zinc-500' />
              </button>
            </div>
          </>
        )}
      </div>

      {error && <p className="pl-3 text-red-500 text-sm">{error}</p>}
    </form>
  );
}
