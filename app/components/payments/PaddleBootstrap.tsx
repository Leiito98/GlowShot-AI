// app/components/payments/PaddleBootstrap.tsx
"use client";

import Script from "next/script";

export default function PaddleBootstrap() {
  const clientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;

  // Si no hay token (por seguridad), no hacemos nada
  if (!clientToken) return null;

  return (
    <Script
      src="https://cdn.paddle.com/paddle/v2/paddle.js"
      strategy="afterInteractive"
      onLoad={() => {
        // @ts-ignore en JS no hace falta, pero por si acaso
        if (window.Paddle) {
          // @ts-ignore
          window.Paddle.Initialize({
            token: clientToken,
            checkout: {
              settings: {
                displayMode: "overlay",
                theme: "light",
                locale: "es",
              },
            },
          });
        }
      }}
    />
  );
}
