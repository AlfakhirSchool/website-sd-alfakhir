import { createClient } from '@sanity/client';

// Server-only write client. Never import this from a "use client" file —
// the token would get bundled into the browser JS. Only import from
// route.js handlers (src/app/api/**), which always run on the server.

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.VITE_SANITY_PROJECT_ID || 'dkgrjdjy';
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.VITE_SANITY_DATASET || 'production';
const rawToken = process.env.NEXT_PUBLIC_SANITY_TOKEN || process.env.VITE_SANITY_TOKEN || '';
const token = rawToken.startsWith('sk') ? rawToken : undefined;

export const serverClient = createClient({
    projectId,
    dataset,
    token,
    useCdn: false,
    apiVersion: '2024-03-12',
});
