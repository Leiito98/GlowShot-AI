import crypto from "crypto";
import { addCreditsAndPlan } from "@/lib/credits";

/**
 * Verifica la firma de Paddle Billing v2
 * Header: Paddle-Signature: t=timestamp,h=HMAC
 */
function verifyPaddleSignature(rawBody: string, signatureHeader: string | null) {
  if (!signatureHeader) return false;

  const secret = process.env.PADDLE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("Falta PADDLE_WEBHOOK_SECRET en .env");
    return false;
  }

  // Esperamos algo tipo: "t=1234567890,h=abcdef..."
  const parts = Object.fromEntries(
    signatureHeader.split(",").map((p) => {
      const [k, v] = p.split("=");
      return [k.trim(), (v || "").trim()];
    })
  );

  if (!parts.h) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(expected, "hex"),
    Buffer.from(parts.h, "hex")
  );
}

// Créditos por plan (ajustá estos números si querés)
const CREDITS_BY_PLAN: Record<string, number> = {
  basic: 40,
  standard: 60,
  executive: 100,
};

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const sig = request.headers.get("Paddle-Signature");

    if (!verifyPaddleSignature(rawBody, sig)) {
      console.error("Firma de Paddle inválida");
      return new Response("Invalid signature", { status: 401 });
    }

    const body = JSON.parse(rawBody);

    const eventType = body?.event_type;
    if (eventType !== "transaction.completed") {
      // ignoramos otros eventos
      return new Response("Ignored", { status: 200 });
    }

    const userId = body?.data?.custom_data?.app_user_id as string | undefined;
    const planId = body?.data?.custom_data?.plan_id as
      | "basic"
      | "standard"
      | "executive"
      | undefined;

    if (!userId || !planId) {
      console.error("Webhook sin userId o planId", { userId, planId });
      return new Response("Missing data", { status: 400 });
    }

    const credits = CREDITS_BY_PLAN[planId] ?? 0;
    if (!credits) {
      console.error("Plan sin créditos configurados:", planId);
      return new Response("Plan not configured", { status: 400 });
    }

    await addCreditsAndPlan(userId, credits, planId);

    return new Response("OK", { status: 200 });
  } catch (e) {
    console.error("Webhook error:", e);
    return new Response("Webhook failure", { status: 500 });
  }
}
