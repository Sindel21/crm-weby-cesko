import { GoogleGenerativeAI } from '@google/generative-ai';
import { sql } from '@vercel/postgres';
import dotenv from 'dotenv';

dotenv.config();

async function diagnose() {
    try {
        console.log('--- Checking Settings Table ---');
        const { rows } = await sql`SELECT value FROM settings WHERE key = 'gemini_api_key'`;
        const apiKey = rows[0]?.value;

        if (!apiKey) {
            console.error('No API key found in settings table');
            return;
        }

        console.log('API key found (length):', apiKey.length);
        const genAI = new GoogleGenerativeAI(apiKey);

        console.log('\n--- Listing Available Models ---');
        const models = await genAI.listModels();
        for (const model of models.models) {
            console.log(`Model: ${model.name}, Methods: ${model.supportedGenerationMethods}`);
        }

        console.log('\n--- Testing ARES (GET) ---');
        const aresUrl = 'https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty?obchodniJmeno=Google&pocet=1';
        const response = await fetch(aresUrl, {
            headers: { 'Accept': 'application/json', 'User-Agent': 'CRM-Test' }
        });
        console.log('ARES Status:', response.status);
        const text = await response.text();
        console.log('ARES Response sample:', text.substring(0, 200));

    } catch (err: any) {
        console.error('Diagnosis failed:', err.message);
    }
}

diagnose();
