import { NextResponse } from "next/server";
import Replicate from "replicate"; // Necesario para la sintaxis, aunque no se use
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const { userId } = await auth();
    const { packSize } = await request.json(); 

    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    console.log(`💰 [DEBUG] Usuario: ${userId} intentando comprar ${packSize}.`);

    // 1. Leer saldo actual
    const { data: currentCreditData } = await supabaseAdmin
      .from('user_credits')
      .select('credits')
      .eq('user_id', userId)
      .single();
    
    // Si la fila no existe (primer compra), empezamos en 0
    const currentCredits = currentCreditData ? currentCreditData.credits : 0;
    const newAmount = packSize + currentCredits;

    // 2. Actualizar o Insertar (Upsert) - La operación de guardado
    const { data: updatedRow, error: upsertError } = await supabaseAdmin
      .from('user_credits')
      .upsert({ user_id: userId, credits: newAmount })
      .select(); // Pedimos que devuelva la fila para confirmar

    if (upsertError) {
        console.error("❌ ERROR CRÍTICO DE PERSISTENCIA (UPSERT):", upsertError);
        // Devolvemos 500 para que el frontend no crea que tuvo éxito
        return NextResponse.json({ error: "Fallo interno al guardar saldo." }, { status: 500 });
    }
    
    console.log("✅ Saldo guardado. Nuevo total:", newAmount);

    return NextResponse.json({ success: true, newCredits: newAmount });

  } catch (error) {
    console.error("❌ ERROR GENERAL EN BUY CREDITS:", error);
    return NextResponse.json({ error: error.message || "Error interno" }, { status: 500 });
  }
}