import { auth } from "@clerk/nextjs/server";

const PRICE_MAP: Record<string, string | undefined> = {
  basic: process.env.PADDLE_PRICE_BASIC,
  standard: process.env.PADDLE_PRICE_STANDARD,
  executive: process.env.PADDLE_PRICE_EXECUTIVE,
};

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "No autenticado" }),
        { status: 401 }
      );
    }

    const { planId } = await request.json();

    if (!planId || typeof planId !== "string") {
      return new Response(
        JSON.stringify({ error: "planId inválido" }),
        { status: 400 }
      );
    }

    const priceId = PRICE_MAP[planId];

    if (!priceId) {
      return new Response(
        JSON.stringify({ error: "Price ID no configurado para ese plan" }),
        { status: 400 }
      );
    }

    const payload = {
      items: [
        {
          price_id: priceId,
          quantity: 1,
        },
      ],
      custom_data: {
        app_user_id: userId,
        plan_id: planId, // "basic" | "standard" | "executive"
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment-success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment-cancel`,
    };

    const checkoutRes = await fetch(
      "https://sandbox-api.paddle.com/checkout",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PADDLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const json = await checkoutRes.json();

    if (!checkoutRes.ok) {
      console.error("Paddle checkout error:", json);
      return new Response(
        JSON.stringify({ error: "Error creando checkout de Paddle" }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({
        checkoutUrl: json?.data?.url,
      }),
      { status: 200 }
    );
  } catch (e: any) {
    console.error("create-checkout error:", e);
    return new Response(
      JSON.stringify({ error: e.message || "Error interno" }),
      { status: 500 }
    );
  }
}
