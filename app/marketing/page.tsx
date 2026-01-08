// app/marketing/page.tsx
"use client";

import Link from "next/link";

export default function MarketingHome() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white text-gray-900">
      <header className="w-full max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
        <span className="text-xl font-bold tracking-tight">
          AuraShot<span className="text-orange-500">.ai</span>
        </span>
        <nav className="flex items-center gap-4 text-sm text-gray-600">
          <Link href="/marketing/terminos" className="hover:text-gray-900">
            Términos
          </Link>
          <Link href="/marketing/privacidad" className="hover:text-gray-900">
            Privacidad
          </Link>
        </nav>
      </header>

      <section className="w-full max-w-5xl mx-auto px-6 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            Crea retratos profesionales con IA en minutos.
          </h1>
          <p className="text-base md:text-lg text-gray-600 mb-6">
            Sube algunas selfies, entrena tu modelo personalizado y recibe
            decenas de fotos listas para LinkedIn, redes sociales o apps de
            citas. Sin sesiones de fotos, sin estudio, sin vergüenza frente a
            la cámara.
          </p>

          <p className="text-xs text-gray-500 mb-8">
            Usamos tus fotos solo para entrenar tu modelo y generar tus
            retratos. Tú decides qué guardar y qué borrar.
          </p>

          <div className="flex flex-wrap gap-3">
            {/* Esto te lleva a tu app actual en la raíz */}
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-semibold bg-orange-500 text-white hover:bg-orange-600 shadow-md"
            >
              Empezar ahora
            </Link>
            <a
              href="mailto:soporte@AuraShot.ai"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Hablar con soporte
            </a>
          </div>
        </div>

        <div className="relative">
          <div className="aspect-[4/5] w-full max-w-sm mx-auto rounded-3xl bg-gray-900/5 border border-gray-200 shadow-xl flex items-center justify-center">
            <span className="text-sm text-gray-500 px-8 text-center">
              Placeholder para un mockup antes/después de tus retratos con IA.
            </span>
          </div>
        </div>
      </section>

      <footer className="w-full border-t border-gray-100 mt-12">
        <div className="max-w-5xl mx-auto px-6 py-6 text-xs text-gray-500 flex flex-wrap justify-between gap-2">
          <span>
            © {new Date().getFullYear()} AuraShot AI. Todos los derechos
            reservados.
          </span>
          <div className="flex gap-4">
            <Link href="/marketing/terminos" className="hover:text-gray-700">
              Términos y Condiciones
            </Link>
            <Link href="/marketing/privacidad" className="hover:text-gray-700">
              Política de Privacidad
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
