"use client";

import Script from "next/script";

declare global {
  interface Window {
    Paddle?: any;
  }
}

export default function PaddleBootstrap() {
  const clientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;

  // Si falta el token, no intentamos inicializar nada
  if (!clientToken) {
    console.error("Falta NEXT_PUBLIC_PADDLE_CLIENT_TOKEN");
    return null;
  }

  return (
    <Script
      src="https://cdn.paddle.com/paddle/v2/paddle.js"
      strategy="afterInteractive"
      onLoad={() => {
        if (!window.Paddle) {
          console.error("Paddle.js no se cargó correctamente");
          return;
        }

        // 👇 AQUÍ, ya con Paddle cargado, seteamos sandbox
        window.Paddle.Environment.set("sandbox");

        window.Paddle.Initialize({
          token: clientToken,
          checkout: {
            settings: {
              displayMode: "overlay",
              theme: "light",
              locale: "es",
            },
          },
          eventCallback: (data: any) => {
            console.log("[Paddle event]", data);
          },
        });

        console.log("✅ Paddle.js inicializado en modo sandbox");
      }}
    />
  );
}
