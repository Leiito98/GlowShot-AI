// app/page.tsx
"use client";

import { useEffect } from "react";
import { useUser, SignedIn, SignedOut } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

import { HeaderBar } from "@/app/components/layout/HeaderBar";
import { PricingSection } from "@/app/components/sections/PricingSection";
import { HelpSection } from "@/app/components/sections/HelpSection";
import { HomeView } from "@/app/components/views/HomeView";
import { AuthChoiceModal } from "@/app/components/modals/AuthChoiceModal";

export default function LandingPage() {
  const { isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) {
      router.replace("/dashboard");
    }
  }, [isSignedIn, router]);

  return (
    <div className="min-h-screen font-sans bg-gradient-to-b from-gray-50 via-white to-orange-50 text-gray-900 selection:bg-orange-100 selection:text-orange-900">
      <HeaderBar />

      <main className="pb-20">
        <div className="max-w-6xl mx-auto px-4">
          <SignedOut>
            <section className="mt-10 mb-12">
              <div className="rounded-3xl bg-white/80 shadow-[0_18px_60px_rgba(0,0,0,0.08)] p-6 md:p-10 border border-orange-50">
                <p className="text-xs font-semibold text-orange-500 mb-2 uppercase">
                  Nuevo · GlowShot AI
                </p>
                <h1 className="text-3xl md:text-4xl font-bold mb-3">
                  Fotos profesionales de estudio{" "}
                  <span className="text-orange-500">en minutos</span>, no en días.
                </h1>
                <p className="text-sm md:text-base text-gray-600 max-w-2xl mb-5">
                  Entrená tu propio modelo con tus fotos y obtené retratos listos
                  para LinkedIn, CV, Instagram o apps de citas sin salir de casa.
                </p>

                <HomeView onCreateClick={() => {}} />
              </div>
            </section>

            <PricingSection showButtons={false} />
            <HelpSection />
          </SignedOut>

          {/* Si está logueado, casi ni llega a ver esto porque lo redirige al dashboard */}
          <SignedIn>
            <div className="mt-20 text-center text-sm text-gray-500">
              Redirigiendo a tu dashboard...
            </div>
          </SignedIn>
        </div>
      </main>
    </div>
  );
}
