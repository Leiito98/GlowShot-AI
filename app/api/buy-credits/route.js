// app/api/buy-credits/route.js
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { addCreditsAndPlan } from "@/lib/credits";

export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ahora SOLO usamos planId, no packSize
    const { planId } = await request.json();

    if (!planId || typeof planId !== "string") {
      return NextResponse.json(
        { error: "planId inválido" },
        { status: 400 }
      );
    }

    // Esto suma créditos según PLAN_CREDITS en lib/credits.ts
    await addCreditsAndPlan(userId, planId);

    return NextResponse.json({
      success: true,
      message: "Créditos actualizados correctamente (vía endpoint directo).",
    });
  } catch (error) {
    console.error("❌ ERROR GENERAL EN BUY CREDITS:", error);
    return NextResponse.json(
      { error: error.message || "Error interno" },
      { status: 500 }
    );
  }
}
