// app/page.tsx
"use client";

import { useState } from "react";
import { useUser, SignedIn, SignedOut } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

import { HeaderBar } from "@/app/components/layout/HeaderBar";
import { PricingSection } from "@/app/components/sections/PricingSection";
import { HelpSection } from "@/app/components/sections/HelpSection";
import { HomeView } from "@/app/components/views/HomeView";
import { AuthChoiceModal } from "@/app/components/modals/AuthChoiceModal";
import PaddleBootstrap from "@/app/components/payments/PaddleBootstrap";
import { Plan } from "@/app/config/plans";

export default function LandingPage() {
  const { isSignedIn } = useUser();
  const router = useRouter();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<
    "basic" | "standard" | "executive" | null
  >(null);

  // Comprar plan (logueado) usando Paddle
  const buyPlan = async (plan: Plan) => {
    setSelectedPlan(plan.id as "basic" | "standard" | "executive");

    try {
      const res = await fetch("/api/paddle/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id }),
      });

      const data = await res.json();

      if (!res.ok || !data?.transactionId) {
        console.error("Error create-checkout:", data);
        alert(data?.error || "No se pudo iniciar el pago con Paddle.");
        return;
      }

      // @ts-ignore
      if (window.Paddle) {
        // @ts-ignore
        window.Paddle.Checkout.open({
          transactionId: data.transactionId,
          settings: {
            displayMode: "overlay",
            theme: "light",
            locale: "es",
          },
        });
      } else {
        console.error("Paddle JS no está disponible en window.");
        alert(
          "No se pudo cargar el checkout de Paddle. Recarga la página e inténtalo de nuevo."
        );
      }
    } catch (err) {
      console.error(err);
      alert("Error iniciando el pago con Paddle.");
    }
  };

  return (
    <div className="min-h-screen font-sans bg-gradient-to-b from-gray-50 via-white to-orange-50 text-gray-900 selection:bg-orange-100 selection:text-orange-900">
      {/* Script de Paddle para poder abrir el checkout desde la landing */}
      <PaddleBootstrap />
      <HeaderBar />

      <main className="pb-20">
        <div className="max-w-6xl mx-auto px-4">
          {/* VISITANTES NO LOGUEADOS */}
          <SignedOut>
            <section className="mt-10 mb-12">
              <div className="rounded-3xl bg-white/80 shadow-[0_18px_60px_rgba(0,0,0,0.08)] p-6 md:p-10 border border-orange-50">
                <p className="text-xs font-semibold text-orange-500 mb-2 uppercase">
                  Nuevo · GlowShot AI
                </p>
                <h1 className="text-3xl md:text-4xl font-bold mb-3">
                  Fotos profesionales de estudio{" "}
                  <span className="text-orange-500">en minutos</span>, no en
                  días.
                </h1>
                <p className="text-sm md:text-base text-gray-600 max-w-2xl mb-5">
                  Entrená tu propio modelo con tus fotos y obtené retratos
                  listos para LinkedIn, CV, Instagram o apps de citas sin salir
                  de casa.
                </p>

                {/* CTA principal para visitantes (abre modal de auth) */}
                <HomeView onCreateClick={() => setShowAuthModal(true)} />
              </div>
            </section>

            {/* Pricing para visitantes: botones "Seleccionar" -> modal de registro/login */}
            <PricingSection
              showButtons
              requireAuthNotice={() => setShowAuthModal(true)}
            />

            <HelpSection />

            <AuthChoiceModal
              isOpen={showAuthModal}
              onClose={() => setShowAuthModal(false)}
            />
          </SignedOut>

          {/* USUARIO LOGUEADO: ve la misma landing pero puede ir al dashboard y comprar directo */}
          <SignedIn>
            <section className="mt-10 mb-12">
              <div className="rounded-3xl bg-white/80 shadow-[0_18px_60px_rgba(0,0,0,0.08)] p-6 md:p-10 border border-orange-50">
                <p className="text-xs font-semibold text-orange-500 mb-2 uppercase">
                  Bienvenido de nuevo 👋
                </p>
                <h1 className="text-3xl md:text-4xl font-bold mb-3">
                  Crea tus próximos retratos{" "}
                  <span className="text-orange-500">en minutos</span>.
                </h1>
                <p className="text-sm md:text-base text-gray-600 max-w-2xl mb-5">
                  Accedé a tu dashboard para entrenar tu modelo o generar nuevas
                  fotos profesionales con un solo clic.
                </p>

                {/* CTA principal logueado: ir al dashboard */}
                <HomeView onCreateClick={() => router.push("/dashboard")} />
              </div>
            </section>

            {/* Pricing logueado: abre directo el checkout de Paddle */}
            <PricingSection showButtons onSelectPlan={buyPlan} />

            <HelpSection />
          </SignedIn>
        </div>
      </main>
    </div>
  );
}
