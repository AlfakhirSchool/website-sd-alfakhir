import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/adminSession';
import { serverClient } from '@/lib/sanityServer';
import { proxifySanityUrls } from '@/lib/imageProxy';
import { studentApi } from '@/lib/studentApi';

export const runtime = 'nodejs';

// Everything except students — student PII now lives on the self-hosted
// student-api (services/student-api), not Sanity.
const MEGA_QUERY = `{
    "gallery": *[_type == "gallery"] | order(date desc) {"_id": _id, title, category, "imageUrl": select(defined(image.asset) => image.asset->url + "?fm=webp&q=90", externalImage), externalImage, image, date, agenda},
    "staff": *[_type == "teacher"] | order(order asc) {"_id": _id, name, role, vision, education, email, "imageUrl": select(defined(image.asset) => image.asset->url + "?fm=webp&q=90", externalImage), externalImage, image},
    "messages": *[_type == "contactMessage"] | order(receivedAt desc),
    "yearConfigs": *[_type == "yearConfig"],
    "settings": *[_id == "website-settings"][0]
}`;

export async function GET() {
    const session = await requireAdminSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const [sanityData, students] = await Promise.all([
            serverClient.fetch(MEGA_QUERY),
            studentApi.list().catch(err => {
                console.error('student-api list error:', err);
                return []; // don't fail the whole dashboard if student-api is down
            }),
        ]);
        return NextResponse.json({ ...proxifySanityUrls(sanityData), students });
    } catch (err) {
        console.error('Admin data fetch error:', err);
        return NextResponse.json({ error: 'Gagal mengambil data.' }, { status: 500 });
    }
}
