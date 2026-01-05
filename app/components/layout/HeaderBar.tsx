"use client";

import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

type View = "home" | "upload" | "studio" | "gallery";

type HeaderBarProps = {
  view: View;
  setView: (v: View) => void;
  credits: number;
};

export function HeaderBar({ view, setView, credits }: HeaderBarProps) {
  return (
    <header className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-white sticky top-0 z-30">
      {/* Logo + nombre, clic para ir a Inicio */}
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => setView("home")}
      >
        <div className="w-8 h-8 bg-[#ff5a1f] rounded-full flex items-center justify-center font-bold text-white text-sm">
          A
        </div>
        <h1 className="text-xl font-bold tracking-tight text-gray-900">
          GlowShot.ai
        </h1>
      </div>

      <div className="flex gap-4 items-center">
        <SignedIn>
          {/* Nav solo cuando el usuario está logueado */}
          <nav className="hidden md:flex gap-6 mr-4 text-sm font-medium text-gray-600">
            <button
              onClick={() => setView("home")}
              className={view === "home" ? "text-[#ff5a1f]" : ""}
            >
              Inicio
            </button>
            <button
              onClick={() => setView("studio")}
              className={view === "studio" ? "text-[#ff5a1f]" : ""}
            >
              Estudio
            </button>
            <button
              onClick={() => setView("gallery")}
              className={view === "gallery" ? "text-[#ff5a1f]" : ""}
            >
              Mis Retratos
            </button>

            {/* Link a la landing de precios */}
            <Link
              href="/marketing"
              className="hover:text-[#ff5a1f] transition-colors"
            >
              Precios
            </Link>
          </nav>

          {credits > 0 && (
            <div className="bg-orange-50 text-orange-700 px-4 py-1.5 rounded-full text-sm font-bold border border-orange-100 mr-2">
              📸 {credits} Créditos
            </div>
          )}

          <UserButton afterSignOutUrl="/" />
        </SignedIn>

        <SignedOut>
          {/* Cuando NO está logueado: botón Comenzar + link a Pricing */}
          <div className="flex items-center gap-3">
            <Link
              href="/marketing"
              className="hidden md:inline text-sm font-medium text-gray-600 hover:text-[#ff5a1f] transition-colors"
            >
              Precios
            </Link>

            <SignInButton mode="modal">
              <button className="bg-[#ff5a1f] text-white px-5 py-2 rounded-full font-bold hover:bg-[#e04f1b] transition">
                Comenzar
              </button>
            </SignInButton>
          </div>
        </SignedOut>
      </div>
    </header>
  );
}
