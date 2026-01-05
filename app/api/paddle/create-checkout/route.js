// app/api/paddle/create-checkout/route.js
import { auth } from "@clerk/nextjs/server";

const API_BASE = "https://sandbox-api.paddle.com"; // 👈 sandbox

const PRICE_MAP = {
  basic: process.env.PADDLE_PRICE_BASIC,
  standard: process.env.PADDLE_PRICE_STANDARD,
  executive: process.env.PADDLE_PRICE_EXECUTIVE,
};

export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response(JSON.stringify({ error: "No autenticado" }), {
        status: 401,
      });
    }

    const body = await request.json();
    const { planId } = body; // "basic" | "standard" | "executive"

    console.log("🧾 /api/paddle/create-checkout body:", body);

    if (!planId || typeof planId !== "string") {
      return new Response(JSON.stringify({ error: "planId inválido" }), {
        status: 400,
      });
    }

    const priceId = PRICE_MAP[planId];

    console.log("👉 planId:", planId, "→ priceId:", priceId);

    if (!priceId) {
      console.error(
        "❌ No hay PADDLE_PRICE_XXX configurado para el plan:",
        planId
      );
      return new Response(
        JSON.stringify({
          error: `No hay PADDLE_PRICE_XXX configurado para el plan ${planId}`,
        }),
        { status: 500 }
      );
    }

    if (!process.env.PADDLE_API_KEY) {
      console.error("❌ Falta PADDLE_API_KEY en el entorno");
      return new Response(
        JSON.stringify({ error: "Config Paddle incompleta" }),
        { status: 500 }
      );
    }

    const APP_URL =
      (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "") ||
      "https://glow-shot-ai-flame.vercel.app";

    const payload = {
      collection_mode: "automatic",
      items: [
        {
          price_id: priceId,
          quantity: 1,
        },
      ],
      custom_data: {
        app_user_id: userId,
        plan_id: planId,
      },
      success_url: `${APP_URL}/payment-success`,
      cancel_url: `${APP_URL}/payment-cancel`,
    };

    console.log("📦 Payload hacia Paddle:", JSON.stringify(payload, null, 2));

    const res = await fetch(`${API_BASE}/transactions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PADDLE_API_KEY}`,
        "Content-Type": "application/json",
        "Paddle-Version": "1",
      },
      body: JSON.stringify(payload),
    });

    const json = await res.json();

    if (!res.ok) {
      console.error("Paddle API error:", JSON.stringify(json, null, 2));
      return new Response(
        JSON.stringify({ error: "Error creando transacción con Paddle" }),
        { status: 500 }
      );
    }

    // 👇 ID de la transacción (txn_...)
    const transactionId = json?.data?.id;

    if (!transactionId) {
      console.error("Respuesta sin data.id (transactionId):", json);
      return new Response(
        JSON.stringify({
          error: "Paddle no devolvió el ID de la transacción",
        }),
        { status: 500 }
      );
    }

    // Podrías mantener checkoutUrl si quisieras:
    // const checkoutUrl = json?.data?.checkout?.url || null;

    return new Response(
      JSON.stringify({
        transactionId,
        // checkoutUrl,  // opcional, ya no lo necesitamos para la UI
      }),
      { status: 200 }
    );
  } catch (e) {
    console.error("create-checkout exception:", e);
    return new Response(
      JSON.stringify({
        error: e?.message || "Error interno creando checkout",
      }),
      { status: 500 }
    );
  }
}
