// app/components/layout/HeaderBar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";

type HeaderBarProps = {
  credits?: number;
};

export function HeaderBar({ credits = 0 }: HeaderBarProps) {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/dashboard");
  const isMyPhotos = pathname.startsWith("/my-photos");

  // Para resaltar el link activo por hash (solo en landing)
  const [hash, setHash] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const update = () => setHash(window.location.hash || "");
    update();

    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);

  const isLanding = pathname === "/";

  const landingLinkClass = (targetHash: string) => {
    const active = isLanding && hash === targetHash;
    return active
      ? "text-[#ff5a1f]"
      : "hover:text-[#ff5a1f] transition-colors cursor-pointer";
  };

  return (
    <header className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-white/95 backdrop-blur-sm sticky top-0 z-30">
      {/* IZQUIERDA — Logo + navegación */}
      <div className="flex items-center gap-6">
        {/* Logo: siempre lleva al home */}
        <Link href="/" className="flex items-center gap-2 cursor-pointer">
          <div className="w-10 h-10 relative">
            <Image
              src="/logo.png"
              alt="AuraShot"
              fill
              sizes="36px"
              className="rounded-full object-cover"
              priority
            />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">
            AuraShot
          </h1>
        </Link>

        {/* Nav DESLOGUEADO: secciones de landing con hash */}
        <SignedOut>
          <nav className="hidden md:flex gap-4 text-sm font-medium text-gray-600">
            <a href="/#how-it-works" className={landingLinkClass("#how-it-works")}>
              Cómo funciona
            </a>
            <a href="/#examples" className={landingLinkClass("#examples")}>
              Ejemplos
            </a>
            <a href="/#pricing" className={landingLinkClass("#pricing")}>
              Precios
            </a>
            <a href="/#examples" className={landingLinkClass("#examples")}>
              Opiniones
            </a>
          </nav>
        </SignedOut>

        {/* Nav LOGUEADO: rutas reales */}
        <SignedIn>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-600">
            <Link
              href="/dashboard"
              className={
                isDashboard
                  ? "text-[#ff5a1f]"
                  : "hover:text-[#ff5a1f] transition-colors"
              }
            >
              Dashboard
            </Link>

            <Link
              href="/my-photos"
              className={
                isMyPhotos
                  ? "text-[#ff5a1f]"
                  : "hover:text-[#ff5a1f] transition-colors"
              }
            >
              Mis retratos
            </Link>
          </nav>
        </SignedIn>
      </div>

      {/* DERECHA — CTA / Créditos / Usuario */}
      <div className="flex items-center gap-3">
        {/* DESLOGUEADO: Iniciar sesión + Comenzar */}
        <SignedOut>
          <SignInButton mode="modal">
            <button className="hidden sm:inline border border-[#ff5a1f] text-[#ff5a1f] px-4 py-2 rounded-full text-sm font-semibold hover:bg-[#fff3ec] transition cursor-pointer">
              Iniciar sesión
            </button>
          </SignInButton>

          <SignInButton mode="modal">
            <button className="bg-[#ff5a1f] text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-[#e04f1b] transition cursor-pointer">
              Comenzar
            </button>
          </SignInButton>
        </SignedOut>

        {/* LOGUEADO: créditos + avatar */}
        <SignedIn>
          {credits > 0 && (
            <div className="bg-orange-50 text-orange-700 px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold border border-orange-100 mr-1">
              📸 {credits} créditos
            </div>
          )}
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </div>
    </header>
  );
}
