import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const body = await request.json();
    console.log("📩 Webhook Replicate:", JSON.stringify(body, null, 2));

    const { id: trainingId, status, output, error } = body;

    // Buscar el registro en predictions
    const { data: prediction, error: predError } = await supabaseAdmin
      .from("predictions")
      .select("*")
      .eq("training_id", trainingId)
      .single();

    if (predError || !prediction) {
      console.error("❌ No se encontró prediction para training_id:", trainingId);
      return NextResponse.json({ ok: true });
    }

    if (status === "succeeded" || status === "completed") {
      // Dependiendo de cómo devuelva tu trainer:
      // Idealmente el trainer devuelve directamente una URL al .safetensors
      // en "output" o en "output.lora_file".
      let loraFileUrl = null;

      if (typeof output === "string") {
        loraFileUrl = output;
      } else if (output?.lora_file) {
        loraFileUrl = output.lora_file;
      } else if (Array.isArray(output) && output.length > 0) {
        // Por si devuelve un array de archivos
        loraFileUrl = output[0];
      }

      if (!loraFileUrl) {
        console.error("❌ No se encontró URL de LoRA en el output");
        await supabaseAdmin
          .from("predictions")
          .update({
            status: "failed",
            error: "No LoRA URL in trainer output",
            finished_at: new Date().toISOString(),
          })
          .eq("training_id", trainingId);

        return NextResponse.json({ ok: true });
      }

      // Descargar el .safetensors
      console.log("⬇️ Descargando LoRA desde:", loraFileUrl);
      const res = await fetch(loraFileUrl);
      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const fileName = `${prediction.user_id}/${trainingId}.safetensors`;

      // Subir al bucket lora_weights
      const { error: uploadError } = await supabaseAdmin.storage
        .from("lora_weights")
        .upload(fileName, buffer, {
          contentType: "application/octet-stream",
        });

      if (uploadError) {
        console.error("❌ Error subiendo LoRA a Supabase:", uploadError);
        await supabaseAdmin
          .from("predictions")
          .update({
            status: "failed",
            error: uploadError.message,
            finished_at: new Date().toISOString(),
          })
          .eq("training_id", trainingId);

        return NextResponse.json({ ok: true });
      }

      const { data: publicData } = supabaseAdmin.storage
        .from("lora_weights")
        .getPublicUrl(fileName);

      const loraPublicUrl = publicData.publicUrl;

      console.log("✅ LoRA guardada en:", loraPublicUrl);

      // Actualizar prediction con la URL del LoRA
      await supabaseAdmin
        .from("predictions")
        .update({
          status: "completed",
          lora_url: loraPublicUrl,
          finished_at: new Date().toISOString(),
        })
        .eq("training_id", trainingId);

      return NextResponse.json({ ok: true });
    }

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

    // Estados intermedios (starting, processing...)
    await supabaseAdmin
      .from("predictions")
      .update({
        status,
      })
      .eq("training_id", trainingId);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("❌ ERROR WEBHOOK:", err);
    return NextResponse.json({ ok: false });
  }
}
