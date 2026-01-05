"use client";

type HomeViewProps = {
  onCreateClick: () => void;
};

export function HomeView({ onCreateClick }: HomeViewProps) {
  return (
    <div className="max-w-5xl mx-auto px-6 pt-10">
      {/* Acá podés poner tu contenido de landing/logos/testimonios/etc. */}
    </div>
  );
}
