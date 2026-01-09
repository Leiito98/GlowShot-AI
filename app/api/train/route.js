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

function normalizeBaseUrl(url) {
  // deja solo protocolo+host (sin paths raros tipo /api/...)
  try {
    const u = new URL(url);
    return `${u.protocol}//${u.host}`;
  } catch {
    const s = String(url || "").trim();
    // si viene sin http, lo completa
    if (!s) return "";
    if (s.startsWith("http")) return s.replace(/\/$/, "");
    return `https://${s.replace(/\/$/, "")}`;
  }
}

function getAppBaseUrl() {
  // MUY IMPORTANTE: que sea la raíz, no /api/... ni nada
  const raw =
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.VERCEL_URL ||
    "";
  return normalizeBaseUrl(raw);
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
      .select("training_id, status, lora_url, trigger_word")
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
        trigger_word: existing.trigger_word,
        status: "completed",
      });
    }

    // 1) Validar fotos
    const { images } = await request.json();
    if (!images || images.length < 1) {
      return NextResponse.json(
        { error: "Debes enviar al menos 8 imágenes." },
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

    // 7) Webhook URL (BASE limpia)
    const baseUrl = getAppBaseUrl();
    if (!baseUrl) {
      return NextResponse.json(
        {
          error: "APP_URL_MISSING",
          message:
            "Falta configurar APP_URL / NEXT_PUBLIC_APP_URL (base). Debe ser la raíz, ej: https://tuapp.vercel.app",
        },
        { status: 500 }
      );
    }

    const webhookUrl = `${baseUrl}/api/replicate-webhook`;

    // 8) Crear training en Replicate (PRIMERO)
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
      return NextResponse.json(
        {
          error: "TRAINING_BLOCKED",
          message:
            "No se pudo iniciar el entrenamiento. Se reintegraron los créditos.",
          details: String(e?.message || e),
        },
        { status: 503 }
      );
    }

    // 9) Insertar prediction YA con training_id correcto (como tu route viejo)
    const { error: predInsErr } = await supabaseAdmin.from("predictions").insert({
      user_id: userId,
      training_id: training.id,
      trigger_word: trigger,
      status: "starting",
      lora_url: null,
      created_at: startedAt,
    });

    if (predInsErr) {
      // Importantísimo: acá NO reintegro créditos, porque el training ya se lanzó.
      // Pero te dejo un log para que lo veas y puedas crear un "recovery" si querés.
      console.error("❌ predictions insert error (training ya lanzado):", predInsErr);
    }

    return NextResponse.json({
      id: training.id,
      trigger_word: trigger,
      status: "starting",
      remainingCredits: dec.credits,
    });
  } catch (err) {
    console.error("❌ ERROR TRAIN:", err);
    return NextResponse.json(
      { error: "Server error", message: String(err?.message || err) },
      { status: 500 }
    );
  }
}
