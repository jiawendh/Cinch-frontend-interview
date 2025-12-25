import { z } from 'zod';

export const ShortLinkRequestSchema = z.object({
  original_url: z.string().url('Please enter a valid URL'),
});

export type CreateShortLinkRequest = {
  original_url: string;
};

export type CreateShortLinkResponse = {
  id: string;
  original_url: string;
  short_url: string;
  created_at: string;
};

export type ApiError = {
  error: string;
};
