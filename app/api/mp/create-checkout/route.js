// app/api/mp/create-checkout/route.js
import { auth } from "@clerk/nextjs/server";

export const runtime = "nodejs";

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

function normalizeBaseUrl(url) {
  return String(url || "").trim().replace(/\/$/, "");
}

/**
 * Base URL público de tu app (Vercel).
 * Debe ser tipo: https://glow-shot-ai-flame.vercel.app
 */
function getAppBaseUrl() {
  const appUrl =
    normalizeBaseUrl(process.env.NEXT_PUBLIC_APP_URL) ||
    normalizeBaseUrl(process.env.NEXT_PUBLIC_API_URL) || // fallback si usabas esto
    "";

  if (!appUrl) {
    // 🚨 Sin base url no podemos armar back_urls ni notification_url correctamente
    // devolvemos string vacío y lo manejamos en el handler
    return "";
  }

  // Si por error te ponen /api/... o /api/mp/webhook, lo limpiamos
  return appUrl.replace(/\/api\/.*$/i, "");
}

function isValidPlanId(planId) {
  return planId === "basic" || planId === "standard" || planId === "executive";
}

export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response(JSON.stringify({ error: "No autenticado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!process.env.MP_ACCESS_TOKEN) {
      console.error("❌ Falta MP_ACCESS_TOKEN");
      return new Response(
        JSON.stringify({ error: "Config MercadoPago incompleta" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = await request.json().catch(() => ({}));
    const planId = String(body?.planId || "").trim();

    if (!isValidPlanId(planId) || !PRICE_MAP[planId]) {
      return new Response(JSON.stringify({ error: "planId inválido" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const APP_BASE_URL = getAppBaseUrl();
    if (!APP_BASE_URL) {
      console.error(
        "❌ Falta NEXT_PUBLIC_APP_URL (ej: https://tuapp.vercel.app). Es obligatorio para back_urls + notification_url"
      );
      return new Response(
        JSON.stringify({
          error:
            "Falta NEXT_PUBLIC_APP_URL en el entorno (ej: https://tuapp.vercel.app)",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // ✅ MP_MODE=sandbox | production
    const mpMode = String(process.env.MP_MODE || "sandbox").toLowerCase();

    const item = PRICE_MAP[planId];

    // ✅ Esto es CLAVE para tu webhook (fallback robusto)
    const external_reference = `${userId}:${planId}`;

    // ✅ Webhook: SIEMPRE desde tu dominio público (no localhost)
    const notification_url = `${APP_BASE_URL}/api/mp/webhook`;

    // ✅ Back URLs: a páginas de tu app (no /api)
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
        success: `${APP_BASE_URL}/payment-success`,
        failure: `${APP_BASE_URL}/payment-cancel`,
        pending: `${APP_BASE_URL}/payment-pending`,
      },
      auto_return: "approved",

      external_reference,

      // (Opcional) también en metadata
      metadata: { app_user_id: userId, plan_id: planId },

      // ✅ MUY IMPORTANTE: sin esto no te llega el webhook
      notification_url,
    };

    console.log("🟧 MP create-checkout payload:", {
      planId,
      mpMode,
      notification_url,
      external_reference,
      back_urls: preferencePayload.back_urls,
    });

    const res = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(preferencePayload),
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error("❌ MercadoPago API error:", JSON.stringify(json, null, 2));
      return new Response(
        JSON.stringify({
          error: "Error creando preferencia con MercadoPago",
          details: json,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const preferenceId = json?.id || null;
    const initPoint = json?.init_point || null;
    const sandboxInitPoint = json?.sandbox_init_point || null;

    if (!preferenceId || (!initPoint && !sandboxInitPoint)) {
      console.error("❌ Respuesta incompleta de MP:", json);
      return new Response(
        JSON.stringify({ error: "MercadoPago no devolvió URLs de checkout" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // ✅ Elegí por MP_MODE
    const checkoutUrl =
      (mpMode === "sandbox" ? sandboxInitPoint : initPoint) ||
      initPoint ||
      sandboxInitPoint;

    return new Response(
      JSON.stringify({
        preferenceId,
        checkoutUrl,
        initPoint,
        sandboxInitPoint,
        mode: mpMode,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("❌ mp create-checkout exception:", e);
    return new Response(
      JSON.stringify({
        error: e?.message || "Error interno creando checkout (MP)",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
