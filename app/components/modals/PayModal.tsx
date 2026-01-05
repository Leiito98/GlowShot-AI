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
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="max-w-5xl w-full bg-white rounded-3xl p-8 md:p-12 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-black text-xl font-bold"
        >
          ✕
        </button>
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-2">Elige tu paquete</h2>
          <p className="text-gray-500">Paga una vez. Sin suscripciones.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl p-8 border flex flex-col ${
                plan.highlight
                  ? "border-orange-500 shadow-xl ring-1 ring-orange-500 bg-orange-50/10"
                  : "border-gray-200 bg-white"
              }`}
            >
              {plan.tag && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#ff5a1f] text-white px-4 py-1 rounded-full text-xs font-bold">
                  {plan.tag}
                </div>
              )}

              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>

              <div className="flex items-end gap-2 mb-6">
                <span className="text-4xl md:text-5xl font-extrabold">
                  ${plan.price.toFixed(2)}
                </span>
                <span className="text-gray-400 line-through mb-1.5 text-lg">
                  ${plan.originalPrice.toFixed(2)}
                </span>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((f, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 text-sm text-gray-600"
                  >
                    <span className="text-green-500">✓</span> {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => onSelectPlan(plan)}
                className={`w-full py-4 rounded-xl font-bold ${
                  plan.highlight
                    ? "bg-[#ff5a1f] text-white hover:bg-[#e04f1b]"
                    : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                }`}
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
