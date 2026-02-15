import { sql } from '@vercel/postgres';

export async function getSetting(key: string): Promise<string> {
    try {
        const { rows } = await sql`SELECT value FROM settings WHERE key = ${key} LIMIT 1`;
        const dbValue = rows[0]?.value;

        // Fallback to environment variable if DB value is empty
        if (!dbValue || dbValue.trim() === '') {
            const envKey = key.toUpperCase();
            return process.env[envKey] || '';
        }

        return dbValue;
    } catch (e) {
        // Fallback to env if DB fails
        const envKey = key.toUpperCase();
        return process.env[envKey] || '';
    }
}
