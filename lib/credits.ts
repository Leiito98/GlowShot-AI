import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Suma créditos al usuario y opcionalmente guarda el plan.
 */
export async function addCreditsAndPlan(
  userId: string,
  packSize: number,
  planId?: string
) {
  if (!userId) {
    throw new Error("userId requerido");
  }

  // 1) Leer créditos actuales
  const { data: currentCreditData, error: currentError } =
    await supabaseAdmin
      .from("user_credits")
      .select("credits")
      .eq("user_id", userId)
      .single();

  if (currentError && (currentError as any).code !== "PGRST116") {
    // PGRST116 = no rows found (primer compra)
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
    throw new Error("Fallo interno al guardar saldo.");
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
      // no tiramos error, porque los créditos ya se guardaron
    }
  }

  return { credits: newAmount };
}
