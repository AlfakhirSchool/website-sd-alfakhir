import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/adminSession';
import { serverClient } from '@/lib/sanityServer';
import { proxifySanityUrls } from '@/lib/imageProxy';
import { studentApi } from '@/lib/studentApi';
import { unseal } from '@/lib/profileCrypto';

export const runtime = 'nodejs';

// Student PII lives on the self-hosted student-api (services/student-api),
// not Sanity. Everything else is a Sanity query. `?scope=a,b` fetches only the
// named parts so a single save doesn't re-download the whole dashboard.
const SANITY_QUERIES = {
    gallery: `*[_type == "gallery"] | order(date desc) {"_id": _id, title, category, "imageUrl": select(defined(image.asset) => image.asset->url + "?fm=webp&q=90", externalImage), externalImage, image, date, agenda}`,
    staff: `*[_type == "teacher"] | order(order asc) {"_id": _id, name, role, vision, education, email, order, "imageUrl": select(defined(image.asset) => image.asset->url + "?fm=webp&q=90", externalImage), externalImage, image}`,
    messages: `*[_type == "contactMessage"] | order(receivedAt desc)`,
    yearConfigs: `*[_type == "yearConfig"]`,
    settings: `*[_id == "website-settings"][0]`,
    profiles: `*[_type == "studentProfile"] | order(period desc, publishedAt desc) {_id, period, publishedAt, blob}`,
};
const ALL_SCOPES = [...Object.keys(SANITY_QUERIES), 'students'];

export async function GET(req) {
    const session = await requireAdminSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requested = new URL(req.url).searchParams.get('scope');
    const scopes = requested ? requested.split(',').filter(s => ALL_SCOPES.includes(s)) : ALL_SCOPES;

    try {
        const sanityScopes = scopes.filter(s => s in SANITY_QUERIES);
        const sanityQuery = `{${sanityScopes.map(s => `"${s}": ${SANITY_QUERIES[s]}`).join(', ')}}`;

        const [sanityData, students] = await Promise.all([
            sanityScopes.length ? serverClient.fetch(sanityQuery) : {},
            scopes.includes('students')
                ? studentApi.list().catch(err => {
                    console.error('student-api list error:', err);
                    return []; // don't fail the whole dashboard if student-api is down
                })
                : undefined,
        ]);

        const data = proxifySanityUrls(sanityData);
        if (data.profiles) {
            data.profiles = data.profiles.map(({ blob, ...p }) => ({ ...p, ...unseal(blob) })).filter(p => p.nis);
        }
        if (students) data.students = students;
        return NextResponse.json(data);
    } catch (err) {
        console.error('Admin data fetch error:', err);
        return NextResponse.json({ error: 'Gagal mengambil data.' }, { status: 500 });
    }
}
