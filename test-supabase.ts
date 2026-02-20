import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
    console.log('Testing connection to Supabase...');
    const { data, error } = await supabase.from('categories').select('*').limit(1);

    if (error) {
        console.error('Error fetching categories:', error.message);
        console.error('Error Code:', error.code);
        if (error.code === 'PGRST116') {
            console.log('Table seems to exist but is empty (or RLS issue).');
        } else if (error.code === '42P01') {
            console.log('Table "categories" DOES NOT EXIST in the public schema.');
        }
    } else {
        console.log('Successfully connected and queried "categories" table.');
        console.log('Data:', data);
    }
}

testConnection();
