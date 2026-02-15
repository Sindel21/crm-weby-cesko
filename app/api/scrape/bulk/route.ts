import { NextResponse } from 'next/server';
import { runScraper } from '@/lib/apify';
import { sql } from '@vercel/postgres';

const CZ_TOWNS = [
    'Praha', 'Benešov', 'Beroun', 'Kladno', 'Kolín', 'Kutná Hora', 'Mělník', 'Mladá Boleslav', 'Nymburk', 'Příbram', 'Rakovník',
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
                    // Update current city
                    await sql`
            UPDATE scan_status 
            SET current_city = ${city}, updated_at = NOW() 
            WHERE is_active = TRUE
          `;

                    console.log(`Scraping ${category} in ${city}...`);
                    const companies = await runScraper(city, category);

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

                        await sql`
              INSERT INTO leads (company_id, status)
              VALUES (${companyId}, 'new')
              ON CONFLICT (company_id) DO NOTHING
            `;
                    }

                    completed++;

                    // Update progress
                    await sql`
            UPDATE scan_status 
            SET completed_towns = ${completed}, leads_found = ${leadsTotal}, updated_at = NOW() 
            WHERE is_active = TRUE
          `;

                } catch (err) {
                    console.error(`Error scraping ${city}:`, err);
                } finally {
                    completed++;

                    // Update progress (now happens even if one city fails)
                    await sql`
            UPDATE scan_status 
            SET completed_towns = ${completed}, leads_found = ${leadsTotal}, updated_at = NOW() 
            WHERE is_active = TRUE
          `;
                }

                // Mark as finished
                await sql`UPDATE scan_status SET is_active = FALSE, updated_at = NOW()`;
            }) ();

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
