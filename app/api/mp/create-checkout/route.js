// app/api/mp/create-checkout/route.js
import { auth } from "@clerk/nextjs/server";

const PRICE_MAP = {
  basic: {
    title: "AuraShot – Plan Basic",
    unit_price: Number(process.env.MP_PRICE_BASIC_ARS || 14999),
  },
  standard: {
    title: "AuraShot – Plan Standard",
    unit_price: Number(process.env.MP_PRICE_STANDARD_ARS || 21999),
  },
  executive: {
    title: "AuraShot – Plan Executive",
    unit_price: Number(process.env.MP_PRICE_EXECUTIVE_ARS || 34999),
  },
};

function getAppUrl() {
  return (
    (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "") ||
    "https://glow-shot-ai-flame.vercel.app"
  );
}

function getApiUrl() {
  return (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
}

export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response(JSON.stringify({ error: "No autenticado" }), {
        status: 401,
      });
    }

    if (!process.env.MP_ACCESS_TOKEN) {
      console.error("❌ Falta MP_ACCESS_TOKEN en el entorno");
      return new Response(
        JSON.stringify({ error: "Config MercadoPago incompleta" }),
        { status: 500 }
      );
    }

    const { planId } = await request.json();

    if (!planId || typeof planId !== "string" || !PRICE_MAP[planId]) {
      return new Response(JSON.stringify({ error: "planId inválido" }), {
        status: 400,
      });
    }

    const APP_URL = getAppUrl();
    const API_URL = getApiUrl();

    // ✅ MODO explícito (no por prefijo)
    // En .env: MP_MODE=sandbox  (o production)
    const mpMode = (process.env.MP_MODE || "sandbox").toLowerCase();

    const item = PRICE_MAP[planId];

    // ✅ Mejor que metadata: external_reference (viene fácil en pagos/webhook)
    const external_reference = `${userId}:${planId}`;

    const notification_url = API_URL ? `${API_URL}/api/mp/webhook` : undefined;

    const preferencePayload = {
      items: [
        {
          title: item.title,
          quantity: 1,
          unit_price: item.unit_price,
          currency_id: "ARS",
        },
      ],
      back_urls: {
        // ✅ mandalo a tu app (Vercel). Evitá ngrok acá.
        success: `${APP_URL}/payment-success`,
        failure: `${APP_URL}/payment-cancel`,
        pending: `${APP_URL}/payment-pending`,
      },
      auto_return: "approved",

      external_reference,

      // (Opcional) también lo dejamos en metadata
      metadata: { app_user_id: userId, plan_id: planId },

      ...(notification_url ? { notification_url } : {}),
    };

    const res = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(preferencePayload),
    });

    const json = await res.json();

    if (!res.ok) {
      console.error("MercadoPago API error:", JSON.stringify(json, null, 2));
      return new Response(
        JSON.stringify({ error: "Error creando preferencia con MercadoPago" }),
        { status: 500 }
      );
    }

    const preferenceId = json?.id;
    const initPoint = json?.init_point || null;
    const sandboxInitPoint = json?.sandbox_init_point || null;

    if (!preferenceId || (!initPoint && !sandboxInitPoint)) {
      console.error("Respuesta incompleta de MP:", json);
      return new Response(
        JSON.stringify({ error: "MercadoPago no devolvió URLs de checkout" }),
        { status: 500 }
      );
    }

    // ✅ Elegí por MP_MODE
    const checkoutUrl =
      (mpMode === "sandbox" ? sandboxInitPoint : initPoint) ||
      initPoint ||
      sandboxInitPoint;

    return new Response(
      JSON.stringify({ preferenceId, checkoutUrl, initPoint, sandboxInitPoint }),
      { status: 200 }
    );
  } catch (e) {
    console.error("mp create-checkout exception:", e);
    return new Response(
      JSON.stringify({ error: e?.message || "Error interno creando checkout (MP)" }),
      { status: 500 }
    );
  }
}
