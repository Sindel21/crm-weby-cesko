import { NextResponse } from 'next/server';
import { analyzeWebsite } from '@/lib/pagespeed';
import { supabaseAdmin } from '@/lib/supabase';

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
            const sslCheck = await fetch(websiteUrl.replace('http:', 'https:'), { method: 'HEAD', timeout: 5000 } as any);
            hasSsl = sslCheck.ok;
        } catch (e) {
            hasSsl = false;
        }

        // Detect Google Ads (simplified)
        const pageHtml = await fetch(websiteUrl).then(res => res.text()).catch(() => '');
        const usesAds = ['gtag', 'googletagmanager', 'googleads', 'adsbygoogle', 'doubleclick'].some(term =>
            pageHtml.includes(term)
        );

        const { data, error } = await supabaseAdmin
            .from('websites')
            .insert({
                company_id: companyId,
                pagespeed_mobile: analysis.mobileScore,
                pagespeed_desktop: analysis.desktopScore,
                load_time: analysis.loadTime,
                is_mobile_friendly: analysis.isMobileFriendly,
                has_ssl: hasSsl,
                uses_ads: usesAds,
            })
            .select();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ message: 'Analysis complete', data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
