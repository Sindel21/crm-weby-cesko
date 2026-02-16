export interface AresCompany {
    ico: string;
    obchodniJmeno: string;
    sidlo: {
        textovaAdresa: string;
    };
}

export interface AresPerson {
    jmeno: string;
    prijmeni: string;
    titulPredJmenem?: string;
    titulZaJmenem?: string;
    funkce?: string;
}

const ARES_API_BASE = 'https://ares.gov.cz/ekonomicke-subjekty-v-be/rest';

export const searchAresByName = async (name: string): Promise<AresCompany | null> => {
    try {
        // Prepare name for URL (encode)
        const encodedName = encodeURIComponent(name);
        console.log(`[ARES v1.1] Searching (GET) for: ${name}`);

        const response = await fetch(`${ARES_API_BASE}/ekonomicke-subjekty?obchodniJmeno=${encodedName}&pocet=1`, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'CRM-App-Czech-Republic (jansindelovsky@gmail.com)'
            }
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error(`[ARES v1.1] search failed (${response.status}):`, errText.substring(0, 500));
            return null;
        }

        const data = await response.json();
        const firstMatch = data.ekonomickeSubjekty?.[0];

        if (!firstMatch) {
            console.log(`ARES: No subject found for name: ${name}`);
            return null;
        }

        return {
            ico: firstMatch.ico,
            obchodniJmeno: firstMatch.obchodniJmeno,
            sidlo: firstMatch.sidlo
        };
    } catch (err) {
        console.error('ARES search error:', err);
        return null;
    }
};

export const getAresRepresentatives = async (ico: string): Promise<string[]> => {
    try {
        console.log(`[ARES v1.1] Fetching representatives for IČO: ${ico}`);
        const response = await fetch(`${ARES_API_BASE}/ekonomicke-subjekty-vr/${ico}`, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'CRM-App-Czech-Republic (jansindelovsky@gmail.com)'
            }
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error(`ARES VR failed (${response.status}):`, errText.substring(0, 500));
            return [];
        }

        const data = await response.json();
        const representatives: string[] = [];

        // Traverse the VR data to find "statutarniOrgany"
        const statutarniOrgany = data.zaznamy?.[0]?.statutarniOrgany;
        if (statutarniOrgany) {
            for (const organ of statutarniOrgany) {
                if (organ.clenoveOrganu) {
                    for (const clen of organ.clenoveOrganu) {
                        const p = clen.osoba?.jmenoOsoby;
                        if (p) {
                            const fullName = [
                                p.titulPredJmenem,
                                p.jmeno,
                                p.prijmeni,
                                p.titulZaJmenem
                            ].filter(Boolean).join(' ');
                            representatives.push(fullName);
                        }
                    }
                }
            }
        }

        return Array.from(new Set(representatives)); // Unique names
    } catch (err) {
        console.error('ARES VR error:', err);
        return [];
    }
};
