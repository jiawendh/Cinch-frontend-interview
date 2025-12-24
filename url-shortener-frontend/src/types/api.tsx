import { z } from 'zod';

const requestSchema = z.object({
  original_url: z.string().url('Please enter a valid URL'),
});

export type CreateShortLinkRequest = z.infer<typeof requestSchema>;
export { requestSchema };
