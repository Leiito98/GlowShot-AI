// app/api/mp/webhook/route.js
import { createClient } from "@supabase/supabase-js";
import { addCreditsAndPlan } from "@/lib/credits";

export const runtime = "nodejs";
export const maxDuration = 60;

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function normalizePlanId(raw) {
  const v = String(raw || "").trim().toLowerCase();
  if (v === "basic" || v === "standard" || v === "executive") return v;
  return null;
}

function extractUserAndPlan(note) {
  // Preferimos metadata (lo más limpio)
  const metaUser =
    note?.metadata?.app_user_id ??
    note?.metadata?.appUserId ??
    note?.metadata?.user_id ??
    null;

  const metaPlan =
    normalizePlanId(note?.metadata?.plan_id) ??
    normalizePlanId(note?.metadata?.planId) ??
    null;

  // Fallback external_reference "userId:planId"
  let extUser = null;
  let extPlan = null;
  const ext = String(note?.external_reference || "");
  if (ext.includes(":")) {
    const [u, p] = ext.split(":");
    if (u) extUser = String(u);
    extPlan = normalizePlanId(p);
  }

  const userId = metaUser ? String(metaUser) : extUser;
  const planId = metaPlan || extPlan;

  return { userId, planId };
}

export async function POST(req) {
  try {
    if (!process.env.MP_ACCESS_TOKEN) {
      console.error("❌ Falta MP_ACCESS_TOKEN");
      return new Response("Missing token", { status: 500 });
    }
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("❌ Falta SUPABASE env");
      return new Response("Missing supabase env", { status: 500 });
    }

    const body = await req.json().catch(() => null);
    if (!body) return new Response("Bad JSON", { status: 400 });

    // MP manda: { type: "payment", data: { id } } o variantes
    const paymentId = body?.data?.id || body?.id || null;
    const topic = body?.type || body?.topic || null;

    // Ignorar cosas que no sean payment
    if (!paymentId) return new Response("Ignored", { status: 200 });
    if (topic && String(topic) !== "payment") return new Response("Ignored", { status: 200 });

    // 1) Consultar pago real en MP
    const r = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` },
      cache: "no-store",
    });

    const note = await r.json();
    if (!r.ok) {
      console.error("❌ MP payment fetch error:", note);
      return new Response("MP fetch error", { status: 500 }); // para que MP reintente
    }

    const status = String(note?.status || "");
    // Solo acreditamos si approved
    if (status !== "approved") {
      // Podés opcionalmente guardar el evento igual (historial). Yo lo guardo sin acreditar:
      try {
        await supabaseAdmin.from("mp_payments").insert({
          payment_id: String(paymentId),
          status,
          amount: Number(note?.transaction_amount || 0),
          currency: String(note?.currency_id || "ARS"),
          credited: false,
          raw: note,
          created_at: new Date().toISOString(),
        });
      } catch {
        // si ya existe por unique, no pasa nada
      }

      return new Response("Not approved", { status: 200 });
    }

    // 2) Resolver userId + planId
    const { userId, planId } = extractUserAndPlan(note);

    if (!userId || !planId) {
      console.error("⚠️ Missing userId/planId desde MP:", {
        paymentId,
        metadata: note?.metadata,
        external_reference: note?.external_reference,
      });
      return new Response("Missing metadata", { status: 200 });
    }

    // 3) Insert idempotente (UNIQUE(payment_id))
    const insertPayload = {
      payment_id: String(paymentId),
      user_id: String(userId),
      plan_id: String(planId),
      status,
      amount: Number(note?.transaction_amount || 0),
      currency: String(note?.currency_id || "ARS"),
      credited: false,
      raw: note, // jsonb
      created_at: new Date().toISOString(),
    };

    const { error: insErr } = await supabaseAdmin.from("mp_payments").insert(insertPayload);

    if (insErr) {
      const msg = String(insErr.message || "").toLowerCase();
      const isDuplicate = msg.includes("duplicate") || msg.includes("unique") || msg.includes("23505");
      if (isDuplicate) {
        // Ya fue procesado (o al menos insertado). Aseguramos que no duplique crédito.
        return new Response("Already processed", { status: 200 });
      }
      console.error("❌ Error insert mp_payments:", insErr);
      return new Response("DB insert error", { status: 500 });
    }

    // 4) Acreditar (solo una vez gracias al UNIQUE + insert antes)
    await addCreditsAndPlan(String(userId), String(planId));

    // 5) Marcar como acreditado
    await supabaseAdmin
      .from("mp_payments")
      .update({ credited: true, credited_at: new Date().toISOString() })
      .eq("payment_id", String(paymentId));

    console.log("✅ Créditos acreditados:", { userId, planId, paymentId });

    return new Response("OK", { status: 200 });
  } catch (e) {
    console.error("❌ mp webhook error:", e);
    return new Response("Webhook error", { status: 500 });
  }
}
