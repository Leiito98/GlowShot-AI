import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const { trainingId } = await request.json();
    if (!trainingId) {
      return NextResponse.json(
        { error: "trainingId requerido" },
        { status: 400 }
      );
    }

    // Buscar en nuestra DB
    const { data: record, error: dbErr } = await supabaseAdmin
      .from("predictions")
      .select("status,lora_url,trigger_word")
      .eq("training_id", trainingId)
      .single();

    if (dbErr || !record) {
      return NextResponse.json({
        status: "not_found",
        weights: null,
      });
    }

    // Si terminó → devolver URL
    if (record.status === "completed" && record.lora_url) {
      return NextResponse.json({
        status: "completed",
        weights: record.lora_url,   // <-- El LoRA hospedado en Replicate
        trigger: record.trigger_word
      });
    }

    // Responder estado actual
    return NextResponse.json({
      status: record.status,
      weights: null,
    });

  } catch (err) {
    console.error("❌ ERROR /api/status:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
