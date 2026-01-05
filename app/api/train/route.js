// app/api/train/route.js
import { NextResponse } from "next/server";
import Replicate from "replicate";
import { auth } from "@clerk/nextjs/server";
import JSZip from "jszip";
import { createClient } from "@supabase/supabase-js";

console.log("⚠️ TRAIN ROUTE REAL EJECUTADO");

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 🔹 Modelo destino donde se guardan las LoRAs
const DESTINATION_MODEL = "leiito98/fast-flux-user-loras";

// 🔹 Versión nueva del fast-flux-trainer (la que estás usando)
const FAST_FLUX_VERSION =
  "f463fbfc97389e10a2f443a8a84b6953b1058eafbf0c9af4d84457ff07cb04db";

export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // 1️⃣ ¿Ya tiene un LoRA entrenado y completado?
    const { data: existing } = await supabaseAdmin
      .from("predictions")
      .select("training_id, status, lora_url")
      .eq("user_id", userId)
      .eq("status", "completed")
      .limit(1)
      .maybeSingle();

    if (existing?.lora_url) {
      // Ya tiene modelo listo → no seguimos gastando
      return NextResponse.json({
        message: "Ya tienes un LoRA entrenado, no es necesario reentrenar.",
        trainingId: existing.training_id,
        loraWeights: existing.lora_url, // será el destino, ej: leiito98/fast-flux-user-loras
      });
    }

    const { images } = await request.json();
    if (!images || images.length < 5) {
      return NextResponse.json(
        { error: "Debes enviar al menos 5 imágenes." },
        { status: 400 }
      );
    }

    console.log("📸 Fotos recibidas:", images.length);

    // 2️⃣ Crear ZIP en memoria a partir de las URLs
    const zip = new JSZip();
    let i = 0;

    for (const url of images) {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`No se pudo descargar la imagen: ${url}`);
      }
      const arrayBuf = await res.arrayBuffer();
      zip.file(`img_${i}.jpg`, arrayBuf);
      i++;
    }

    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
    console.log("📦 ZIP generado:", zipBuffer.length);

    // 3️⃣ Subir ZIP a Supabase y usar la URL como input_images
    const zipPath = `training_zips/${userId}/${Date.now()}.zip`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("training_files") // 👈 usa el bucket que ya tienes para entrenamiento
      .upload(zipPath, zipBuffer, {
        contentType: "application/zip",
      });

    if (uploadError) {
      console.error("❌ Error subiendo ZIP a Supabase:", uploadError);
      return NextResponse.json(
        { error: "No se pudo subir el ZIP de entrenamiento." },
        { status: 500 }
      );
    }

    const { data: publicData } = supabaseAdmin.storage
      .from("training_files")
      .getPublicUrl(zipPath);

    const zipUrl = publicData.publicUrl;
    console.log("🌐 ZIP URL para entrenamiento:", zipUrl);

    // 4️⃣ Trigger único por usuario
    const rawId = userId.replace("user_", "").toLowerCase();
    const sanitized = rawId.replace(/she|he|man|woman|girl|boy/gi, "");
    const cleanId = sanitized.replace(/[^a-z0-9]/g, "");
    const trigger = `lora_${cleanId.slice(0, 10)}`;

    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/replicate-webhook`;

    // 5️⃣ Lanzar entrenamiento Fast-Flux Trainer (con URL, como en el README)
    const training = await replicate.trainings.create(
      "replicate",
      "fast-flux-trainer",
      FAST_FLUX_VERSION,
      {
        destination: DESTINATION_MODEL,
        webhook: webhookUrl,
        // ⚠️ SOLO valores válidos: "start", "output", "logs", "completed"
        webhook_events_filter: ["completed"],
        input: {
          input_images: zipUrl,  // ✅ URL del ZIP
          trigger_word: trigger, // 🔥 token único
          lora_type: "subject",
          // Puedes tunear más parámetros si quieres:
          // max_train_steps: 800,
          // lora_rank: 16,
          // learning_rate: 1e-4,
        },
      }
    );

    console.log("📌 Training ID:", training.id);

    // 6️⃣ Registrar en DB este entrenamiento
    await supabaseAdmin.from("predictions").insert({
      user_id: userId,
      training_id: training.id,
      trigger_word: trigger,
      status: "starting",
      // ahora usamos lora_url como referencia al destino (modelo LoRA en Replicate)
      lora_url: null,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      id: training.id,
      trigger_word: trigger,
      status: "starting",
    });
  } catch (err) {
    console.error("❌ ERROR TRAIN:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
