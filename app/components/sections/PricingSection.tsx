// app/components/sections/PricingSection.tsx
"use client";

import { Plan, PLANS } from "@/app/config/plans";

export type PricingSectionProps = {
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

  const enabledClasses =
    "bg-orange-500 text-black hover:bg-orange-400";

  const visitorClasses =
    "bg-gray-200 text-gray-800 hover:bg-gray-300";

  const handleClick = (plan: Plan) => {
    if (onSelectPlan) {
      onSelectPlan(plan);
      return;
    }
    if (requireAuthNotice) {
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
          {PLANS.map((plan) => (
            <div
              key={plan.id}
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
              {/* Badge (Más elegido / Mejor valor / etc) */}
              {plan.tag && (
                <div className="absolute top-4 right-4 bg-orange-500 text-black text-[11px] font-semibold px-3 py-1 rounded-full shadow-md">
                  {plan.tag}
                </div>
              )}

              <h3 className="text-lg font-bold mb-1">{plan.name}</h3>

              {/* Podés dejar una frase fija o agregar un campo nuevo a Plan más adelante */}
              <p className="text-sm text-gray-500 mb-3">
                {plan.id === "basic" && "Ideal para empezar"}
                {plan.id === "standard" && "Mejor relación calidad / precio"}
                {plan.id === "executive" && "Máxima calidad"}
              </p>

              <div className="flex items-end gap-2 mb-3">
                <span className="text-3xl font-bold">${plan.price}</span>
                <span className="text-gray-400 line-through">
                  ${plan.originalPrice}
                </span>
              </div>

              <ul className="text-sm text-gray-700 space-y-2 mb-4">
                {plan.features.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>

              <button
                onClick={() => handleClick(plan)}
                className={`${buttonBaseClasses} cursor-pointer bg-orange-500 text-black hover:bg-[#e04f1b]": "bg-gray-100 text-gray-900 hover:bg-gray-200"  ${
                  onSelectPlan ? enabledClasses : visitorClasses 
                }`}
              >
                {showButtons ? "Seleccionar" : "Ver detalles"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
