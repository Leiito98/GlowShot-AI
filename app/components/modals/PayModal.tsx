"use client";

import { PLANS, Plan } from "@/app/config/plans";

type PayModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan: (plan: Plan) => void;
};

export function PayModal({ isOpen, onClose, onSelectPlan }: PayModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl p-8 md:p-12 shadow-2xl">
        {/* Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-xl font-bold text-gray-400 hover:text-black"
        >
          ✕
        </button>

        {/* Header */}
        <div className="mb-10 text-center">
          <h2 className="mb-2 text-3xl font-bold">Elegí tu paquete</h2>
          <p className="text-gray-500">Pagás una vez. Sin suscripciones.</p>
        </div>

        {/* Cards de planes */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-2xl border p-8 ${
                plan.highlight
                  ? "border-orange-500 bg-orange-50/10 shadow-xl ring-1 ring-orange-500"
                  : "border-gray-200 bg-white"
              }`}
            >
              {plan.tag && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 transform rounded-full bg-[#ff5a1f] px-4 py-1 text-xs font-bold text-white">
                  {plan.tag}
                </div>
              )}

              <h3 className="mb-2 text-xl font-bold">{plan.name}</h3>

              <div className="mb-6 flex items-end gap-2">
                <span className="text-4xl font-extrabold md:text-5xl">
                  ${plan.price.toFixed(2)}
                </span>
                <span className="mb-1.5 text-lg text-gray-400 line-through">
                  ${plan.originalPrice.toFixed(2)}
                </span>
              </div>

              <ul className="mb-8 flex-1 space-y-4">
                {plan.features.map((f, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 text-sm text-gray-600"
                  >
                    <span className="text-green-500">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => onSelectPlan(plan)}
                className={`w-full rounded-xl py-4 text-sm font-bold ${
                  plan.highlight
                    ? "bg-[#ff5a1f] text-white hover:bg-[#e04f1b]"
                    : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                } transition`}
              >
                Seleccionar
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
