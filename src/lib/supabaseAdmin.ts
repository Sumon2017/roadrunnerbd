import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    if (typeof window === 'undefined') {
        console.error('Supabase URL or Service Role Key is missing in .env');
    }
}

// SECURE: This client uses the service_role key and MUST ONLY be used on the server.
// It bypasses RLS policies.
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});
