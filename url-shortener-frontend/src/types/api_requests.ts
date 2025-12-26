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
