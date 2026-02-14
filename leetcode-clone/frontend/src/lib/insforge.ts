import { createClient, InsForgeClient } from '@insforge/sdk';

// These environment variables should be set in .env
const databaseUrl = import.meta.env.VITE_INSFORGE_DATABASE_URL;
const databaseAnonKey = import.meta.env.VITE_INSFORGE_DATABASE_ANON_KEY;

if (!databaseUrl || !databaseAnonKey) {
    console.warn('Missing InsForge credentials in .env file');
}

export const insforge: InsForgeClient = createClient({
    baseUrl: databaseUrl || '',
    anonKey: databaseAnonKey || '',
    persistSession: true,      // Store session in localStorage
    autoRefreshToken: true      // Automatically refresh expired tokens
});
