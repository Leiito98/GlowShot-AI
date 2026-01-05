// app/api/paddle/webhook/route.js
import crypto from "crypto";
import { addCreditsAndPlan } from "@/lib/credits";

export const runtime = "nodejs"; // para usar crypto en Vercel/Next

export async function POST(request) {
  try {
    const secret = process.env.PADDLE_WEBHOOK_SECRET;
    if (!secret) {
      console.error("❌ Falta PADDLE_WEBHOOK_SECRET en el entorno");
      return new Response("Missing secret", { status: 500 });
    }

    // 1) Leer header de firma
    const sigHeader = request.headers.get("Paddle-Signature");
    if (!sigHeader) {
      console.error("❌ Falta header Paddle-Signature");
      return new Response("Missing signature", { status: 400 });
    }

    // 2) Leer body crudo (IMPORTANTE: usar text(), no json())
    const rawBody = await request.text();

    // 3) Parsear header ts=...;h1=...
    const [tsPart, h1Part] = sigHeader.split(";");
    const ts = tsPart?.split("=")[1];
    const h1 = h1Part?.split("=")[1];

    if (!ts || !h1) {
      console.error("❌ Formato inválido de Paddle-Signature:", sigHeader);
      return new Response("Bad signature format", { status: 400 });
    }

    // 4) Recalcular HMAC SHA256 con el secret y comparar
    const payload = `${ts}:${rawBody}`;
    const computed = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");

    if (computed !== h1) {
      console.error("❌ Firma inválida. Esperado:", h1, "Calculado:", computed);
      return new Response("Invalid signature", { status: 400 });
    }

    // 5) Firma OK → parseamos JSON
    const event = JSON.parse(rawBody);
    console.log("✅ Webhook verificado:", event.event_type);

    // Solo nos interesa transaction.completed
    if (event.event_type !== "transaction.completed") {
      console.log("ℹ️ Evento ignorado:", event.event_type);
      return new Response("Ignored", { status: 200 });
    }

    const customData = event.data?.custom_data || {};
    const appUserId = customData.app_user_id;
    const planId = customData.plan_id; // "basic" | "standard" | "executive"

    if (!appUserId || !planId) {
      console.error(
        "⚠️ Falta app_user_id o plan_id en custom_data:",
        customData
      );
      // devolvemos 200 igual para que Paddle no siga reintentando
      return new Response("Missing custom_data", { status: 200 });
    }

    // 6) Dar créditos + guardar plan usando tu helper
    await addCreditsAndPlan(appUserId, planId);
    console.log(
      `🎉 Créditos aplicados vía webhook. userId=${appUserId}, planId=${planId}`
    );

    // Muy importante: 2xx para que Paddle marque el webhook como entregado
    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("❌ Error en webhook Paddle:", err);
    // 500 hace que Paddle reintente luego
    return new Response("Webhook error", { status: 500 });
  }
}
