import { NextResponse } from 'next/server';
import { analyzeWebsite } from '@/lib/pagespeed';
import { sql } from '@vercel/postgres';

export async function POST(req: Request) {
    try {
        const { companyId, websiteUrl } = await req.json();

        if (!companyId || !websiteUrl) {
            return NextResponse.json({ error: 'Company ID and website URL are required' }, { status: 400 });
        }

        const analysis = await analyzeWebsite(new URL(websiteUrl));

        // Check for SSL (simple fetch check)
        let hasSsl = false;
        try {
            const sslCheck = await fetch(websiteUrl.replace('http:', 'https:'), { method: 'HEAD' });
            hasSsl = sslCheck.ok;
        } catch (e) {
            hasSsl = false;
        }

        // Detect Google Ads (simplified)
        const pageHtml = await fetch(websiteUrl).then(res => res.text()).catch(() => '');
        const usesAds = ['gtag', 'googletagmanager', 'googleads', 'adsbygoogle', 'doubleclick'].some(term =>
            pageHtml.includes(term)
        );

        await sql`
      INSERT INTO websites (company_id, pagespeed_mobile, pagespeed_desktop, load_time, is_mobile_friendly, has_ssl, uses_ads)
      VALUES (${companyId}, ${analysis.mobileScore}, ${analysis.desktopScore}, ${analysis.loadTime}, ${analysis.isMobileFriendly}, ${hasSsl}, ${usesAds})
    `;

        return NextResponse.json({ message: 'Analysis complete' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
