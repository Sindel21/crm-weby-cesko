import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export interface OwnerEnrichment {
    owner_name: string;
    confidence: number;
    source_url: string;
}

export const findCompanyOwner = async (companyName: string, city: string, address: string): Promise<OwnerEnrichment> => {
    const prompt = `
    Find the owner or CEO of the following company in the Czech Republic:
    Company: ${companyName}
    City: ${city}
    Address: ${address}

    Use Czech sources like ARES, Obchodní rejstřík, company website, or news.
    Return ONLY a JSON object:
    {
      "owner_name": "Name",
      "confidence": 0.0-1.0,
      "source_url": "URL"
    }
  `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
        // Basic JSON extraction from markdown if needed
        const jsonStr = text.match(/\{[\s\S]*\}/)?.[0] || text;
        return JSON.parse(jsonStr);
    } catch (e) {
        console.error('Failed to parse Gemini response', text);
        return { owner_name: 'Unknown', confidence: 0, source_url: '' };
    }
};

export const generateCallOpening = async (companyName: string, issues: string[]): Promise<string> => {
    const prompt = `
    Napiš personalizovaný cold-call opening pro firmu ${companyName}.
    Důvody oslovení: ${issues.join(', ')}.
    Buď krátký, lidský, neprodejní. Max 3 věty.
    Jazyk: čeština.
  `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
};
