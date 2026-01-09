// app/api/mp/create-checkout/route.js
import { auth } from "@clerk/nextjs/server";
import { PLANS } from "@/app/config/plans";

export const runtime = "nodejs";

// Fallback por si DolarApi falla (ponelo en env si querés)
const FALLBACK_BLUE_ARS = Number(process.env.FALLBACK_BLUE_ARS || 1300);

// Cache del fetch (5 min) para no pegarle a la API siempre
const BLUE_REVALIDATE_SECONDS = Number(process.env.BLUE_REVALIDATE_SECONDS || 300);

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
    normalizeBaseUrl(process.env.NEXT_PUBLIC_API_URL) ||
    "";

  if (!appUrl) return "";

  // Si por error te ponen /api/... o /api/mp/webhook, lo limpiamos
  return appUrl.replace(/\/api\/.*$/i, "");
}

function isValidPlanId(planId) {
  return planId === "basic" || planId === "standard" || planId === "executive";
}

function findPlan(planId) {
  return PLANS.find((p) => p.id === planId) || null;
}

async function getDolarBlueVenta() {
  try {
    const res = await fetch("https://dolarapi.com/v1/dolares/blue", {
      next: { revalidate: BLUE_REVALIDATE_SECONDS },
      headers: { accept: "application/json" },
    });

    if (!res.ok) throw new Error(`DolarApi status ${res.status}`);
    const data = await res.json();

    // En la doc se ve: { compra: number, venta: number, ... }
    const venta = Number(data?.venta);
    if (!Number.isFinite(venta) || venta <= 0) throw new Error("venta inválida");

    return venta;
  } catch (e) {
    console.warn("⚠️ DolarApi falló, usando fallback:", e?.message || e);
    return FALLBACK_BLUE_ARS;
  }
}

function arsFromUsd(usd, blueVenta) {
  // MP funciona mejor con enteros en ARS
  const n = Number(usd) * Number(blueVenta);
  return Math.round(n);
}

// (Opcional) “precio psicológico”
function roundToNearest(value, step = 10) {
  const v = Number(value);
  const s = Number(step);
  if (!Number.isFinite(v) || !Number.isFinite(s) || s <= 0) return value;
  return Math.round(v / s) * s;
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

    if (!isValidPlanId(planId)) {
      return new Response(JSON.stringify({ error: "planId inválido" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const plan = findPlan(planId);
    if (!plan) {
      return new Response(JSON.stringify({ error: "Plan no encontrado" }), {
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

    // ✅ Dólar blue (VENTA) del día
    const blueVenta = await getDolarBlueVenta();

    // ✅ Precio final en ARS desde USD (plans.ts)
    // plan.price = USD
    let unitPriceArs = arsFromUsd(plan.price, blueVenta);

    // (Opcional) redondeo a 10 / 50 / 100 para estética
    // Cambiá el step o eliminá esta línea si no lo querés.
    unitPriceArs = roundToNearest(unitPriceArs, 10);

    const title = `AuraShot – ${plan.name}`;

    // ✅ Esto es CLAVE para tu webhook (fallback robusto)
    const external_reference = `${userId}:${planId}`;

    // ✅ Webhook: SIEMPRE desde tu dominio público (no localhost)
    const notification_url = `${APP_BASE_URL}/api/mp/webhook`;

    // ✅ Back URLs: a páginas de tu app (no /api)
    const preferencePayload = {
      items: [
        {
          title,
          quantity: 1,
          unit_price: unitPriceArs,
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

      // metadata útil para auditoría / debugging
      metadata: {
        app_user_id: userId,
        plan_id: planId,
        usd_price: plan.price,
        blue_venta: blueVenta,
        ars_price: unitPriceArs,
      },

      notification_url,
    };

    console.log("🟧 MP create-checkout payload:", {
      planId,
      mpMode,
      notification_url,
      external_reference,
      blueVenta,
      usdPrice: plan.price,
      unitPriceArs,
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

        // 👇 útiles para debug/mostrar en tu frontend si querés
        blueVenta,
        usdPrice: plan.price,
        unitPriceArs,
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
