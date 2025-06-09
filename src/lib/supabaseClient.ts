// lib/supabase/client.ts

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://qwrenmtnnhfgxmrgfvnp.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;
if (!supabaseKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_KEY environment variable is not set");
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ✅ Export the configured client
export default supabase;
