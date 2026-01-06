"use client";

import { SignInButton, SignUpButton } from "@clerk/nextjs";

type AuthChoiceModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function AuthChoiceModal({ isOpen, onClose }: AuthChoiceModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-black text-lg font-bold"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-2 text-center">
          Crea tu cuenta para continuar
        </h2>
        <p className="text-sm text-gray-500 mb-6 text-center">
          Para comprar un paquete necesitás una cuenta en GlowShot.
        </p>

        <div className="space-y-3">
          {/* Registrarme */}
          <SignUpButton mode="modal" forceRedirectUrl="/">
            <button className="w-full py-3 rounded-xl bg-[#ff5a1f] text-white font-semibold hover:bg-[#e04f1b] transition">
              Registrarme
            </button>
          </SignUpButton>

          {/* Ya tengo cuenta */}
          <SignInButton mode="modal" forceRedirectUrl="/">
            <button className="w-full py-3 rounded-xl border border-gray-200 text-gray-900 font-semibold hover:bg-gray-50 transition">
              Ya tengo cuenta · Iniciar sesión
            </button>
          </SignInButton>
        </div>

        <p className="text-[11px] text-gray-400 mt-4 text-center">
          Al continuar aceptás nuestros Términos y Política de privacidad.
        </p>
      </div>
    </div>
  );
}
