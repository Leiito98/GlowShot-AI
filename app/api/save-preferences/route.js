// app/api/save-preferences/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Cliente ADMIN (service role)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      userId,
      gender,
      ageRange,
      hairColor,
      hairLength,
      hairStyle,
      ethnicity,
      bodyType,
    } = body;

    if (!userId) {
      console.error("[save-preferences] Falta userId en el body");
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    console.log(
      `[save-preferences] Guardando preferencias para ${userId}:`,
      {
        gender,
        ageRange,
        hairColor,
        hairLength,
        hairStyle,
        ethnicity,
        bodyType,
      }
    );

    const { error } = await supabaseAdmin
      .from("user_profile")
      .upsert(
        {
          user_id: userId,
          gender,
          age_range: ageRange,
          hair_color: hairColor,
          hair_length: hairLength,
          hair_style: hairStyle,
          ethnicity,
          body_type: bodyType,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (error) {
      console.error("[save-preferences] Error en upsert:", error);
      return NextResponse.json(
        { error: "DB error", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[save-preferences] Error general:", err);
    return NextResponse.json(
      { error: err?.message ?? "Internal error" },
      { status: 500 }
    );
  }
}
