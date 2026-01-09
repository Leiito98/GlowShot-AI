// app/api/status/route.js
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Replicate from "replicate";
import { auth } from "@clerk/nextjs/server";

export const runtime = "nodejs";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

function extractTarUrl(output) {
  if (!output) return null;

  if (typeof output === "string") {
    return output.includes(".tar") ? output : null;
  }

  if (Array.isArray(output)) {
    const hit = output.find((x) => typeof x === "string" && x.includes(".tar"));
    return hit || null;
  }

  if (typeof output === "object") {
    const w = output.weights;
    if (typeof w === "string") return w.includes(".tar") ? w : null;

    if (Array.isArray(w)) {
      const hit = w.find((x) => typeof x === "string" && x.includes(".tar"));
      return hit || null;
    }
  }

  return null;
}

export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { trainingId } = await request.json();
    if (!trainingId) {
      return NextResponse.json({ error: "trainingId requerido" }, { status: 400 });
    }

    // 1) DB
    const { data: record, error: dbErr } = await supabaseAdmin
      .from("predictions")
      .select("status,lora_url,trigger_word,user_id")
      .eq("training_id", trainingId)
      .maybeSingle();

    if (dbErr || !record) {
      return NextResponse.json({ status: "not_found", weights: null }, { status: 404 });
    }

    if (record.user_id && record.user_id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 2) Si DB ya está completed
    if (record.status === "completed" && record.lora_url) {
      return NextResponse.json({
        status: "completed",
        weights: record.lora_url,
        trigger: record.trigger_word,
      });
    }

    // 3) Consultar Replicate (source of truth para “qué está pasando ahora”)
    let training;
    try {
      training = await replicate.trainings.get(trainingId);
    } catch {
      // si falla replicate, devolvemos lo de DB (como el viejo)
      return NextResponse.json({
        status: record.status || "starting",
        weights: null,
        trigger: record.trigger_word,
      });
    }

    const repStatus = String(training?.status || "");

    // 4) Terminales: sincronizar DB
    if (repStatus === "succeeded") {
      const tarUrl = extractTarUrl(training?.output);

      if (!tarUrl) {
        // training terminó pero no vemos .tar todavía (raro) => devolvemos status de replicate
        return NextResponse.json({
          status: "processing",
          weights: null,
          trigger: record.trigger_word,
        });
      }

      await supabaseAdmin
        .from("predictions")
        .update({
          status: "completed",
          lora_url: tarUrl,
          finished_at: new Date().toISOString(),
          error: null,
        })
        .eq("training_id", trainingId);

      return NextResponse.json({
        status: "completed",
        weights: tarUrl,
        trigger: record.trigger_word,
      });
    }

    if (repStatus === "failed" || repStatus === "canceled") {
      await supabaseAdmin
        .from("predictions")
        .update({
          status: repStatus,
          error: training?.error ? String(training.error) : "Training failed/canceled",
          finished_at: new Date().toISOString(),
        })
        .eq("training_id", trainingId);

      return NextResponse.json({
        status: repStatus,
        weights: null,
        trigger: record.trigger_word,
      });
    }

    // 5) NO terminal (processing / starting): NO guardar en DB, PERO devolverlo al front
    // Así el cliente ve el estado real actual.
    const liveStatus =
      repStatus === "processing" ? "processing" :
      repStatus === "starting" ? "starting" :
      // por si replicate manda algo distinto, devolvemos lo que venga o fallback al DB
      repStatus || record.status || "starting";

    return NextResponse.json({
      status: liveStatus,
      weights: null,
      trigger: record.trigger_word,
    });
  } catch (err) {
    console.error("❌ ERROR /api/status:", err);
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}
