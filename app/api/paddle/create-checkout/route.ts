import { auth } from "@clerk/nextjs/server";

const API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://api.paddle.com"
    : "https://sandbox-api.paddle.com";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response(JSON.stringify({ error: "No autenticado" }), {
        status: 401,
      });
    }

    const { priceId, planId } = await req.json();

    const res = await fetch(`${API_BASE}/transactions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PADDLE_API_KEY}`,
        "Content-Type": "application/json",
        "Paddle-Version": "1",
      },
      body: JSON.stringify({
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
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment-success`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment-cancel`,
      }),
    });

    const json = await res.json();

    if (!res.ok) {
      console.error("Paddle API error:", json);
      return new Response(
        JSON.stringify({ error: "Error creando transacción" }),
        { status: 500 }
      );
    }

    const checkoutUrl = json?.data?.checkout?.url;

    if (!checkoutUrl) {
      console.error("Missing checkout.url", json);
      return new Response(
        JSON.stringify({ error: "Paddle no devolvió checkout.url" }),
        { status: 500 }
      );
    }

    return new Response(JSON.stringify({ checkoutUrl }), { status: 200 });
  } catch (e) {
    console.error("create-checkout exception:", e);
    return new Response(
      JSON.stringify({ error: "Error interno creando checkout" }),
      { status: 500 }
    );
  }
}
