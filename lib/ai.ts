import { GoogleGenerativeAI } from '@google/generative-ai';
import { getSetting } from './db-settings';

const getModel = async () => {
  const apiKey = await getSetting('gemini_api_key');
  const genAI = new GoogleGenerativeAI(apiKey);
  // Using a specific version string which is often more stable in EEA regions
  return genAI.getGenerativeModel({ model: 'gemini-1.5-flash-001' });
};

export interface OwnerEnrichment {
  owner_name: string;
  confidence: number;
  source_url: string;
}

export interface CompanyLeadDetails extends OwnerEnrichment {
  phone?: string;
  email?: string;
}

export const findCompanyOwner = async (companyName: string, city: string, address: string): Promise<OwnerEnrichment> => {
  const model = await getModel();
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
    const jsonStr = text.match(/\{[\s\S]*\}/)?.[0] || text;
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error('Failed to parse Gemini response for owner', text);
    return { owner_name: 'Unknown', confidence: 0, source_url: '' };
  }
};

export const findCompanyContacts = async (companyName: string, website: string): Promise<{ phone?: string, email?: string }> => {
  if (!website) return {};
  const model = await getModel();
  const prompt = `
    Look at the company name: ${companyName} and website: ${website}.
    Find the official contact phone number and email address for this business.
    Return ONLY a JSON object:
    {
      "phone": "+420123456789",
      "email": "info@company.cz"
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const jsonStr = text.match(/\{[\s\S]*\}/)?.[0] || text;
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error('Failed to parse Gemini response for contacts', website);
    return {};
  }
};

export const generateCallOpening = async (companyName: string, issues: string[]): Promise<string> => {
  const model = await getModel();
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
