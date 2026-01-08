"use client";

import { useMemo, useState } from "react";
import { PLANS, Plan } from "@/app/config/plans";

export type PayMethod = "mercadopago" | "payu" | "usdt";

type PayModalProps = {
  isOpen: boolean;
  onClose: () => void;

  /**
   * ✅ Prolijo: el modal devuelve plan + método.
   * Así sirve tanto si el usuario vino sin plan (Comprar créditos)
   * como si ya estaba el plan elegido.
   */
  onSelect: (payload: { plan: Plan; method: PayMethod }) => void;

  /**
   * ✅ Opcional: si querés abrir el modal ya con un plan preseleccionado
   * (por ej desde PricingSection).
   */
  preselectedPlanId?: Plan["id"] | null;
};

export function PayModal({
  isOpen,
  onClose,
  onSelect,
  preselectedPlanId = null,
}: PayModalProps) {
  const [step, setStep] = useState<"plan" | "method">("plan");
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const plans = useMemo(() => PLANS, []);

  // Cuando abre, si viene con plan preseleccionado, saltamos directo a método
  if (isOpen && preselectedPlanId && !selectedPlan) {
    const p = plans.find((x) => x.id === preselectedPlanId) || null;
    if (p) {
      // setState sync-safe: lo hacemos en microtask para no setear durante render
      queueMicrotask(() => {
        setSelectedPlan(p);
        setStep("method");
      });
    }
  }

  if (!isOpen) return null;

  const Card = ({
    title,
    desc,
    badge,
    onClick,
  }: {
    title: string;
    desc: string;
    badge?: string;
    onClick: () => void;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className="text-left w-full rounded-2xl border border-gray-200 bg-white p-6 hover:shadow-lg hover:-translate-y-0.5 transition cursor-pointer"
    >
      {badge && (
        <div className="inline-flex mb-3 rounded-full bg-[#ff5a1f] px-3 py-1 text-[11px] font-bold text-white">
          {badge}
        </div>
      )}
      <h3 className="text-lg font-bold mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{desc}</p>
      <div className="mt-4 text-sm font-semibold text-[#ff5a1f]">
        Continuar →
      </div>
    </button>
  );

  const PlanCard = ({ plan }: { plan: Plan }) => {
    const price = `$${plan.price}`;
    const creditsLabel = `${plan.photos} créditos`;

    return (
      <button
        type="button"
        onClick={() => {
          setSelectedPlan(plan);
          setStep("method");
        }}
        className={`text-left w-full rounded-2xl border p-6 transition cursor-pointer hover:shadow-lg hover:-translate-y-0.5 ${
          plan.highlight
            ? "border-orange-200 bg-orange-50"
            : "border-gray-200 bg-white"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-gray-900">
              {plan.name}
            </div>
            <div className="mt-1 text-2xl font-bold text-gray-900">
              {price}
            </div>
            <div className="mt-1 text-xs text-gray-600">{creditsLabel}</div>
          </div>

          {plan.highlight && (
            <div className="inline-flex rounded-full bg-[#ff5a1f] px-3 py-1 text-[11px] font-bold text-white">
              {plan.tag ?? "Más elegido"}
            </div>
          )}
        </div>

        <ul className="mt-4 space-y-1 text-sm text-gray-700">
          {plan.features.slice(0, 4).map((f, idx) => (
            <li key={idx}>• {f}</li>
          ))}
        </ul>

        <div className="mt-4 text-sm font-semibold text-[#ff5a1f]">
          Elegir pack →
        </div>
      </button>
    );
  };

  const handleClose = () => {
    setStep("plan");
    setSelectedPlan(null);
    onClose();
  };

  const handlePickMethod = (method: PayMethod) => {
    if (!selectedPlan) return;
    onSelect({ plan: selectedPlan, method });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl p-8 md:p-10 shadow-2xl">
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 text-xl font-bold text-gray-400 hover:text-black"
        >
          ✕
        </button>

        {step === "plan" && (
          <>
            <div className="mb-8 text-center">
              <h2 className="mb-2 text-3xl font-bold">Elegí tu pack</h2>
              <p className="text-gray-500">
                Seleccioná el pack para acreditar créditos en tu cuenta.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map((p) => (
                <PlanCard key={p.id} plan={p} />
              ))}
            </div>
          </>
        )}

        {step === "method" && (
          <>
            <div className="mb-8 text-center">
              <h2 className="mb-2 text-3xl font-bold">Elegí método de pago</h2>
              <p className="text-gray-500">
                Pack seleccionado:{" "}
                <span className="font-semibold text-gray-900">
                  {selectedPlan?.name}
                </span>
              </p>

              <button
                type="button"
                onClick={() => setStep("plan")}
                className="mt-3 text-sm text-gray-500 hover:text-black underline"
              >
                Cambiar pack
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card
                title="MercadoPago"
                desc="Tarjeta, débito, transferencia y cuotas en ARS."
                badge="Argentina"
                onClick={() => handlePickMethod("mercadopago")}
              />
              <Card
                title="Pagos internacionales (PayU)"
                desc="Para pagar desde otros países con tarjeta."
                badge="Internacional"
                onClick={() => handlePickMethod("payu")}
              />
              <Card
                title="Pagos crypto (USDT)"
                desc="Pagá con USDT y activamos tu pack manualmente."
                badge="Crypto"
                onClick={() => handlePickMethod("usdt")}
              />
            </div>

            <p className="mt-6 text-xs text-gray-500 text-center">
              Si elegís USDT, te vamos a mostrar la dirección y un ID de pago para
              validar.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
