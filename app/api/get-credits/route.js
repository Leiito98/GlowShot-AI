import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

// Usamos el cliente ADMIN para asegurar que la lectura se salte el RLS
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

    // El servidor lee el saldo con su llave maestra (seguro)
    const { data: creditData } = await supabaseAdmin
        .from('user_credits')
        .select('credits')
        .eq('user_id', userId);

    // Maneja 0 filas (user_credits devuelve un array)
    const credits = (creditData && creditData.length > 0) ? creditData[0].credits : 0;
    
    return NextResponse.json({ credits });

  } catch (error) {
    console.error("❌ ERROR CARGANDO SALDO DESDE SERVIDOR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}