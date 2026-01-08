// app/api/replicate-webhook/route.js
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const maxDuration = 60;

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function extractTarUrl(output) {
  // output puede ser string (url), array, o objeto con weights
  if (!output) return null;

  if (typeof output === "string") {
    return output.endsWith(".tar") || output.includes(".tar") ? output : output;
  }

  if (Array.isArray(output)) {
    const hit = output.find((x) => typeof x === "string" && x.includes(".tar"));
    return hit || (typeof output[0] === "string" ? output[0] : null);
  }

  // objeto
  const w = output.weights;
  if (typeof w === "string") return w;
  if (Array.isArray(w)) {
    const hit = w.find((x) => typeof x === "string" && x.includes(".tar"));
    return hit || (typeof w[0] === "string" ? w[0] : null);
  }

  return null;
}

export async function POST(request) {
  try {
    const body = await request.json();
    console.log("📩 Webhook Replicate:", JSON.stringify(body, null, 2));

    const trainingId = body?.id;
    const status = body?.status; // e.g. starting, processing, succeeded, failed, canceled
    const error = body?.error;
    const output = body?.output;

    if (!trainingId) return NextResponse.json({ ok: true });

    // buscar prediction
    const { data: prediction, error: predError } = await supabaseAdmin
      .from("predictions")
      .select("*")
      .eq("training_id", trainingId)
      .maybeSingle();

    if (predError || !prediction) {
      console.error("❌ Prediction no encontrada para training_id:", trainingId);
      return NextResponse.json({ ok: true });
    }

    const isTerminal = ["succeeded", "completed", "failed", "canceled"].includes(
      String(status || "")
    );

    if (!isTerminal) {
      await supabaseAdmin
        .from("predictions")
        .update({ status: String(status || "processing") })
        .eq("training_id", trainingId);

      return NextResponse.json({ ok: true });
    }

    // failed/canceled
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

    // succeeded/completed
    const tarUrl = extractTarUrl(output);

    if (!tarUrl) {
      await supabaseAdmin
        .from("predictions")
        .update({
          status: "failed",
          error: "No se encontró URL de pesos (output) en webhook.",
          finished_at: new Date().toISOString(),
        })
        .eq("training_id", trainingId);

      return NextResponse.json({ ok: true });
    }

    await supabaseAdmin
      .from("predictions")
      .update({
        status: "completed",
        lora_url: tarUrl,
        finished_at: new Date().toISOString(),
      })
      .eq("training_id", trainingId);

    console.log("🎉 LoRA guardado:", tarUrl);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("🔥 ERROR WEBHOOK:", err);
    return NextResponse.json({ ok: false });
  }
}
