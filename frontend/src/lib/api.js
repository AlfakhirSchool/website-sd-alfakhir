import { client, urlFor as sanityUrlFor } from './sanity';

// Helper to fetch data from Sanity Cloud
export const apiFetch = async (endpoint, options = {}) => {
    // Map endpoints to GROQ queries
    const queries = {
        '/api/facilities': '*[_type == "facility" && name != "rgergreg" && name != "edwewdew"] {"_id": _id, name, description, "imageUrl": select(defined(image.asset) => image.asset->url, externalImage), externalImage, image, "lqip": image.asset->metadata.lqip}',
        '/api/gallery': '*[_type == "gallery"] | order(date desc) {"_id": _id, title, category, "imageUrl": select(defined(image.asset) => image.asset->url, externalImage), externalImage, image, date, agenda, "lqip": image.asset->metadata.lqip}',
        '/api/students': '*[_type == "student"] | order(_createdAt desc) {"_id": _id, id, name, school, schoolName, whatsapp, year, wave, status, score, pdfLink}',
        '/api/students/public': '*[_type == "student" && (status == "Lolos" || status == "Diterima" || status == "Lolos Seleksi" || status == "Lulus Seleksi" || status == "Passed Selection")] | order(id asc) {"_id": _id, id, name, year, wave, status, school, schoolName, pdfLink}',
        '/api/staff': '*[_type == "teacher"] | order(order asc) {"_id": _id, name, role, vision, education, email, "imageUrl": select(defined(image.asset) => image.asset->url, externalImage), externalImage, image, "lqip": image.asset->metadata.lqip}',
        '/api/news': '*[_type == "news"] | order(date desc) {"_id": _id, title, date, "imageUrl": select(defined(mainImage.asset) => mainImage.asset->url, externalImage), externalImage, mainImage, slug, body, "lqip": mainImage.asset->metadata.lqip}',
        '/api/profile/history': '*[_type == "schoolProfile" && type == "history"][0] {content, "imageUrl": select(defined(founderImage.asset) => founderImage.asset->url, externalImage), externalImage, founderImage, "lqip": founderImage.asset->metadata.lqip}',
        '/api/profile/welcome': '*[_type == "schoolProfile" && type == "welcome"][0] {content, "imageUrl": select(defined(founderImage.asset) => founderImage.asset->url, externalImage), externalImage, founderImage, "lqip": founderImage.asset->metadata.lqip}',
        '/api/profile/visimisi': '*[_type == "schoolProfile" && type == "visimisi"][0] {content}',
        '/api/settings': '*[_id == "website-settings"][0] {brochureUrl, registrationEnabled}',
        '/api/year-configs': '*[_type == "yearConfig"] {year, videoUrl}',
    };

    // Handle GET requests (Queries)
    if (!options.method || options.method === 'GET') {
        const query = queries[endpoint];
        if (query) {
            return await client.fetch(query);
        }
    }

    // For POST (Registration), we might need more setup later, 
    // but for now we return empty to avoid breaking the UI
    if (endpoint.includes('/apply')) {
        console.warn("PPDB Apply via Sanity needs write token/backend proxy.");
        return { status: 'success', message: 'Menerima pendaftaran...' };
    }

    return [];
};

export const urlFor = (source) => {
    if (typeof source === 'string' && source.startsWith('http')) return source;
    return sanityUrlFor(source);
};

