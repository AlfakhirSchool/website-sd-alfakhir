import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.VITE_SANITY_PROJECT_ID || 'dkgrjdjy';
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.VITE_SANITY_DATASET || 'production';
const rawToken = process.env.NEXT_PUBLIC_SANITY_TOKEN || process.env.VITE_SANITY_TOKEN || '';
// Safely check if rawToken is a real Sanity token (starts with 'sk') to avoid sending dummy/placeholder tokens
const validToken = rawToken.startsWith('sk') ? rawToken : undefined;

if (process.env.NODE_ENV === 'development') {
  console.log('Sanity Init:', { 
    projectId, 
    dataset, 
    hasValidToken: !!validToken,
  });
}

// Read-only client — NEVER pass token here so public read queries bypass Bearer header validation entirely!
export const client = createClient({
  projectId,
  dataset,
  useCdn: true, // Enabled for performance
  apiVersion: '2024-03-12',
  perspective: 'published',
});

// Write client (mutation) with automatic retry logic — pass validToken strictly for administrative operations
export const mutationClient = createClient({
  projectId,
  dataset,
  token: validToken,
  useCdn: false,
  apiVersion: '2024-03-12',
  retry: {
    maxRetries: 3,
    delay: (iteration) => iteration * 2000, // Wait 2s, 4s, 6s
  }
});

const builder = imageUrlBuilder(client);

export const urlFor = (source) => {
  if (!source) return '';
  // Check if source is already a URL string
  if (typeof source === 'string' && source.startsWith('http')) {
      return source;
  }
  return builder.image(source);
};
