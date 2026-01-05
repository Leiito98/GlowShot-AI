import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { planId } = await req.json();

    const PRICE_MAP: Record<string, string | undefined> = {
      basic: process.env.PADDLE_PRICE_BASIC,
      standard: process.env.PADDLE_PRICE_STANDARD,
      executive: process.env.PADDLE_PRICE_EXECUTIVE,
    };

    const priceId = PRICE_MAP[planId];
    if (!priceId) {
      return NextResponse.json(
        { error: "Precio no configurado para este plan" },
        { status: 400 }
      );
    }

    const res = await fetch(
      "https://sandbox-api.paddle.com/checkouts",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PADDLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: [
            {
              price_id: priceId,
              quantity: 1,
            },
          ],

          customer: {
            // opcional pero útil en sandbox
            email: "sandbox@test.dev",
          },

          custom_data: {
            plan_id: planId,
          },

          success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payment-success`,
          cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payment-cancel`,
        }),
      }
    );

    const json = await res.json();

    // 👇 ESTE campo es el link del checkout UI
    const checkoutUrl = json?.data?.checkout_url;

    if (!checkoutUrl) {
      console.error("Paddle checkout error", json);
      return NextResponse.json(
        { error: "No se pudo crear el checkout" },
        { status: 500 }
      );
    }

    return NextResponse.json({ checkoutUrl });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
