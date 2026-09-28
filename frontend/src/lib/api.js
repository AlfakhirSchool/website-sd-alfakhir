import { urlFor as sanityUrlFor } from './sanity';
import { proxyImageUrl } from './imageProxy';

// Fetches public content through our own /api/content proxy instead of
// talking to Sanity directly — works whether the dataset is public or
// private, and keeps the query allowlist server-side (see
// src/app/api/content/route.js).
export const apiFetch = async (endpoint) => {
    const res = await fetch(`/api/content?endpoint=${encodeURIComponent(endpoint)}`);
    if (!res.ok) return endpoint.includes('/students') || endpoint.includes('/gallery') || endpoint.includes('/facilities') || endpoint.includes('/staff') || endpoint.includes('/news') || endpoint.includes('year-configs') ? [] : null;
    return await res.json();
};

// Chainable like the real Sanity image builder (`.width().height().auto().url()`),
// but the final `.url()` returns a same-origin /api/image proxy URL instead
// of a direct cdn.sanity.io link — the browser never needs a Sanity token.
function wrapBuilder(builder) {
    return {
        width: (...args) => wrapBuilder(builder.width(...args)),
        height: (...args) => wrapBuilder(builder.height(...args)),
        auto: (...args) => wrapBuilder(builder.auto(...args)),
        url: () => proxyImageUrl(builder.url()),
    };
}

export const urlFor = (source) => {
    if (typeof source === 'string' && source.startsWith('http')) {
        return { url: () => proxyImageUrl(source) };
    }
    const builder = sanityUrlFor(source);
    if (!builder || typeof builder.url !== 'function') return { url: () => '' };
    return wrapBuilder(builder);
};
