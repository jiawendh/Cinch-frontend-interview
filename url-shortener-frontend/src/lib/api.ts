import { SlugValidationResponse } from "@/types";
import { CreateShortLinkRequest } from "@/utils/validation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export const createShortlink = async (data: CreateShortLinkRequest) => {
  try {
    const fetchPromise = fetch(`${API_BASE_URL}/api/shortlinks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(res => {
      if (!res.ok) throw new Error('Failed to create short link.');
      return res.json();
    });

    const delayPromise = new Promise(resolve => setTimeout(resolve, 200));
    const [json] = await Promise.all([fetchPromise, delayPromise]);

    return json;
  } catch (err: any) {
    if (err instanceof TypeError) {
      throw new Error('Network error. Please try again.');
    } else {
      throw err;
    }
  }
};

export const fetchShortlinks = async () => {
  try {
    const fetchPromise = fetch(`${API_BASE_URL}/api/shortlinks`).then(res => {
      if (!res.ok) throw new Error('Failed to fetch short links.');
      return res.json();
    });

    const delayPromise = new Promise(resolve => setTimeout(resolve, 1000));
    const [fetchedData] = await Promise.all([fetchPromise, delayPromise]);

    // Sort by created_at descending
    const sorted = [...fetchedData].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return sorted;
  } catch (err: any) {
    if (err instanceof TypeError) {
      throw new Error('Network error. Please try again.');
    } else {
      throw err;
    }
  }
};

export async function validateCustomSlug(customSlug: string): Promise<SlugValidationResponse> {
  const res = await fetch(`${API_BASE_URL}/api/shortlinks/validate`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ custom_slug: customSlug }),
    }
  );

  if (!res.ok) {
    throw new Error('Validation failed');
  }

  return res.json();
}
