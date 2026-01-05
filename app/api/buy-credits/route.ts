import { auth } from "@clerk/nextjs/server";
import { addCreditsAndPlan } from "@/lib/credits";

export async function POST(request: Request) {
  // ❗ SOLO PERMITIDO EN DESARROLLO
  if (process.env.NODE_ENV === "production") {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Endpoint deshabilitado en producción",
      }),
      { status: 403 }
    );
  }

  try {
    const { userId } = await auth();

    if (!userId) {
      return new Response(
        JSON.stringify({ success: false, error: "No autenticado" }),
        { status: 401 }
      );
    }

    const { packSize, planId } = await request.json();

    const result = await addCreditsAndPlan(userId, packSize, planId);

    return new Response(
      JSON.stringify({
        success: true,
        newCredits: result.credits,
        planId,
      }),
      { status: 200 }
    );
  } catch (err: any) {
    console.error("❌ ERROR GENERAL EN BUY CREDITS:", err);

    return new Response(
      JSON.stringify({
        success: false,
        error: err.message || "Error interno",
      }),
      { status: 500 }
    );
  }
}
