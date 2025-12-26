import { z } from 'zod';

export const ShortLinkRequestSchema = z.object({
  original_url: z.string().url({ message: 'Please enter a valid URL.' }),
  custom_slug: z.string().optional()
});

export type CreateShortLinkRequest = z.infer<typeof ShortLinkRequestSchema>;
