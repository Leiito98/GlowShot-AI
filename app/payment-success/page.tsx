"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PaymentSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Mandamos una señal al dashboard para mostrar toast
    router.replace("/dashboard?paid=1");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-gray-700">
      Redirigiendo al dashboard...
    </div>
  );
}
