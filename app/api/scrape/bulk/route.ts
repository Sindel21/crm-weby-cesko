import { NextResponse } from 'next/server';
import { runScraper } from '@/lib/apify';
import { analyzeWebsite } from '@/lib/pagespeed';
import { findCompanyOwner } from '@/lib/ai';
import { calculateLeadScore } from '@/lib/scoring';
import { sql } from '@vercel/postgres';

const CZ_TOWNS = [
    'Praha 1', 'Praha 2', 'Praha 3', 'Praha 4', 'Praha 5', 'Praha 6', 'Praha 7', 'Praha 8', 'Praha 9', 'Praha 10',
    'Praha 11', 'Praha 12', 'Praha 13', 'Praha 14', 'Praha 15', 'Praha 16', 'Praha 17', 'Praha 18', 'Praha 19', 'Praha 20',
    'Praha 21', 'Praha 22',
    'Benešov', 'Beroun', 'Kladno', 'Kolín', 'Kutná Hora', 'Mělník', 'Mladá Boleslav', 'Nymburk', 'Příbram', 'Rakovník',
    'České Budějovice', 'Český Krumlov', 'Jindřichův Hradec', 'Písek', 'Prachatice', 'Strakonice', 'Tábor',
    'Domažlice', 'Klatovy', 'Plzeň', 'Rokycany', 'Tachov',
    'Cheb', 'Karlovy Vary', 'Sokolov',
    'Děčín', 'Chomutov', 'Litoměřice', 'Louny', 'Most', 'Teplice', 'Ústí nad Labem',
    'Česká Lípa', 'Jablonec nad Nisou', 'Liberec', 'Semily',
    'Hradec Králové', 'Jičín', 'Náchod', 'Rychnov nad Kněžnou', 'Trutnov',
    'Chrudim', 'Pardubice', 'Svitavy', 'Ústí nad Orlicí',
    'Havlíčkův Brod', 'Jihlava', 'Pelhřimov', 'Třebíč', 'Žďár nad Sázavou',
    'Blansko', 'Brno', 'Břeclav', 'Hodonín', 'Vyškov', 'Znojmo',
    'Jeseník', 'Olomouc', 'Prostějov', 'Přerov', 'Šumperk',
    'Kroměříž', 'Uherské Hradiště', 'Vsetín', 'Zlín',
    'Bruntál', 'Frýdek-Místek', 'Karviná', 'Nový Jičín', 'Opava', 'Ostrava'
];

export async function POST(req: Request) {
    try {
        const { category } = await req.json();

        if (!category) {
            return NextResponse.json({ error: 'Category is required' }, { status: 400 });
        }

        // In a real production app, this would be a background job (Redis/Queue)
        // For MVP, we'll process them and return a response, but it might timeout for all 77.
        // We'll return a 202 Accepted and process in a fire-and-forget manner or just first few for demo.

        // Initialize scan status in DB
        await sql`DELETE FROM scan_status`;
        await sql`
            INSERT INTO scan_status (category, total_towns, is_active)
            VALUES (${category}, ${CZ_TOWNS.length}, TRUE)
        `;

        // Fire and forget (Next.js serverless functions might kill it, but good for demo)
        (async () => {
            let leadsTotal = 0;
            let completed = 0;

            for (const city of CZ_TOWNS) {
                try {
                    // Check if still active or paused
                    const { rows: statusCheck } = await sql`SELECT is_active, is_paused FROM scan_status WHERE is_active = TRUE ORDER BY started_at DESC LIMIT 1`;

                    if (statusCheck.length === 0 || !statusCheck[0].is_active) {
                        console.log('Scraper stopped by user.');
                        break;
                    }

                    while (statusCheck[0].is_paused) {
                        console.log('Scraper paused. Waiting...');
                        await new Promise(resolve => setTimeout(resolve, 5000));
                        const { rows: retryCheck } = await sql`SELECT is_active, is_paused FROM scan_status WHERE id = (SELECT id FROM scan_status ORDER BY started_at DESC LIMIT 1)`;
                        if (retryCheck.length === 0 || !retryCheck[0].is_active) break;
                        if (!retryCheck[0].is_paused) break;
                    }

                    // Update current city
                    await sql`
                        UPDATE scan_status 
                        SET current_city = ${city}, updated_at = NOW() 
                        WHERE is_active = TRUE
                    `;

                    console.log(`Scraping ${category} in ${city}...`);
                    const companies = await runScraper(city, category);
                    console.log(`Scraper returned ${companies.length} companies for ${city}`);

                    leadsTotal += companies.length;

                    for (const c of companies) {
                        const { rows } = await sql`
                            INSERT INTO companies (name, category, city, address, website, rating, reviews)
                            VALUES (${c.name}, ${c.category}, ${c.city}, ${c.address}, ${c.website}, ${c.rating}, ${c.reviews})
                            ON CONFLICT (name, address) 
                            DO UPDATE SET name = EXCLUDED.name 
                            RETURNING id
                        `;

                        const companyId = rows[0].id;

                        // Insert Lead
                        await sql`
                            INSERT INTO leads (company_id, status)
                            VALUES (${companyId}, 'new')
                            ON CONFLICT (company_id) DO NOTHING
                        `;

                        // NEW: Automated Analysis & Enrichment
                        // We do this inside the background block
                        if (c.website) {
                            try {
                                console.log(`Analyzing ${c.website} for ${c.name}...`);
                                const url = new URL(c.website.startsWith('http') ? c.website : `https://${c.website}`);
                                const analysis = await analyzeWebsite(url);

                                await sql`
                                    INSERT INTO websites (company_id, pagespeed_mobile, pagespeed_desktop, is_mobile_friendly, load_time)
                                    VALUES (${companyId}, ${analysis.mobileScore}, ${analysis.desktopScore}, ${analysis.isMobileFriendly}, ${analysis.loadTime})
                                    ON CONFLICT (company_id) DO UPDATE SET 
                                        pagespeed_mobile = EXCLUDED.pagespeed_mobile,
                                        pagespeed_desktop = EXCLUDED.pagespeed_desktop,
                                        is_mobile_friendly = EXCLUDED.is_mobile_friendly,
                                        updated_at = NOW()
                                `;

                                // Find Owner with AI
                                const owner = await findCompanyOwner(c.name, c.city, c.address);
                                if (owner) {
                                    await sql`
                                        INSERT INTO owners (company_id, owner_name, confidence, source)
                                        VALUES (${companyId}, ${owner.owner_name}, ${owner.confidence}, ${owner.source_url})
                                        ON CONFLICT (company_id) DO UPDATE SET 
                                            owner_name = EXCLUDED.owner_name,
                                            confidence = EXCLUDED.confidence
                                    `;
                                }

                                // Calculate and Update Score
                                const scoringResult = calculateLeadScore({
                                    pagespeed_mobile: analysis.mobileScore,
                                    pagespeed_desktop: analysis.desktopScore,
                                    has_ssl: true,
                                    uses_ads: false
                                });

                                await sql`
                                    UPDATE leads 
                                    SET score = ${scoringResult.score} 
                                    WHERE company_id = ${companyId}
                                `;

                            } catch (analysisErr) {
                                console.error(`Analysis failed for ${c.name}:`, analysisErr);
                            }
                        }
                    }
                } catch (err) {
                    console.error(`Error scraping ${city}:`, err);
                } finally {
                    completed++;

                    // Update progress
                    await sql`
                        UPDATE scan_status 
                        SET completed_towns = ${completed}, leads_found = ${leadsTotal}, updated_at = NOW() 
                        WHERE is_active = TRUE
                    `;
                }
            }

            // Mark as finished if not stopped earlier
            await sql`UPDATE scan_status SET is_active = FALSE, updated_at = NOW() WHERE is_active = TRUE`;
        })();

        return NextResponse.json({
            message: 'National scan started',
            townCount: CZ_TOWNS.length,
            estimatedTime: '20-30 minutes'
        }, { status: 202 });

    } catch (error: any) {
        console.error('Core Bulk Scrape Error:', error);
        return NextResponse.json({
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}
