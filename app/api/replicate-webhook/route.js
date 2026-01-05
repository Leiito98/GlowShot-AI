// app/api/replicate-webhook/route.js
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Necesario para que Next.js App Router acepte webhooks externos
export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request) {
  try {
    const body = await request.json();
    console.log("📩 Webhook Replicate:", JSON.stringify(body, null, 2));

    const { id: trainingId, status, error, output } = body;

    // 1️⃣ Buscar la predicción vinculada
    const { data: prediction, error: predError } = await supabaseAdmin
      .from("predictions")
      .select("*")
      .eq("training_id", trainingId)
      .single();

    if (predError || !prediction) {
      console.error("❌ Prediction no encontrada para training_id:", trainingId);
      return NextResponse.json({ ok: true });
    }

    // 2️⃣ Actualizar progreso (mientras NO haya terminado)
    if (!["succeeded", "completed", "failed", "canceled"].includes(status)) {
      await supabaseAdmin
        .from("predictions")
        .update({ status })
        .eq("training_id", trainingId);

      return NextResponse.json({ ok: true });
    }

    // 3️⃣ Si falló
    if (status === "failed" || status === "canceled") {
      await supabaseAdmin
        .from("predictions")
        .update({
          status,
          error: error?.message || JSON.stringify(error || {}),
          finished_at: new Date().toISOString(),
        })
        .eq("training_id", trainingId);

      return NextResponse.json({ ok: true });
    }

    // ================================
    // 4️⃣ TRAINING EXITOSO (succeeded)
    // ================================

    // Debe existir output.weights con el .tar final
    const tarUrl =
      output?.weights?.[0] ||
      (Array.isArray(output?.weights) ? output.weights[0] : null);

    if (!tarUrl) {
      console.error("❌ No se encontró el archivo .tar en output.weights");
      await supabaseAdmin
        .from("predictions")
        .update({
          status: "failed",
          error: "No se encontró output.weights",
          finished_at: new Date().toISOString(),
        })
        .eq("training_id", trainingId);

      return NextResponse.json({ ok: true });
    }

    console.log("📦 LoRA .tar detectado:", tarUrl);

    // 5️⃣ Guardar en Supabase
    await supabaseAdmin
      .from("predictions")
      .update({
        status: "completed",
        lora_url: tarUrl, // 👈 ahora sí guardamos el .tar real
        finished_at: new Date().toISOString(),
      })
      .eq("training_id", trainingId);

    console.log("🎉 LoRA guardado correctamente:", tarUrl);

    return NextResponse.json({ ok: true });

  } catch (err) {
    console.error("🔥 ERROR WEBHOOK:", err);
    return NextResponse.json({ ok: false, error: err.message });
  }
}
