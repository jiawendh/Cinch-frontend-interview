import { ShortLink } from '@/types';

export type CreateShortLinkResponse = {
  id: string;
  original_url: string;
  short_url: string;
  created_at: string;
};

export type ApiError = {
  error: string;
};

export type CreateShortLinkProps = {
  onCreated: (link: ShortLink) => void;
};

export type SlugValidationState = {
  status: 'idle' | 'checking' | 'valid' | 'invalid';
  reason?: string;
  suggestions?: string[];
};

export type CustomSlugFormProps = {
  enabled: boolean;
  customSlug: string;
  validation: SlugValidationState;
  onToggle: (enabled: boolean) => void;
  onSlugChange: (slug: string) => void;
  onValidationChange: (state: SlugValidationState) => void;
};

export type SlugValidationResponse = | { valid: true } | {
  valid: false;
  reason: string;
  suggestions?: string[];
};