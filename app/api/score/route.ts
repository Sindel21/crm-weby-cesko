import { NextResponse } from 'next/server';
import { calculateLeadScore } from '@/lib/scoring';
import { sql } from '@vercel/postgres';

export async function POST(req: Request) {
    try {
        const { companyId } = await req.json();

        if (!companyId) {
            return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
        }

        // Fetch website analysis
        const { rows: websiteRows } = await sql`
      SELECT * FROM websites WHERE company_id = ${companyId} LIMIT 1
    `;
        const websiteData = websiteRows[0];

        if (!websiteData) {
            return NextResponse.json({ error: 'Website analysis not found' }, { status: 404 });
        }

        const { score, isCallLead } = calculateLeadScore({
            pagespeed_mobile: websiteData.pagespeed_mobile,
            pagespeed_desktop: websiteData.pagespeed_desktop,
            has_ssl: websiteData.has_ssl,
            uses_ads: websiteData.uses_ads,
            is_modern: false,
        });

        if (isCallLead) {
            await sql`
        INSERT INTO leads (company_id, score, status)
        VALUES (${companyId}, ${score}, 'new')
        ON CONFLICT (company_id) DO UPDATE SET score = EXCLUDED.score
      `;

            return NextResponse.json({ message: 'Lead created/updated', score });
        }

        return NextResponse.json({ message: 'Not a lead', score });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
