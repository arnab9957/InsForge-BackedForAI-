import { createClient } from '@insforge/sdk';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../frontend/.env') });

const databaseUrl = process.env.VITE_INSFORGE_DATABASE_URL;
const databaseAnonKey = process.env.VITE_INSFORGE_DATABASE_ANON_KEY;

if (!databaseUrl || !databaseAnonKey) {
    console.error('Missing credentials');
    process.exit(1);
}

const insforge = createClient({
    baseUrl: databaseUrl,
    anonKey: databaseAnonKey
});

async function createProfiles() {
    console.log('Creating profiles for existing users...');

    try {
        // Get current user (you must be logged in)
        const { data: { user }, error: authError } = await insforge.auth.getCurrentUser();

        if (authError || !user) {
            console.error('Please log in first. This script needs authentication.');
            console.log('\nTo create a profile for yourself:');
            console.log('1. Log in to the app');
            console.log('2. Open browser console');
            console.log('3. Run this code:');
            console.log(`
const email = 'your-email@example.com'; // Replace with your email
const username = email.split('@')[0];
const userId = 'your-user-id'; // Get from insforge.auth.getCurrentUser()

await insforge.database
    .from('profiles')
    .upsert([{
        id: userId,
        username: username,
        solved_count: 0,
        total_submissions: 0
    }], { onConflict: 'id' });
console.log('Profile created!');
            `);
            return;
        }

        // Get user email (you'll need to get this from your auth metadata)
        const email = user.email || 'user';
        const username = email.split('@')[0];

        // Check if profile already exists
        const { data: existingProfile } = await insforge.database
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .single();

        if (existingProfile) {
            console.log(`Profile already exists for ${username}`);
            return;
        }

        // Create profile
        const { error } = await insforge.database
            .from('profiles')
            .insert([{
                id: user.id,
                username: username,
                solved_count: 0,
                total_submissions: 0
            }]);

        if (error) {
            console.error('Error creating profile:', error.message);
        } else {
            console.log(`✅ Profile created for ${username}!`);
        }

    } catch (error: any) {
        console.error('Error:', error.message);
    }
}

createProfiles();
