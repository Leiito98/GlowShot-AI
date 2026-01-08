// app/api/mp/webhook/route.js
import { createClient } from "@supabase/supabase-js";
import { addCreditsAndPlan } from "@/lib/credits";

export const runtime = "nodejs";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function normalizePlanId(planIdRaw) {
  const planId = String(planIdRaw || "").trim();
  if (planId === "basic" || planId === "standard" || planId === "executive") return planId;
  return null;
}

async function handleNotification({ paymentId, type }) {
  if (!paymentId) return new Response("Ignored", { status: 200 });
  if (type && type !== "payment") return new Response("Ignored", { status: 200 });

  // Idempotencia rápida
  const { data: existing, error: readErr } = await supabaseAdmin
    .from("mp_payments")
    .select("payment_id")
    .eq("payment_id", String(paymentId))
    .maybeSingle();

  if (readErr) {
    console.error("❌ Error leyendo mp_payments:", readErr);
    return new Response("DB error", { status: 500 });
  }
  if (existing?.payment_id) return new Response("Already processed", { status: 200 });

  // Consultar pago real a MP
  const r = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` },
  });

  const note = await r.json();
  if (!r.ok) {
    console.error("❌ MP payment fetch error:", note);
    return new Response("MP fetch error", { status: 500 });
  }

  if (note?.status !== "approved") {
    return new Response("Not approved", { status: 200 });
  }

  // user + plan desde metadata o external_reference
  const appUserId = note?.metadata?.app_user_id || note?.metadata?.appUserId || null;
  const planId =
    normalizePlanId(note?.metadata?.plan_id) ||
    normalizePlanId(note?.metadata?.planId) ||
    null;

  const ext = String(note?.external_reference || "");
  const extParts = ext.includes(":") ? ext.split(":") : [];

  const finalUserId = appUserId ? String(appUserId) : (extParts[0] ? String(extParts[0]) : null);
  const finalPlanId = planId ? String(planId) : (extParts[1] ? normalizePlanId(extParts[1]) : null);

  if (!finalUserId || !finalPlanId) {
    console.error("⚠️ Missing metadata user/plan:", {
      paymentId,
      metadata: note?.metadata,
      external_reference: note?.external_reference,
    });
    return new Response("Missing metadata", { status: 200 });
  }

  // Insert idempotente
  const payload = {
    payment_id: String(paymentId),
    user_id: String(finalUserId),
    plan_id: String(finalPlanId),
    status: String(note?.status || ""),
    amount: Number(note?.transaction_amount || 0),
    currency: String(note?.currency_id || "ARS"),
    raw: note,
  };

  const { error: insErr } = await supabaseAdmin.from("mp_payments").insert(payload);
  if (insErr) {
    const msg = String(insErr.message || "").toLowerCase();
    const isDup = msg.includes("duplicate") || msg.includes("unique") || msg.includes("23505");
    if (isDup) return new Response("Already processed", { status: 200 });
    console.error("❌ Error insert mp_payments:", insErr);
    return new Response("DB insert error", { status: 500 });
  }

  await addCreditsAndPlan(String(finalUserId), String(finalPlanId));

  console.log("✅ Créditos acreditados", { paymentId, finalUserId, finalPlanId });
  return new Response("OK", { status: 200 });
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => null);
    const paymentId = body?.data?.id || body?.id || null;
    const type = body?.type || body?.topic || null;
    return await handleNotification({ paymentId, type });
  } catch (e) {
    console.error("❌ mp webhook POST error:", e);
    return new Response("Webhook error", { status: 500 });
  }
}

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const paymentId = url.searchParams.get("id") || url.searchParams.get("data.id");
    const type = url.searchParams.get("topic") || url.searchParams.get("type");
    return await handleNotification({ paymentId, type });
  } catch (e) {
    console.error("❌ mp webhook GET error:", e);
    return new Response("Webhook error", { status: 500 });
  }
}
