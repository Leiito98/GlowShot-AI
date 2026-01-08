"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

type HomeViewProps = {
  onCreateClick: () => void;
};

type UseCaseKey = "linkedin" | "dating" | "social" | "personalBrand";

const USE_CASES: { key: UseCaseKey; label: string }[] = [
  { key: "linkedin", label: "LinkedIn y CV" },
  { key: "dating", label: "Citas (Tinder, Bumble)" },
  { key: "social", label: "Redes sociales" },
  { key: "personalBrand", label: "Marca personal" },
];

// 👇 Tus ejemplos (asegurate que existan en /public/examples)
const EXAMPLE_IMAGES = [
  { src: "/examples/copy1.png", alt: "Retrato profesional 1" },
  { src: "/examples/copy2.png", alt: "Retrato profesional 2" },
  { src: "/examples/copy3.png", alt: "Retrato profesional 3" },
  { src: "/examples/copy4.png", alt: "Retrato profesional 4" },
  { src: "/examples/copy5.png", alt: "Retrato profesional 5" },
  { src: "/examples/copy6.png", alt: "Retrato profesional 6" },
];

type Testimonial = {
  quote: string;
  author: string;
  role: string;
  rating: string;
};

type TestimonialsByUse = Record<UseCaseKey, { items: Testimonial[] }>;

const TESTIMONIALS_BY_USE: TestimonialsByUse = {
  linkedin: {
    items: [
      {
        quote:
          "Las fotos se ven como si me las hubiera hecho un fotógrafo profesional.",
        author: "Tomás",
        role: "Desarrollador",
        rating: "★★★★★ 4.9/5",
      },
      {
        quote: "Me ayudó un montón para mi CV y entrevistas.",
        author: "Lucía",
        role: "Analista contable",
        rating: "★★★★☆ 4.7/5",
      },
    ],
  },

  dating: {
    items: [
      {
        quote: "Las usé para Tinder y me encantaron.",
        author: "Martina",
        role: "Marketing",
        rating: "★★★★★ 5/5",
      },
      {
        quote: "Mucho más prolijas que mis selfies 😂",
        author: "Julián",
        role: "Estudiante",
        rating: "★★★★☆ 4.6/5",
      },
    ],
  },

  social: {
    items: [
      {
        quote: "Perfectas para Instagram y reels.",
        author: "Brenda",
        role: "Creadora de contenido",
        rating: "★★★★★ 5/5",
      },
      {
        quote: "La consistencia entre fotos es tremenda.",
        author: "Leo",
        role: "Freelancer",
        rating: "★★★★☆ 4.8/5",
      },
    ],
  },

  personalBrand: {
    items: [
      {
        quote:
          "Ahora todas mis fotos tienen la misma estética y se nota mucho en mi marca personal.",
        author: "Sofía",
        role: "Consultora de negocios",
        rating: "★★★★★ 5/5",
      },
      {
        quote:
          "Me sirvió para unificar mis fotos en LinkedIn, web y newsletters.",
        author: "Ramiro",
        role: "Coach financiero",
        rating: "★★★★☆ 4.8/5",
      },
    ],
  },
};

export function HomeView({ onCreateClick }: HomeViewProps) {
  const [activeUseCase, setActiveUseCase] = useState<UseCaseKey>("linkedin");

  return (
    <div className="max-w-6xl mx-auto px-6 pt-10 pb-16 space-y-16">
      {/* HERO */}
      <section className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] items-center">
        <div>
          <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-[11px] font-semibold uppercase tracking-wide text-orange-700 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            Nuevo · Generador de retratos IA
          </p>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 mb-4">
            Tus fotos de{" "}
            <span className="text-orange-500">perfil profesional</span> en
            minutos, no en días.
          </h1>

          <p className="text-sm md:text-base text-gray-600 max-w-xl mb-6">
            Convierte tus selfies en retratos con calidad de estudio listos para
            LinkedIn, CV, Instagram o apps de citas. Sin sesiones largas, sin
            cámaras caras, sin salir de casa.
          </p>

          <div className="flex flex-wrap items-center gap-3 mb-5">
            <button
              onClick={onCreateClick}
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm md:text-base font-semibold shadow-lg hover:shadow-orange-200 cursor-pointer transition"
            >
              Crear mis retratos ahora
              <span className="ml-2">→</span>
            </button>

            {/* Hash link a ejemplos */}
            <a
              href="#examples"
              className="text-sm font-semibold text-gray-700 hover:text-gray-900 cursor-pointer"
            >
              Ver ejemplos de fotos
            </a>
          </div>

          <p className="text-[11px] md:text-xs text-gray-400">
            Sin compromiso. Solo pagás cuando quieras generar tus retratos.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4 text-xs text-gray-500">
            <div className="flex -space-x-2">
              <div className="w-7 h-7 rounded-full border border-white overflow-hidden">
                <Image
                  src="/avatars/creator1.png"
                  alt="Usuario AuraShot 1"
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="w-7 h-7 rounded-full border border-white overflow-hidden">
                <Image
                  src="/avatars/creator2.png"
                  alt="Usuario AuraShot 2"
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="w-7 h-7 rounded-full border border-white overflow-hidden">
                <Image
                  src="/avatars/creator3.png"
                  alt="Usuario AuraShot 3"
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <span>
              Probado por creadores, freelancers y profesionales en toda
              Latinoamérica.
            </span>
          </div>
        </div>

        {/* Mockup derecha */}
        <div className="relative">
          <div className="absolute -top-6 -right-4 w-32 h-32 bg-orange-100 rounded-full blur-3xl opacity-70 -z-10" />

          <div className="rounded-3xl bg-white shadow-[0_18px_60px_rgba(0,0,0,0.12)] border border-orange-50 p-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl overflow-hidden border border-gray-100">
                <Image
                  src="/hero-examples/hero1.png"
                  alt="Retrato profesional ejemplo 1"
                  width={500}
                  height={700}
                  className="object-cover w-full h-full"
                />
              </div>

              <div className="rounded-2xl overflow-hidden border border-gray-100">
                <Image
                  src="/hero-examples/hero2.png"
                  alt="Retrato profesional ejemplo 2"
                  width={500}
                  height={700}
                  className="object-cover w-full h-full"
                />
              </div>

              <div className="rounded-2xl overflow-hidden border border-gray-100">
                <Image
                  src="/hero-examples/hero3.png"
                  alt="Retrato profesional ejemplo 3"
                  width={500}
                  height={700}
                  className="object-cover w-full h-full"
                />
              </div>

              <div className="rounded-2xl overflow-hidden border border-gray-100">
                <Image
                  src="/hero-examples/hero4.png"
                  alt="Retrato profesional ejemplo 4"
                  width={500}
                  height={700}
                  className="object-cover w-full h-full"
                />
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-gray-50 border border-dashed border-gray-200 p-3 text-[11px] text-gray-600">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-gray-900 text-xs">
                  Pack profesional listo
                </span>
                <span className="text-[10px] text-orange-600 font-semibold" />
              </div>
              <p>
                20 retratos listos para descargar en alta calidad para todas tus
                redes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section id="how-it-works" className="space-y-6 scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            Consigue tus fotos en{" "}
            <span className="text-orange-500">4 pasos simples</span>.
          </h2>
          <p className="text-sm md:text-base text-gray-600">
            Sin equipos profesionales ni estudio físico. Solo tus selfies y unos
            minutos.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm cursor-pointer">
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-orange-100 text-orange-700 text-sm font-bold mb-3 ">
              1
            </div>
            <h3 className="font-semibold mb-1 text-sm ">Subí tus fotos</h3>
            <p className="text-xs text-gray-500">
              Elige entre 8 y 15 selfies donde se vea bien tu cara. No hace
              falta que sean perfectas.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm cursor-pointer">
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-orange-100 text-orange-700 text-sm font-bold mb-3">
              2
            </div>
            <h3 className="font-semibold mb-1 text-sm">
              Entrenamos tu modelo IA
            </h3>
            <p className="text-xs text-gray-500">
              Creamos un modelo privado solo con tu rostro para mantener la
              coherencia en todas las fotos.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm cursor-pointer">
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-orange-100 text-orange-700 text-sm font-bold mb-3">
              3
            </div>
            <h3 className="font-semibold mb-1 text-sm">
              Elegís estilo y escenario
            </h3>
            <p className="text-xs text-gray-500">
              Oficina, exterior urbano, fondo neutro, citas… combiná atuendos y
              fondos en segundos.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm cursor-pointer">
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-orange-100 text-orange-700 text-sm font-bold mb-3">
              4
            </div>
            <h3 className="font-semibold mb-1 text-sm">
              Descargás tus retratos
            </h3>
            <p className="text-xs text-gray-500">
              Descargá tus fotos en alta calidad y usalas donde quieras:
              LinkedIn, CV, redes sociales o apps de citas.
            </p>
          </div>
        </div>
      </section>

      {/* EJEMPLOS + USOS */}
      <section
        id="examples"
        className="grid gap-10 md:grid-cols-[1.2fr_0.8fr] items-start scroll-mt-24"
      >
        {/* Ejemplos estilo Aragon */}
        <div>
          <h2 className="text-lg font-semibold mb-3">
            Ejemplos de retratos que podés generar
          </h2>
          <p className="text-xs text-gray-500 mb-4 max-w-md">
            Estas imágenes son ilustrativas. Cuando entrenes tu modelo, verás tu
            propio rostro con estos estilos.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {EXAMPLE_IMAGES.map((img, idx) => (
              <div
                key={idx}
                className="
                  relative w-full overflow-hidden 
                  rounded-3xl border border-gray-100 bg-gray-100 
                  shadow-[0_18px_40px_rgba(0,0,0,0.12)]
                  aspect-[4/5]
                "
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
                  priority={idx < 3}
                />

                {/* Badge tipo watermark abajo a la derecha con tu logo */}
                <div className="absolute bottom-3 right-3">
                  <div className="w-7 h-7 rounded-xl bg-white shadow-md border border-gray-200 flex items-center justify-center">
                    <div className="relative w-7 h-7">
                      <Image
                        src="/logo-img.png"
                        alt="AuraShot logo"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Casos de uso + trust */}
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-3">
              Ideal para mejorar tu presencia online
            </h2>

            {/* chips seleccionables */}
            <div className="flex flex-wrap gap-2 mb-3">
              {USE_CASES.map((uc) => {
                const isActive = activeUseCase === uc.key;
                return (
                  <motion.button
                    key={uc.key}
                    type="button"
                    onClick={() => setActiveUseCase(uc.key)}
                    whileHover={{
                      y: -1,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    }}
                    whileTap={{ scale: 0.97 }}
                    className={`px-3 py-1 rounded-full text-xs font-medium border cursor-pointer transition ${
                      isActive
                        ? "bg-orange-50 text-orange-700 border-orange-200"
                        : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
                    }`}
                  >
                    {uc.label}
                  </motion.button>
                );
              })}
            </div>

            <p className="text-xs text-gray-500">
              Usa la misma base de retratos para todos tus perfiles y construí
              una imagen consistente, moderna y profesional.
            </p>
          </div>

          {/* Opiniones dinámicas con animación (esto NO es la sección #reviews; es el box dinámico) */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeUseCase}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-700">
                  Opiniones de usuarios
                </span>
              </div>

              {TESTIMONIALS_BY_USE[activeUseCase].items.map(
                ({ quote, author, role, rating }, idx) => (
                  <div
                    key={idx}
                    className={idx === 0 ? "" : "pt-3 border-t border-gray-100"}
                  >
                    <p className="text-xs text-gray-500 mb-2">“{quote}”</p>

                    <div className="flex items-center justify-between">
                      <p className="text-[11px] text-gray-400">
                        {author} · {role}
                      </p>

                      <span className="text-[10px] text-orange-600 font-semibold">
                        {rating}
                      </span>
                    </div>
                  </div>
                )
              )}
            </motion.div>
          </AnimatePresence>

          <div className="text-[11px] text-gray-400">
            AuraShot no usa tus fotos para entrenar modelos públicos. Tu modelo
            es privado y solo se usa para generar tus retratos.
          </div>
        </div>
      </section>

      {/* PRICING (placeholder mínimo, lo reemplazamos con tu sección real en page.tsx) */}
      <section id="pricing" className="scroll-mt-24">
        {/* Si tu pricing está en otro componente, lo movemos acá */}
      </section>

      {/* REVIEWS (placeholder mínimo, lo reemplazamos con tu sección real en page.tsx) */}
      <section id="reviews" className="scroll-mt-24">
        {/* Si tu bloque de opiniones global está en otro componente, lo movemos acá */}
      </section>
    </div>
  );
}
