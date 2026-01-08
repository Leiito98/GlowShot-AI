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

export async function POST(req) {
  try {
    if (!process.env.MP_ACCESS_TOKEN) {
      console.error("❌ Falta MP_ACCESS_TOKEN");
      return new Response("Missing token", { status: 500 });
    }
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("❌ Falta SUPABASE env (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)");
      return new Response("Missing supabase env", { status: 500 });
    }

    const body = await req.json().catch(() => null);
    if (!body) return new Response("Bad JSON", { status: 400 });

    // MP suele mandar:
    // { type: "payment", data: { id: "123" } }
    // o { action, api_version, data: { id }, ... }
    const paymentId = body?.data?.id || body?.id || null;
    const type = body?.type || body?.topic || null;

    // Si no es pago, ignoramos (2xx para que MP no reintente)
    if (!paymentId) return new Response("Ignored", { status: 200 });
    if (type && type !== "payment") return new Response("Ignored", { status: 200 });

    // (A) Idempotencia rápida: si ya procesamos ese payment_id, cortamos acá
    {
      const { data: existing, error } = await supabaseAdmin
        .from("mp_payments")
        .select("payment_id")
        .eq("payment_id", String(paymentId))
        .maybeSingle();

      if (error) {
        console.error("❌ Error leyendo mp_payments:", error);
        // Si no podemos validar idempotencia, mejor 500 para que MP reintente
        return new Response("DB error", { status: 500 });
      }

      if (existing?.payment_id) {
        return new Response("Already processed", { status: 200 });
      }
    }

    // 1) Consultar pago real a MP
    const r = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` },
    });

    const note = await r.json();

    if (!r.ok) {
      console.error("❌ MP payment fetch error:", note);
      return new Response("MP fetch error", { status: 500 });
    }

    // 2) Validar estado
    // approved = pago acreditado
    if (note?.status !== "approved") {
      // Guardamos igualmente el registro como "no aprobado" para evitar loops raros?
      // No: mejor NO marcarlo como procesado hasta approved, así MP reintenta y luego acredita.
      return new Response("Not approved", { status: 200 });
    }

    // 3) Obtener user + plan
    // ✅ Tu create-checkout ya manda metadata: { app_user_id, plan_id }
    const appUserId =
      note?.metadata?.app_user_id ||
      note?.metadata?.appUserId ||
      null;

    const planId =
      normalizePlanId(note?.metadata?.plan_id) ||
      normalizePlanId(note?.metadata?.planId) ||
      null;

    // Fallback por si alguna vez usás external_reference tipo "userId:planId"
    if (!appUserId || !planId) {
      const ext = String(note?.external_reference || "");
      if (ext.includes(":")) {
        const [u, p] = ext.split(":");
        if (!appUserId && u) {
          // ojo: si venía con metadata, no pisa; solo fallback
        }
      }
    }

    const finalUserId = appUserId ? String(appUserId) : null;
    const finalPlanId =
      planId ||
      (() => {
        const ext = String(note?.external_reference || "");
        const parts = ext.split(":");
        const p = parts?.[1];
        return normalizePlanId(p);
      })();

    const fallbackUserId =
      finalUserId ||
      (() => {
        const ext = String(note?.external_reference || "");
        const parts = ext.split(":");
        const u = parts?.[0];
        return u ? String(u) : null;
      })();

    if (!fallbackUserId || !finalPlanId) {
      console.error("⚠️ No pude resolver app_user_id / plan_id desde MP:", {
        paymentId,
        metadata: note?.metadata,
        external_reference: note?.external_reference,
      });
      // Respondemos 200 para que no reintente infinito, pero no acreditamos
      return new Response("Missing metadata", { status: 200 });
    }

    // 4) Insertar en mp_payments primero (idempotencia fuerte)
    //    Si hay carrera (MP manda duplicado), unique constraint evita doble crédito.
    const insertPayload = {
      payment_id: String(paymentId),
      user_id: String(fallbackUserId),
      plan_id: String(finalPlanId),
      status: String(note?.status || ""),
      amount: Number(note?.transaction_amount || 0),
      currency: String(note?.currency_id || "ARS"),
      raw: note, // jsonb
    };

    const { error: insErr } = await supabaseAdmin
      .from("mp_payments")
      .insert(insertPayload);

    if (insErr) {
      // Si es duplicado por unique, lo tratamos como OK (ya procesado)
      const msg = String(insErr.message || "");
      const isDuplicate =
        msg.toLowerCase().includes("duplicate") ||
        msg.toLowerCase().includes("unique") ||
        msg.toLowerCase().includes("23505");
      if (isDuplicate) return new Response("Already processed", { status: 200 });

      console.error("❌ Error insert mp_payments:", insErr);
      return new Response("DB insert error", { status: 500 });
    }

    // 5) Acreditar créditos + plan (tu helper)
    await addCreditsAndPlan(String(fallbackUserId), String(finalPlanId));

    console.log("✅ Créditos acreditados:", {
      userId: fallbackUserId,
      planId: finalPlanId,
      paymentId,
    });

    return new Response("OK", { status: 200 });
  } catch (e) {
    console.error("❌ mp webhook error:", e);
    return new Response("Webhook error", { status: 500 });
  }
}
