"use client";

import { Plan, PLANS } from "@/app/config/plans";

type PricingSectionProps = {
  onSelectPlan?: (plan: Plan) => void;
  showButtons?: boolean;
  /** Se llama cuando alguien hace clic en un plan sin estar logueado */
  requireAuthNotice?: () => void;
};

export function PricingSection({
  onSelectPlan,
  showButtons = true,
  requireAuthNotice,
}: PricingSectionProps) {
  const buttonBaseClasses =
    "w-full rounded-full py-2 font-semibold transition";
  const enabledClasses = "bg-orange-500 text-black hover:bg-orange-400";
  const visitorClasses =
    "bg-gray-200 text-gray-800 hover:bg-gray-300";

  // helper para manejar click según si hay usuario logueado o no
  const handleClick = (plan: Plan) => {
    if (onSelectPlan) {
      onSelectPlan(plan);
    } else if (requireAuthNotice) {
      requireAuthNotice();
    }
  };

  return (
    <section id="pricing" className="max-w-6xl mx-auto mt-4 mb-20 px-0">
      <div className="rounded-3xl bg-neutral-800/85 text-white px-6 sm:px-10 py-10 sm:py-12 shadow-[0_40px_140px_rgba(0,0,0,0.4)]">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold">Planes y precios</h2>
          <p className="text-gray-300 mt-2">
            Elegí el paquete ideal para tus retratos profesionales.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* BÁSICO */}
          <div
            className="
              group relative overflow-hidden cursor-pointer
              rounded-2xl p-6
              bg-white text-gray-900 border
              shadow-[0_18px_60px_rgba(0,0,0,0.35)]
              transition duration-300
              hover:-translate-y-1 hover:scale-[1.02]
              hover:shadow-[0_26px_90px_rgba(0,0,0,0.55)]
              hover:bg-gray-100
            "
          >
            <div
              className="
                pointer-events-none
                absolute inset-0
                bg-gradient-to-r from-transparent via-white/40 to-transparent
                opacity-0 -translate-x-full
                transition duration-700
                group-hover:opacity-100 group-hover:translate-x-full
              "
            />

            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-1">Básico</h3>
              <p className="text-sm text-gray-500 mb-3">
                Ideal para empezar
              </p>

              <div className="flex items-end gap-2 mb-3">
                <span className="text-3xl font-bold">$12</span>
                <span className="text-gray-400 line-through">$35</span>
              </div>

              <ul className="text-sm text-gray-700 space-y-2 mb-4">
                <li>📸 40 fotos</li>
                <li>⚡ 45 min de generación</li>
                <li>👕 1 atuendo</li>
                <li>🏙 1 fondo</li>
                <li>🖼 Resolución estándar</li>
              </ul>

              <button
                onClick={() => handleClick(PLANS[0])}
                className={`${buttonBaseClasses} ${
                  onSelectPlan ? enabledClasses : visitorClasses
                }`}
              >
                {showButtons ? "Seleccionar" : "Ver detalles"}
              </button>
            </div>
          </div>

          {/* ESTÁNDAR */}
          <div
            className="
              group relative overflow-hidden cursor-pointer
              rounded-2xl p-6 pt-10
              bg-white text-gray-900
              border-2 border-orange-400
              shadow-[0_18px_60px_rgba(0,0,0,0.35)]
              transition duration-300
              hover:-translate-y-1 hover:scale-[1.02]
              hover:shadow-[0_26px_90px_rgba(0,0,0,0.55)]
              hover:bg-gray-100
            "
          >
            <div
              className="
                pointer-events-none
                absolute inset-0
                bg-gradient-to-r from-transparent via-white/40 to-transparent
                opacity-0 -translate-x-full
                transition duration-700
                group-hover:opacity-100 group-hover:translate-x-full
              "
            />

            <div className="absolute top-4 right-4 bg-orange-500 text-black text-[11px] font-semibold px-3 py-1 rounded-full shadow-md">
              Más elegido
            </div>

            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-1">Estándar</h3>
              <p className="text-sm text-gray-500 mb-3">
                Mejor relación calidad / precio
              </p>

              <div className="flex items-end gap-2 mb-3">
                <span className="text-3xl font-bold">$15</span>
                <span className="text-gray-400 line-through">$45</span>
              </div>

              <ul className="text-sm text-gray-700 space-y-2 mb-4">
                <li>📸 60 fotos</li>
                <li>⚡ 30 min de generación</li>
                <li>👕 2 atuendos</li>
                <li>🏙 2 fondos</li>
                <li>🖼 Resolución mejorada</li>
              </ul>

              <button
                onClick={() => handleClick(PLANS[1])}
                className={`${buttonBaseClasses} ${
                  onSelectPlan ? enabledClasses : visitorClasses
                }`}
              >
                {showButtons ? "Seleccionar" : "Ver detalles"}
              </button>
            </div>
          </div>

          {/* EJECUTIVO */}
          <div
            className="
              group relative overflow-hidden cursor-pointer
              rounded-2xl p-6
              bg-white text-gray-900
              border
              shadow-[0_18px_60px_rgba(0,0,0,0.35)]
              transition duration-300
              hover:-translate-y-1 hover:scale-[1.02]
              hover:shadow-[0_26px_90px_rgba(0,0,0,0.55)]
              hover:bg-gray-100
            "
          >
            <div
              className="
                pointer-events-none
                absolute inset-0
                bg-gradient-to-r from-transparent via-white/40 to-transparent
                opacity-0 -translate-x-full
                transition duration-700
                group-hover:opacity-100 group-hover:translate-x-full
              "
            />

            <div className="absolute top-4 right-4 bg-orange-500 text-black text-[11px] font-semibold px-3 py-1 rounded-full shadow-md">
              Mejor valor
            </div>

            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-1">Ejecutivo</h3>
              <p className="text-sm text-gray-500 mb-3">
                Máxima calidad
              </p>

              <div className="flex items-end gap-2 mb-3">
                <span className="text-3xl font-bold">$25</span>
                <span className="text-gray-400 line-through">$75</span>
              </div>

              <ul className="text-sm text-gray-700 space-y-2 mb-4">
                <li>📸 100 fotos</li>
                <li>⚡ 15 min de generación</li>
                <li>👕 Todos los atuendos</li>
                <li>🏙 Todos los fondos</li>
                <li>🖼 Resolución superior</li>
              </ul>

              <button
                onClick={() => handleClick(PLANS[2])}
                className={`${buttonBaseClasses} ${
                  onSelectPlan ? enabledClasses : visitorClasses
                }`}
              >
                {showButtons ? "Seleccionar" : "Ver detalles"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
