import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { packSize, planId } = await request.json(); // 👈 ahora también recibimos planId

    if (!packSize || typeof packSize !== "number") {
      return NextResponse.json(
        { error: "packSize inválido" },
        { status: 400 }
      );
    }

    console.log(
      `💰 [DEBUG] Usuario: ${userId} intentando comprar ${packSize} créditos. Plan: ${planId}`
    );

    // 1) Leer créditos actuales
    const { data: currentCreditData, error: currentError } =
      await supabaseAdmin
        .from("user_credits")
        .select("credits")
        .eq("user_id", userId)
        .single();

    if (currentError && currentError.code !== "PGRST116") {
      // PGRST116 = no rows found (primer compra), eso NO es error grave
      console.error("Error leyendo créditos actuales:", currentError);
    }

    const currentCredits = currentCreditData?.credits ?? 0;
    const newAmount = currentCredits + packSize;

    // 2) Upsert de créditos
    const { error: upsertCreditsError } = await supabaseAdmin
      .from("user_credits")
      .upsert({ user_id: userId, credits: newAmount });

    if (upsertCreditsError) {
      console.error(
        "❌ ERROR CRÍTICO DE PERSISTENCIA (UPSERT CRÉDITOS):",
        upsertCreditsError
      );
      return NextResponse.json(
        { error: "Fallo interno al guardar saldo." },
        { status: 500 }
      );
    }

    // 3) Guardar / actualizar plan del usuario (si vino planId)
    if (planId) {
      const { error: upsertPlanError } = await supabaseAdmin
        .from("user_plans")
        .upsert({
          user_id: userId,
          plan_id: planId, // "basic" | "standard" | "executive"
        });

      if (upsertPlanError) {
        console.error(
          "⚠️ Error guardando user_plans (no bloquea créditos):",
          upsertPlanError
        );
        // NO cortamos la respuesta porque los créditos sí se guardaron
      }
    }

    console.log("✅ Saldo guardado. Nuevo total:", newAmount);

    return NextResponse.json({ success: true, newCredits: newAmount });
  } catch (error) {
    console.error("❌ ERROR GENERAL EN BUY CREDITS:", error);
    return NextResponse.json(
      { error: error.message || "Error interno" },
      { status: 500 }
    );
  }
}
