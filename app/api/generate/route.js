import { NextResponse } from "next/server";
import Replicate from "replicate";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { prompt, weightsUrl } = await request.json();

    if (!weightsUrl) {
      return NextResponse.json(
        { error: "No se encontró LoRA del usuario" },
        { status: 400 }
      );
    }

    console.log(`=== GENERANDO PARA: ${userId} ===`);
    console.log(`LoRA: ${weightsUrl}`);

    const { data: creditData } = await supabaseAdmin
      .from("user_credits")
      .select("credits")
      .eq("user_id", userId)
      .single();

    if (!creditData || creditData.credits < 1) {
      return NextResponse.json({ error: "No tienes créditos." }, { status: 403 });
    }

    // Modelo correcto
    const modelVersion = "black-forest-labs/flux-dev-lora";

    const input = {
      prompt,
      lora_weights: weightsUrl,   // 👈 clave correcta
      lora_scale: 1,
      num_outputs: 1,
      aspect_ratio: "1:1",
      output_format: "png",
      guidance_scale: 3,          // 👈 clave correcta
      steps: 28,
    };

    console.log("🚀 Enviando a Replicate...");
    const output = await replicate.run(modelVersion, { input });

    const tempUrl =
      Array.isArray(output)
        ? output[0]
        : output?.images
        ? output.images[0]
        : output;

    console.log("⬇️ Descargando imagen:", tempUrl);

    const res = await fetch(tempUrl);
    const buffer = Buffer.from(await res.arrayBuffer());

    const fileName = `${userId}/${Date.now()}.png`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("generated_images")
      .upload(fileName, buffer, {
        contentType: "image/png",
      });

    if (uploadError) throw uploadError;

    const { data: publicData } = supabaseAdmin.storage
      .from("generated_images")
      .getPublicUrl(fileName);

    const permanentUrl = publicData.publicUrl;

    console.log("✅ Imagen guardada:", permanentUrl);

    await supabaseAdmin.from("generated_images").insert({
      user_id: userId,
      image_url: permanentUrl,
    });

    await supabaseAdmin
      .from("user_credits")
      .update({ credits: creditData.credits - 1 })
      .eq("user_id", userId);

    return NextResponse.json({
      imageUrl: permanentUrl,
      remainingCredits: creditData.credits - 1,
    });
  } catch (error) {
    console.error("❌ ERROR GENERATE:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
