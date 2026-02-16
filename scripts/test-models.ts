import { GoogleGenerativeAI } from '@google/generative-ai';
import { sql } from '@vercel/postgres';
import * as dotenv from 'dotenv';
dotenv.config();

async function listModels() {
    // We need to get the API key from the database since it's not in env (it's in the settings table)
    // Actually, I can just read it from the database using the same lib logic if I can.
    // But since I'm running a local script, I'll try to find where the DB is or if I can use the existing lib.

    try {
        // Mocking getSetting since I'm in a standalone script
        const { rows } = await sql`SELECT value FROM settings WHERE key = 'gemini_api_key'`;
        const apiKey = rows[0]?.value;

        if (!apiKey) {
            console.error('API key not found in database');
            return;
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        // List models is not directly on genAI in some SDK versions, it's a separate call usually
        // But in recent versions, we can try to fetch them.
        // Actually, the easiest way to test a model is just to try a few known ones.

        console.log('Testing models with API Key:', apiKey.substring(0, 5) + '...');

        const modelsToTest = [
            'gemini-1.5-flash',
            'gemini-1.5-flash-001',
            'gemini-1.5-flash-002',
            'gemini-1.5-pro',
            'gemini-1.0-pro'
        ];

        for (const modelName of modelsToTest) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                await model.generateContent('Hi');
                console.log(`✅ Model ${modelName} is AVAILABLE`);
            } catch (err: any) {
                console.log(`❌ Model ${modelName} returned: ${err.message}`);
            }
        }
    } catch (err) {
        console.error('Database or API error:', err);
    }
}

listModels();
