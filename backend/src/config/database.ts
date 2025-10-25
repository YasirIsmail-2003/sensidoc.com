import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase: any;
let supabaseClient: any;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration!');
  console.error('Please create a backend/.env file with the following variables:');
  console.error('SUPABASE_URL=https://your-project.supabase.co');
  console.error('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
  console.error('SUPABASE_ANON_KEY=your_anon_key');
  console.error('');
  console.error('You can get these values from your Supabase project dashboard.');
  console.error('For now, using mock configuration for development...');
  
  // Mock configuration for development
  const mockUrl = 'https://mock.supabase.co';
  const mockKey = 'mock_service_key';
  
  supabase = createClient(mockUrl, mockKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  supabaseClient = undefined;
} else {
  // Admin client with service role key for backend operations
  supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  // Client for user operations (with anon key) — only create if anon key provided
  supabaseClient = process.env.SUPABASE_ANON_KEY
    ? createClient(supabaseUrl, process.env.SUPABASE_ANON_KEY)
    : undefined;
}

export { supabase, supabaseClient };
export default supabase;