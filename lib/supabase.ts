import { createClient as createSupabaseClient } from '@supabase/supabase-js';

if (!process.env.SUPABASE_URL) throw new Error('Missing SUPABASE_URL');
if (!process.env.SUPABASE_SERVICE_KEY) throw new Error('Missing SUPABASE_SERVICE_KEY');

// Server-only client: uses service role key (bypasses RLS, stays on the server).
export function createClient() {
    return createSupabaseClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_KEY!,
        { auth: { persistSession: false } }
    );
}
