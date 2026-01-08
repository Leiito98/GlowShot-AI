// app/components/modals/PayModal.tsx
"use client";

type PayMethod = "mercadopago" | "payu" | "usdt";

type PayModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelectMethod: (method: PayMethod) => void;
};

export function PayModal({ isOpen, onClose, onSelectMethod }: PayModalProps) {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl p-8 md:p-10 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-xl font-bold text-gray-400 hover:text-black"
        >
          ✕
        </button>

        <div className="mb-8 text-center">
          <h2 className="mb-2 text-3xl font-bold">Elegí método de pago</h2>
          <p className="text-gray-500">
            Seleccioná cómo querés pagar tu pack.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card
            title="MercadoPago"
            desc="Tarjeta, débito, transferencia y cuotas en ARS."
            badge="Argentina"
            onClick={() => onSelectMethod("mercadopago")}
          />
          <Card
            title="Pagos internacionales (PayU)"
            desc="Para pagar desde otros países con tarjeta."
            badge="Internacional"
            onClick={() => onSelectMethod("payu")}
          />
          <Card
            title="Pagos crypto (USDT)"
            desc="Pagá con USDT y activamos tu pack manualmente."
            badge="Crypto"
            onClick={() => onSelectMethod("usdt")}
          />
        </div>

        <p className="mt-6 text-xs text-gray-500 text-center">
          Si elegís USDT, te vamos a mostrar la dirección y un ID de pago para validar.
        </p>
      </div>
    </div>
  );
}
