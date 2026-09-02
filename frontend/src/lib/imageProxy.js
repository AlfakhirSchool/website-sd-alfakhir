// Shared between client and server code — pure string helpers, no imports
// that need to stay server-only.

// Sanity's asset CDN enforces the dataset's visibility just like the
// document API: once the dataset is private, cdn.sanity.io URLs need auth
// too. Anything that isn't a Sanity CDN URL (an externalImage on Drive/
// ImgBB, a local /public path, a data: URI) is left untouched.
export function proxyImageUrl(url) {
    if (!url || typeof url !== 'string') return url;
    if (!url.includes('cdn.sanity.io')) return url;
    return `/api/image?url=${encodeURIComponent(url)}`;
}

// Walks a GROQ query result and rewrites every Sanity CDN URL string it
// finds (imageUrl fields, nested asset urls, etc) to go through our image
// proxy, so the browser never talks to cdn.sanity.io directly.
export function proxifySanityUrls(value) {
    if (Array.isArray(value)) return value.map(proxifySanityUrls);
    if (value && typeof value === 'object') {
        const out = {};
        for (const [k, v] of Object.entries(value)) out[k] = proxifySanityUrls(v);
        return out;
    }
    if (typeof value === 'string' && value.startsWith('https://cdn.sanity.io/')) {
        return proxyImageUrl(value);
    }
    return value;
}
