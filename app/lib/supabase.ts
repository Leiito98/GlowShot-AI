// app/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Cliente ANON para usar en el cliente (page.tsx, componentes, etc.)
export const supabase = createClient(supabaseUrl, supabaseKey);
