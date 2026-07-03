import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import ws from 'ws';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('WARNING: SUPABASE_URL or SUPABASE_SERVICE_KEY is missing. API calls will fail at runtime.');
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  realtime: {
    transport: ws
  }
});
