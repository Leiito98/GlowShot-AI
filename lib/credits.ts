// lib/credits.ts
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

// Ajusta estos valores a la cantidad de fotos/créditos que da cada plan
const PLAN_CREDITS: Record<string, number> = {
  basic: 40,
  standard: 60,
  executive: 100,
};

export async function addCreditsAndPlan(userId: string, planId: string) {
  const packSize = PLAN_CREDITS[planId];

  if (!packSize) {
    console.error("❌ PlanId desconocido en addCreditsAndPlan:", planId);
    throw new Error(`PlanId desconocido: ${planId}`);
  }

  // 1) Leer créditos actuales
  const { data: currentCreditData, error: currentError } = await supabaseAdmin
    .from("user_credits")
    .select("credits")
    .eq("user_id", userId)
    .single();

  if (currentError && currentError.code !== "PGRST116") {
    // PGRST116 = no rows found (primer compra), eso no es grave
    console.error("Error leyendo créditos actuales:", currentError);
  }

  const currentCredits: number = currentCreditData?.credits ?? 0;

  // 👇 IMPORTANTE: suma NUMÉRICA, nada de strings
  const newAmount: number = currentCredits + packSize;

  // 2) Upsert de créditos
  const { error: upsertCreditsError } = await supabaseAdmin
    .from("user_credits")
    .upsert({
      user_id: userId,
      credits: newAmount,
    });

  if (upsertCreditsError) {
    console.error(
      "❌ ERROR CRÍTICO DE PERSISTENCIA (UPSERT CRÉDITOS):",
      upsertCreditsError
    );
    throw new Error("Fallo interno al guardar saldo.");
  }

  // 3) Guardar / actualizar plan del usuario
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
    // No lanzamos error porque los créditos ya se guardaron
  }

  console.log(
    `✅ addCreditsAndPlan OK: user=${userId}, plan=${planId}, créditos=${currentCredits} → ${newAmount}`
  );
}
