import { createClient } from '@supabase/supabase-js';

// Default Supabase project credentials (public anon key is safe for client-side bundle)
const DEFAULT_URL = 'https://qultoiykwnosjjbpqtyg.supabase.co';
const DEFAULT_KEY = 'sb_publishable_lII--UKAV5xXMsI3_NnQJw_rak-ZmSC';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || DEFAULT_URL;
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || DEFAULT_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

