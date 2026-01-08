// app/api/train/route.js
import { NextResponse } from "next/server";
import Replicate from "replicate";
import { auth } from "@clerk/nextjs/server";
import JSZip from "jszip";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const DESTINATION_MODEL = "leiito98/fast-flux-user-loras";
const FAST_FLUX_VERSION =
  "f463fbfc97389e10a2f443a8a84b6953b1058eafbf0c9af4d84457ff07cb04db";

const TRAIN_COST = 40;

function getAppUrl() {
  // preferí APP_URL (server) si lo tenés, sino NEXT_PUBLIC_APP_URL
  const u =
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.VERCEL_URL ||
    "";
  if (!u) return "";
  if (u.startsWith("http")) return u;
  return `https://${u}`;
}

async function getCredits(userId) {
  const { data, error } = await supabaseAdmin
    .from("user_credits")
    .select("credits")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return Number(data?.credits || 0);
}

// descuento con optimistic lock: update solo si el valor coincide
async function deductCreditsOptimistic(userId, current, cost) {
  const next = current - cost;

  const { data, error } = await supabaseAdmin
    .from("user_credits")
    .update({ credits: next })
    .eq("user_id", userId)
    .eq("credits", current)
    .select("credits")
    .maybeSingle();

  if (error) throw error;
  if (!data) return { ok: false, credits: current };
  return { ok: true, credits: Number(data.credits || next) };
}

async function refundCredits(userId, amount) {
  // reintegro simple: leo y seteo (para no depender de RPC)
  const current = await getCredits(userId);
  const { error } = await supabaseAdmin
    .from("user_credits")
    .update({ credits: current + amount })
    .eq("user_id", userId);
  if (error) console.error("⚠️ refundCredits error:", error);
}

export async function POST(request) {
  const startedAt = new Date().toISOString();

  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // 0) Si ya tiene LoRA completed, no re-entrenar
    const { data: existing } = await supabaseAdmin
      .from("predictions")
      .select("training_id, status, lora_url")
      .eq("user_id", userId)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing?.lora_url) {
      return NextResponse.json({
        message: "Ya tienes un LoRA entrenado.",
        trainingId: existing.training_id,
        loraWeights: existing.lora_url,
      });
    }

    // 1) Validar fotos
    const { images } = await request.json();
    if (!images || images.length < 6) {
      return NextResponse.json(
        { error: "Debes enviar al menos 6 imágenes." },
        { status: 400 }
      );
    }

    // 2) Validar créditos ANTES
    const creditsNow = await getCredits(userId);
    if (creditsNow < TRAIN_COST) {
      return NextResponse.json(
        {
          error: "INSUFFICIENT_CREDITS",
          message: "Créditos insuficientes para entrenar.",
          credits: creditsNow,
          required: TRAIN_COST,
        },
        { status: 402 }
      );
    }

    // 3) Descontar créditos (optimistic lock)
    const dec = await deductCreditsOptimistic(userId, creditsNow, TRAIN_COST);
    if (!dec.ok) {
      // alguien actualizó créditos al mismo tiempo
      return NextResponse.json(
        { error: "RETRY", message: "Reintentá en un momento." },
        { status: 409 }
      );
    }

    // 4) Crear ZIP
    const zip = new JSZip();
    let i = 0;

    for (const url of images) {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`No se pudo descargar la imagen: ${url}`);
      const arrayBuf = await res.arrayBuffer();
      zip.file(`img_${i}.jpg`, arrayBuf);
      i++;
    }

    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

    // 5) Subir ZIP a Supabase
    const zipPath = `training_zips/${userId}/${Date.now()}.zip`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("training_files")
      .upload(zipPath, zipBuffer, { contentType: "application/zip" });

    if (uploadError) {
      await refundCredits(userId, TRAIN_COST);
      return NextResponse.json(
        { error: "No se pudo subir el ZIP de entrenamiento." },
        { status: 500 }
      );
    }

    const { data: publicData } = supabaseAdmin.storage
      .from("training_files")
      .getPublicUrl(zipPath);

    const zipUrl = publicData.publicUrl;

    // 6) Trigger único por usuario
    const rawId = userId.replace("user_", "").toLowerCase();
    const sanitized = rawId.replace(/she|he|man|woman|girl|boy/gi, "");
    const cleanId = sanitized.replace(/[^a-z0-9]/g, "");
    const trigger = `lora_${cleanId.slice(0, 10)}`;

    const appUrl = getAppUrl();
    if (!appUrl) {
      await refundCredits(userId, TRAIN_COST);
      return NextResponse.json(
        {
          error: "APP_URL_MISSING",
          message:
            "Falta configurar APP_URL / NEXT_PUBLIC_APP_URL para el webhook.",
        },
        { status: 500 }
      );
    }

    const webhookUrl = `${appUrl}/api/replicate-webhook`;

    // 7) Crear registro prediction (estado starting, sin training_id aún)
    const { data: predRow, error: predInsErr } = await supabaseAdmin
      .from("predictions")
      .insert({
        user_id: userId,
        training_id: null,
        trigger_word: trigger,
        status: "starting",
        lora_url: null,
        created_at: startedAt,
      })
      .select("id")
      .maybeSingle();

    if (predInsErr) {
      await refundCredits(userId, TRAIN_COST);
      console.error("❌ predictions insert error:", predInsErr);
      return NextResponse.json(
        { error: "DB error creating prediction" },
        { status: 500 }
      );
    }

    // 8) Lanzar entrenamiento en Replicate
    let training;
    try {
      training = await replicate.trainings.create(
        "replicate",
        "fast-flux-trainer",
        FAST_FLUX_VERSION,
        {
          destination: DESTINATION_MODEL,
          webhook: webhookUrl,
          webhook_events_filter: ["completed"],
          input: {
            input_images: zipUrl,
            trigger_word: trigger,
            lora_type: "subject",
          },
        }
      );
    } catch (e) {
      // Replicate sin saldo / error externo => reintegro + marco prediction failed
      await refundCredits(userId, TRAIN_COST);

      await supabaseAdmin
        .from("predictions")
        .update({
          status: "failed",
          error: `Replicate error: ${String(e?.message || e)}`,
          finished_at: new Date().toISOString(),
        })
        .eq("id", predRow.id);

      return NextResponse.json(
        {
          error: "TRAINING_BLOCKED",
          message:
            "En estos momentos no podemos entrenar tu modelo. En instantes será resuelto.",
          blockedReason:
            "Servicio de entrenamiento temporalmente no disponible (Replicate).",
        },
        { status: 503 }
      );
    }

    // 9) Guardar training_id en prediction
    await supabaseAdmin
      .from("predictions")
      .update({ training_id: training.id })
      .eq("id", predRow.id);

    return NextResponse.json({
      id: training.id,
      trigger_word: trigger,
      status: "starting",
      remainingCredits: dec.credits, // ya descontado
    });
  } catch (err) {
    console.error("❌ ERROR TRAIN:", err);
    return NextResponse.json(
      { error: "Server error", message: String(err?.message || err) },
      { status: 500 }
    );
  }
}
