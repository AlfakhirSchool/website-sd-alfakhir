import { NextResponse } from 'next/server';
import { serverClient } from '@/lib/sanityServer';
import { proxifySanityUrls } from '@/lib/imageProxy';
import { studentApi } from '@/lib/studentApi';

export const runtime = 'nodejs';

// Public, read-only content — the only queries this route will ever run.
// Kept as a fixed allowlist (not arbitrary GROQ from the client) so a
// private dataset's document API is only ever reachable through queries we
// wrote ourselves, never through a query an attacker supplies.
const QUERIES = {
    '/api/facilities': '*[_type == "facility" && name != "rgergreg" && name != "edwewdew"] {"_id": _id, name, description, "imageUrl": select(defined(image.asset) => image.asset->url, externalImage), externalImage, image, "lqip": image.asset->metadata.lqip}',
    '/api/gallery': '*[_type == "gallery"] | order(date desc) {"_id": _id, title, category, "imageUrl": select(defined(image.asset) => image.asset->url, externalImage), externalImage, image, date, agenda, "lqip": image.asset->metadata.lqip}',
    '/api/staff': '*[_type == "teacher"] | order(order asc) {"_id": _id, name, role, vision, education, email, "imageUrl": select(defined(image.asset) => image.asset->url, externalImage), externalImage, image, "lqip": image.asset->metadata.lqip}',
    '/api/news': '*[_type == "news"] | order(date desc) {"_id": _id, title, date, "imageUrl": select(defined(mainImage.asset) => mainImage.asset->url, externalImage), externalImage, mainImage, slug, body, "lqip": mainImage.asset->metadata.lqip}',
    '/api/profile/history': '*[_type == "schoolProfile" && type == "history"][0] {content, "imageUrl": select(defined(founderImage.asset) => founderImage.asset->url, externalImage), externalImage, founderImage, "lqip": founderImage.asset->metadata.lqip}',
    '/api/profile/welcome': '*[_type == "schoolProfile" && type == "welcome"][0] {content, "imageUrl": select(defined(founderImage.asset) => founderImage.asset->url, externalImage), externalImage, founderImage, "lqip": founderImage.asset->metadata.lqip}',
    '/api/profile/visimisi': '*[_type == "schoolProfile" && type == "visimisi"][0] {content}',
    '/api/settings': '*[_id == "website-settings"][0] {brochureUrl, registrationEnabled}',
    '/api/year-configs': '*[_type == "yearConfig"] {year, videoUrl}',
};

export async function GET(req) {
    const endpoint = new URL(req.url).searchParams.get('endpoint');

    // Student PII lives on the self-hosted student-api now, not Sanity —
    // this is the one public endpoint it serves, and it already excludes
    // every PII field (see services/student-api/server.js PUBLIC_COLUMNS).
    if (endpoint === '/api/students/public') {
        try {
            const data = await studentApi.listPublic();
            return NextResponse.json(data, {
                headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' },
            });
        } catch (err) {
            // Degrade to an empty list rather than a 500 — e.g. before
            // STUDENT_API_URL is configured, or if that server is briefly down.
            console.error('Content fetch error:', endpoint, err);
            return NextResponse.json([]);
        }
    }

    const query = QUERIES[endpoint];
    if (!query) {
        return NextResponse.json({ error: 'Unknown endpoint' }, { status: 400 });
    }

    try {
        const data = await serverClient.fetch(query);
        // /api/settings gates the public registration on/off toggle — must
        // reflect immediately, not up to ~5 minutes late via stale-while-revalidate.
        const cacheControl = endpoint === '/api/settings'
            ? 'no-store'
            : 'public, max-age=60, stale-while-revalidate=300';
        return NextResponse.json(proxifySanityUrls(data), {
            headers: { 'Cache-Control': cacheControl },
        });
    } catch (err) {
        console.error('Content fetch error:', endpoint, err);
        return NextResponse.json({ error: 'Gagal mengambil data.' }, { status: 500 });
    }
}
