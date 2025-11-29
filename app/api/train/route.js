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

    const { zipUrl } = await request.json();
    if (!zipUrl)
      return NextResponse.json({ error: "Falta zipUrl" }, { status: 400 });

    console.log("🚀 Entrenando LoRA para:", userId);

    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/replicate-webhook`;

    // De momento seguís usando tu trainer actual (ostris/flux-dev-lora-trainer)
    // cuando tengas listo el trainer con Flux.1-dev, solo cambiás estos 3 valores:
    const training = await replicate.trainings.create(
      "ostris",
      "flux-dev-lora-trainer",
      "26dce37af90b9d997eeb970d92e47de3064d46c300504ae376c75bef6a9022d2",
      {
        webhook: webhookUrl,
        webhook_events_filter: ["completed"],
        input: {
          input_images: zipUrl,
          max_train_steps: 800,
          lora_rank: 16,
          learning_rate: 1e-4,
          output_format: "lora",
        },
      }
    );

    console.log("📌 Training ID:", training.id);

    await supabaseAdmin.from("predictions").insert({
      user_id: userId,
      training_id: training.id,
      status: "starting",
    });

    return NextResponse.json({ id: training.id, status: "starting" });
  } catch (err) {
    console.error("❌ ERROR TRAIN:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
