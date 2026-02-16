import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { analyzeWebsite } from '@/lib/pagespeed';
import { findCompanyOwner, findCompanyContacts } from '@/lib/ai';
import { calculateLeadScore } from '@/lib/scoring';

export async function POST(req: Request) {
    try {
        const { leadId } = await req.json();

        if (!leadId) {
            return NextResponse.json({ error: 'Lead ID is required' }, { status: 400 });
        }

        // Fetch lead and company info
        const { rows: leads } = await sql`
            SELECT l.id, c.id as company_id, c.name, c.city, c.address, c.website 
            FROM leads l 
            JOIN companies c ON l.company_id = c.id 
            WHERE l.id = ${leadId}
        `;

        if (leads.length === 0) {
            return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
        }

        const lead = leads[0];
        let mobileScore = 0;
        let desktopScore = 0;
        let loadTime = 0;

        // 1. PageSpeed Analysis
        if (lead.website) {
            try {
                const url = new URL(lead.website.startsWith('http') ? lead.website : `https://${lead.website}`);
                const analysis = await analyzeWebsite(url);
                mobileScore = analysis.mobileScore;
                desktopScore = analysis.desktopScore;
                loadTime = analysis.loadTime;

                await sql`
                    INSERT INTO websites (company_id, pagespeed_mobile, pagespeed_desktop, is_mobile_friendly, load_time)
                    VALUES (${lead.company_id}, ${mobileScore}, ${desktopScore}, ${analysis.isMobileFriendly}, ${loadTime})
                    ON CONFLICT (company_id) DO UPDATE SET 
                        pagespeed_mobile = EXCLUDED.pagespeed_mobile,
                        pagespeed_desktop = EXCLUDED.pagespeed_desktop,
                        is_mobile_friendly = EXCLUDED.is_mobile_friendly,
                        load_time = EXCLUDED.load_time,
                        updated_at = NOW()
                `;
            } catch (err) {
                console.error(`PageSpeed failed for ${lead.name}:`, err);
            }
        }

        // 2. AI Owner Enrichment
        try {
            const owner = await findCompanyOwner(lead.name, lead.city, lead.address);
            if (owner && owner.owner_name !== 'Unknown') {
                await sql`
                    INSERT INTO owners (company_id, owner_name, confidence, source)
                    VALUES (${lead.company_id}, ${owner.owner_name}, ${owner.confidence}, ${owner.source_url})
                    ON CONFLICT (company_id) DO UPDATE SET 
                        owner_name = EXCLUDED.owner_name,
                        confidence = EXCLUDED.confidence,
                        updated_at = NOW()
                `;
            }
        } catch (err) {
            console.error(`AI Owner enrichment failed for ${lead.name}:`, err);
        }

        // 3. AI Contact Enrichment (Phone/Email)
        if (lead.website) {
            try {
                const contacts = await findCompanyContacts(lead.name, lead.website);
                if (contacts.phone || contacts.email) {
                    await sql`
                        INSERT INTO contacts (company_id, phone, email)
                        VALUES (${lead.company_id}, ${contacts.phone}, ${contacts.email})
                        ON CONFLICT (company_id) DO UPDATE SET 
                            phone = COALESCE(EXCLUDED.phone, contacts.phone),
                            email = COALESCE(EXCLUDED.email, contacts.email)
                    `;
                }
            } catch (err) {
                console.error(`AI Contact enrichment failed for ${lead.name}:`, err);
            }
        }

        // 4. Update Lead Score
        const scoringResult = calculateLeadScore({
            pagespeed_mobile: mobileScore,
            pagespeed_desktop: desktopScore,
            has_ssl: true,
            uses_ads: false
        });

        await sql`
            UPDATE leads 
            SET score = ${scoringResult.score} 
            WHERE id = ${leadId}
        `;

        return NextResponse.json({
            success: true,
            score: scoringResult.score,
            mobileScore,
            loadTime,
            message: 'Lead analyzed successfully'
        });

    } catch (error: any) {
        console.error('Lead manual analysis error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
