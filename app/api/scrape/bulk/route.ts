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

        // Fire and forget (Next.js serverless functions might kill it, but good for demo)
        (async () => {
            for (const city of CZ_TOWNS) {
                try {
                    console.log(`Scraping ${category} in ${city}...`);
                    const companies = await runScraper(city, category);

                    for (const c of companies) {
                        await sql`
              INSERT INTO companies (name, category, city, address, website, rating, reviews)
              VALUES (${c.name}, ${c.category}, ${c.city}, ${c.address}, ${c.website}, ${c.rating}, ${c.reviews})
              ON CONFLICT (name, address) DO NOTHING
            `;
                    }
                } catch (err) {
                    console.error(`Error scraping ${city}:`, err);
                }
            }
        })();

        return NextResponse.json({
            message: 'National scan started',
            townCount: CZ_TOWNS.length,
            estimatedTime: '20-30 minutes'
        }, { status: 202 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
