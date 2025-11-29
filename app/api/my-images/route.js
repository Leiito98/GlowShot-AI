import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

// Usamos el cliente ADMIN para saltarnos las restricciones RLS del frontend
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // El servidor busca las fotos (aquí sí tiene permiso)
    const { data, error } = await supabaseAdmin
        .from('generated_images')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ images: data });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}