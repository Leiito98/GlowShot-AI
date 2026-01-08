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
import { PayModal } from "@/app/components/modals/PayModal";
import { Plan } from "@/app/config/plans";

export default function LandingPage() {
  const { isSignedIn } = useUser();
  const router = useRouter();

  const [showAuthModal, setShowAuthModal] = useState(false);

  // ✅ Modal pagos
  const [showPayModal, setShowPayModal] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<Plan | null>(null);

  // Comprar plan usando MercadoPago Checkout Pro
  const buyPlanMP = async (plan: Plan) => {
    try {
      const res = await fetch("/api/mp/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id }),
      });

      const data = await res.json();

      if (!res.ok || !data?.checkoutUrl) {
        console.error("Error mp create-checkout:", data);
        alert(data?.error || "No se pudo iniciar el pago con MercadoPago.");
        return;
      }

      window.location.href = data.checkoutUrl;
    } catch (err) {
      console.error(err);
      alert("Error iniciando el pago con MercadoPago.");
    }
  };

  // Abrir modal métodos para un plan
  const openPaymentMethodsForPlan = (plan: Plan) => {
    setPendingPlan(plan);
    setShowPayModal(true);
  };

  return (
    <div className="min-h-screen font-sans bg-gradient-to-b from-gray-50 via-white to-orange-50 text-gray-900 selection:bg-orange-100 selection:text-orange-900">
      <HeaderBar />

      {/* ✅ Modal pagos (logueado) */}
      <SignedIn>
      <PayModal
        isOpen={showPayModal}
        onClose={() => setShowPayModal(false)}
        preselectedPlanId={pendingPlan?.id ?? null}
        onSelect={({ plan, method }) => {
          if (method === "mercadopago") {
            setShowPayModal(false);
            buyPlanMP(plan);
            return;
          }
          if (method === "payu") {
            alert("PayU (pagos internacionales) lo conectamos en el próximo paso.");
            return;
          }
          alert("USDT (crypto) lo conectamos en el próximo paso.");
        }}
      />
      </SignedIn>

      <main className="pb-20">
        <div className="max-w-6xl mx-auto px-4">
          {/* VISITANTES NO LOGUEADOS */}
          <SignedOut>
            <section className="mt-10 mb-12">
              <div className="rounded-3xl bg-white/80 shadow-[0_18px_60px_rgba(0,0,0,0.08)] p-6 md:p-10 border border-orange-50">
                <p className="text-xs font-semibold text-orange-500 mb-2 uppercase">
                  Nuevo · AuraShot AI
                </p>
                <h1 className="text-3xl md:text-4xl font-bold mb-3">
                  Fotos profesionales de estudio{" "}
                  <span className="text-orange-500">en minutos</span>, no en días.
                </h1>
                <p className="text-sm md:text-base text-gray-600 max-w-2xl mb-5">
                  Entrená tu propio modelo con tus fotos y obtené retratos listos
                  para LinkedIn, CV, Instagram o apps de citas sin salir de casa.
                </p>

                <HomeView onCreateClick={() => setShowAuthModal(true)} />
              </div>
            </section>

            <section id="pricing" className="scroll-mt-24">
              <PricingSection
                showButtons
                requireAuthNotice={() => setShowAuthModal(true)}
              />
            </section>

            <section id="reviews" className="scroll-mt-24">
              <HelpSection />
            </section>

            <AuthChoiceModal
              isOpen={showAuthModal}
              onClose={() => setShowAuthModal(false)}
            />
          </SignedOut>

          {/* USUARIO LOGUEADO */}
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

                <HomeView onCreateClick={() => router.push("/dashboard")} />
              </div>
            </section>

            <section id="pricing" className="scroll-mt-24">
              <PricingSection showButtons onSelectPlan={openPaymentMethodsForPlan} />
            </section>

            <section id="reviews" className="scroll-mt-24">
              <HelpSection />
            </section>
          </SignedIn>
        </div>
      </main>
    </div>
  );
}
