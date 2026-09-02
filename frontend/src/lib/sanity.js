import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.VITE_SANITY_PROJECT_ID || 'dkgrjdjy';
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.VITE_SANITY_DATASET || 'production';

// Client-safe, read-only. No token here, ever — this file is imported from
// "use client" components and gets bundled into the browser JS. Writes go
// through src/app/api/** routes using src/lib/sanityServer.js instead.
export const client = createClient({
  projectId,
  dataset,
  useCdn: true, // Enabled for performance
  apiVersion: '2024-03-12',
  perspective: 'published',
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
