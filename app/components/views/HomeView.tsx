"use client";

type HomeViewProps = {
  onCreateClick: () => void;
};

export function HomeView({ onCreateClick }: HomeViewProps) {
  return (
    <div className="max-w-5xl mx-auto px-6 pt-10">
      {/* Acá podés poner tu contenido de landing/logos/testimonios/etc. */}

      <div className="fixed bottom-10 left-0 right-0 flex justify-center z-40">
        <button
          onClick={onCreateClick}
          className="bg-[#ff5a1f] text-white text-lg font-bold px-10 py-4 rounded-full shadow-xl hover:scale-105"
        >
          Crear Headshots +
        </button>
      </div>
    </div>
  );
}
