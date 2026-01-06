"use client";

type HomeViewProps = {
  onCreateClick: () => void;
};

export function HomeView({ onCreateClick }: HomeViewProps) {
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
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm md:text-base font-semibold shadow-lg hover:shadow-orange-200 transition"
            >
              Crear mis retratos ahora
              <span className="ml-2">→</span>
            </button>

            <button className="text-sm font-semibold text-gray-700 hover:text-gray-900">
              Ver ejemplos de fotos
            </button>
          </div>

          <p className="text-[11px] md:text-xs text-gray-400">
            Sin compromiso. Solo pagás cuando quieras generar tus retratos.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4 text-xs text-gray-500">
            <div className="flex -space-x-2">
              <div className="w-7 h-7 rounded-full bg-gray-200 border border-white" />
              <div className="w-7 h-7 rounded-full bg-gray-200 border border-white" />
              <div className="w-7 h-7 rounded-full bg-gray-200 border border-white" />
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
              <div className="rounded-2xl overflow-hidden bg-gray-200 aspect-[3/4]" />
              <div className="rounded-2xl overflow-hidden bg-gray-200 aspect-[3/4]" />
              <div className="rounded-2xl overflow-hidden bg-gray-200 aspect-[3/4]" />
              <div className="rounded-2xl overflow-hidden bg-gray-200 aspect-[3/4]" />
            </div>

            <div className="mt-4 rounded-2xl bg-gray-50 border border-dashed border-gray-200 p-3 text-[11px] text-gray-600">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-gray-900 text-xs">
                  Pack profesional listo
                </span>
                <span className="text-[10px] text-orange-600 font-semibold">
                  1 crédito usado
                </span>
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
      <section className="space-y-6">
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
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-orange-100 text-orange-700 text-sm font-bold mb-3">
              1
            </div>
            <h3 className="font-semibold mb-1 text-sm">Subí tus fotos</h3>
            <p className="text-xs text-gray-500">
              Elige entre 8 y 15 selfies donde se vea bien tu cara. No hace
              falta que sean perfectas.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
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

          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
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

          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
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
      <section className="grid gap-10 md:grid-cols-[1.2fr_0.8fr] items-start">
        {/* “Ejemplos” mock */}
        <div>
          <h2 className="text-lg font-semibold mb-3">
            Ejemplos de retratos que podés generar
          </h2>
          <p className="text-xs text-gray-500 mb-4 max-w-md">
            Estas imágenes son ilustrativas. Cuando entrenes tu modelo, verás tu
            propio rostro con estos estilos.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="rounded-2xl bg-gradient-to-br from-orange-100 via-white to-gray-100 aspect-[3/4] border border-gray-100" />
            <div className="rounded-2xl bg-gradient-to-br from-gray-100 via-white to-orange-100 aspect-[3/4] border border-gray-100" />
            <div className="rounded-2xl bg-gradient-to-br from-orange-50 via-white to-gray-100 aspect-[3/4] border border-gray-100" />
            <div className="rounded-2xl bg-gradient-to-br from-gray-100 via-white to-orange-50 aspect-[3/4] border border-gray-100" />
            <div className="rounded-2xl bg-gradient-to-br from-orange-100 via-white to-gray-100 aspect-[3/4] border border-gray-100" />
            <div className="rounded-2xl bg-gradient-to-br from-gray-100 via-white to-orange-100 aspect-[3/4] border border-gray-100" />
          </div>
        </div>

        {/* Casos de uso + trust */}
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-3">
              Ideal para mejorar tu presencia online
            </h2>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-medium border border-orange-100">
                LinkedIn y CV
              </span>
              <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium border border-gray-200">
                Citas (Tinder, Bumble)
              </span>
              <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium border border-gray-200">
                Redes sociales
              </span>
              <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium border border-gray-200">
                Marca personal
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Usa la misma base de retratos para todos tus perfiles y construí
              una imagen consistente, moderna y profesional.
            </p>
          </div>

          <div className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-700">
                Opiniones de usuarios
              </span>
              <span className="text-[11px] text-orange-600 font-semibold">
                ★★★★★ 4.9/5
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              “Las fotos se ven como si me las hubiera hecho un fotógrafo
              profesional. Las usé para LinkedIn y para mis redes, y la diferencia
              fue enorme.”
            </p>
            <p className="text-[11px] text-gray-400">Tomás · Desarrollador</p>
          </div>

          <div className="text-[11px] text-gray-400">
            GlowShot no usa tus fotos para entrenar modelos públicos. Tu modelo
            es privado y solo se usa para generar tus retratos.
          </div>
        </div>
      </section>
    </div>
  );
}
