// app/api/replicate-webhook/route.js
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Necesario para que Next.js App Router acepte webhooks externos
export const runtime = "nodejs";
export const maxDuration = 60;

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function extractTarUrl(output) {
  if (!output) return null;

  // output puede ser string
  if (typeof output === "string") {
    return output.includes(".tar") ? output : null;
  }

  // output puede ser array
  if (Array.isArray(output)) {
    const hit = output.find((x) => typeof x === "string" && x.includes(".tar"));
    return hit || null;
  }

  // output puede ser objeto (con weights)
  if (typeof output === "object") {
    const w = output.weights;

    if (typeof w === "string") {
      return w.includes(".tar") ? w : null;
    }

    if (Array.isArray(w)) {
      const hit = w.find((x) => typeof x === "string" && x.includes(".tar"));
      return hit || null;
    }
  }

  return null;
}

export async function POST(request) {
  try {
    const body = await request.json();
    console.log("📩 Webhook Replicate:", JSON.stringify(body, null, 2));

    const trainingId = body?.id;
    const status = String(body?.status || ""); // starting | processing | succeeded | failed | canceled
    const error = body?.error;
    const output = body?.output;

    if (!trainingId) return NextResponse.json({ ok: true });

    // 1) Buscar la predicción vinculada (más tolerante que .single())
    const { data: prediction, error: predError } = await supabaseAdmin
      .from("predictions")
      .select("id, training_id")
      .eq("training_id", trainingId)
      .maybeSingle();

    if (predError || !prediction) {
      console.error("❌ Prediction no encontrada para training_id:", trainingId);
      return NextResponse.json({ ok: true });
    }

    // 2) Mientras NO haya terminado, solo actualizamos el status
    const isTerminal = ["succeeded", "failed", "canceled", "completed"].includes(status);

    if (!isTerminal) {
      const { error: updErr } = await supabaseAdmin
        .from("predictions")
        .update({ status: status || "processing" })
        .eq("training_id", trainingId);

      if (updErr) console.error("❌ Update progress error:", updErr);

      return NextResponse.json({ ok: true });
    }

    // 3) Si falló
    if (status === "failed" || status === "canceled") {
      const errMsg =
        (error && (error.message || (typeof error === "string" ? error : null))) ||
        (error ? JSON.stringify(error) : "Unknown error");

      const { error: updErr } = await supabaseAdmin
        .from("predictions")
        .update({
          status,
          error: errMsg,
          finished_at: new Date().toISOString(),
        })
        .eq("training_id", trainingId);

      if (updErr) console.error("❌ Update failed/canceled error:", updErr);

      return NextResponse.json({ ok: true });
    }

    // ================================
    // 4) TRAINING EXITOSO (succeeded)
    // ================================
    const tarUrl = extractTarUrl(output);

    // Si no encontramos .tar, NO marcamos failed (evita falsos negativos).
    // Dejalo en starting/processing y que /api/status lo sincronice consultando Replicate.
    if (!tarUrl) {
      console.warn("⚠️ Succeeded pero no se encontró .tar en output. Training:", trainingId);

      const { error: updErr } = await supabaseAdmin
        .from("predictions")
        .update({
          status: "starting",
          error: "Webhook llegó succeeded pero no encontró .tar en output (fallback /api/status).",
        })
        .eq("training_id", trainingId);

      if (updErr) console.error("❌ Update succeeded-without-tar error:", updErr);

      return NextResponse.json({ ok: true });
    }

    console.log("📦 LoRA .tar detectado:", tarUrl);

    // 5) Guardar en Supabase
    const { error: updErr } = await supabaseAdmin
      .from("predictions")
      .update({
        status: "completed",
        lora_url: tarUrl,
        finished_at: new Date().toISOString(),
        error: null,
      })
      .eq("training_id", trainingId);

    if (updErr) console.error("❌ Update completed error:", updErr);

    console.log("🎉 LoRA guardado correctamente:", tarUrl);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("🔥 ERROR WEBHOOK:", err);
    return NextResponse.json({ ok: false, error: String(err?.message || err) });
  }
}
